// @ts-check

import url from 'url';
import path from 'path';
import assert from 'assert';
import crypto from 'crypto';
import lenv from 'modules/lenv.mjs';
import * as web from 'modules/web.mjs';
import * as casefold from 'modules/casefold.mjs';
import * as scrypt from './utils/scrypt.mjs';
import * as tokens from './utils/tokens.mjs';
import * as postgrest from './utils/postgrest.mjs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load .env into process.env
lenv(path.join(__dirname, '.env'));

// load PGRST_JWT_SECRET
export const PGRST_JWT_SECRET = process.env['PGRST_JWT_SECRET'];
assert(typeof PGRST_JWT_SECRET === 'string');

// set postgrest default options
postgrest.default_options.token = await tokens.create_admin_token(PGRST_JWT_SECRET);
postgrest.default_options.headers['Accept-Profile'] = 'private';
postgrest.default_options.headers['Content-Profile'] = 'private';

/**
 * @type {import('./index').email_sign_up}
 */
export const email_sign_up = async (email, password) => {
  assert(typeof email === 'string');
  assert(typeof password === 'string');
  assert(password.length >= 8, 'Invalid password, must be at least eight (8) characters.');
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
    Object.assign(user, inserted_user);
    user.email_verification_code = null;
    user.email_recovery_code = null;
    user.phone_verification_code = null;
    user.phone_recovery_code = null;
    user.password_salt = null;
    user.password_hash = null;
    return user;
  }
};

const app = web.uws.App({});

export const app_token = await web.http(app, web.port_access_types.EXCLUSIVE, 8080);
