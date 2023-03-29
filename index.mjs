// @ts-check

import fs from 'fs';
import url from 'url';
import path from 'path';
import assert from 'assert';
import crypto from 'crypto';
import * as web from 'modules/web.mjs';
import * as hs256 from 'modules/hs256.mjs';
import lenv from 'modules/lenv.mjs';
import * as casefold from 'modules/casefold.mjs';
import * as scrypt from './utils/scrypt.mjs';
import * as tokens from './utils/tokens.mjs';
import * as postgrest from './utils/postgrest.mjs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load .env into process.env
lenv(path.join(__dirname, '.env'));

// load PGRST_JWT_SECRET
const PGRST_JWT_SECRET = process.env['PGRST_JWT_SECRET'];
assert(typeof PGRST_JWT_SECRET === 'string');

// set postgrest default options
postgrest.default_options.token = await tokens.create_admin_token(PGRST_JWT_SECRET);
postgrest.default_options.headers['Accept-Profile'] = 'private';
postgrest.default_options.headers['Content-Profile'] = 'private';

{
  const user_tokens = await tokens.create_user_tokens(PGRST_JWT_SECRET, {
    sub: 'example-uuid',
  });
  console.log({ user_tokens });
  console.log(hs256.read_token(user_tokens.access_token));
  {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const user_tokens2 = await tokens.use_refresh_token(PGRST_JWT_SECRET, user_tokens.refresh_token);
    console.log({ user_tokens2 });
    console.log(hs256.read_token(user_tokens2.access_token));
  }
}



/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
const email_sign_up = async (email, password) => {
  assert(typeof email === 'string');
  assert(typeof password === 'string');

  const email_normalized = casefold.full_casefold_normalize_nfkc(email);
  const password_normalized = password.normalize('NFKC');

  {
    // Check if email is already used
    const response = await postgrest.request({
      pathname: '/users',
      search: { email: `eq.${email_normalized}` },
    });
    assert(response.status === 200, 'ERR_PGRST_INVALID_RESPONSE_STATUS');
    assert(response.body instanceof Array, 'ERR_PGRST_INVALID_RESPONSE_BODY');
    assert(response.body.length === 0, 'ERR_EMAIL_ALREADY_USED');
  }
  {
    // Create user account
    const email_verification_code = crypto.randomBytes(32).toString('hex');
    const password_salt = scrypt.salt();
    const password_hash_buffer = scrypt.derive(password_normalized, password_salt);
    const password_hash = password_hash_buffer.toString('hex');
    /**
     * @type {import('./index').user}
     */
    const user = {
      id: undefined,
      email: email_normalized,
      email_verification_code: email_verification_code,
      email_verified_at: undefined,
      email_recovery_code: undefined,
      email_recovered_at: undefined,
      phone: undefined,
      phone_verification_code: undefined,
      phone_verified_at: undefined,
      phone_recovery_code: undefined,
      phone_recovered_at: undefined,
      password_salt: password_salt,
      password_hash: password_hash,
      created_at: undefined, // use default value in schema
      updated_at: undefined, // use default value in schema
      metadata: undefined,
    };
    const response = await postgrest.request({
      method: 'POST',
      pathname: '/users',
      headers: { 'Prefer': 'return=representation' },
      body: user,
    });
    assert(response.status === 201);
    assert(response.body instanceof Array);
    const inserted_user = response.body[0];
    assert(inserted_user instanceof Object);
    console.log({ inserted_user });
    Object.assign(user, inserted_user);
    user.email_verification_code = null;
    user.email_recovery_code = null;
    user.phone_verification_code = null;
    user.phone_recovery_code = null;
    user.password_salt = null;
    user.password_hash = null;
    console.log({ user });
  }

  // check if email is valid string
  // normalize email
  // check if email is unused
  // check if password length is ideal.

  return null;
};

{
  console.log('Signing-up..');
  const email = crypto.randomBytes(4).toString('hex').concat('@example.com');
  const password = crypto.randomBytes(4).toString('hex');
  console.log({ email, password });
  email_sign_up(email, password);
}

/**
 * @param {string} phone
 * @param {string} password
 * @returns {Promise<void>}
 */
const phone_sign_up = async (phone, password) => {
  assert(typeof phone === 'string');
  assert(typeof password === 'string');
  // check if phone is valid string
  // normalize phone
  // check if phone is unused
  // check if password length is ideal.
  return null;
};

const app = web.uws.App({});

web.http(app, web.port_access_types.EXCLUSIVE, 8080);
