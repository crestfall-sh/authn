// @ts-check

import fs from 'fs';
import url from 'url';
import path from 'path';
import assert from 'assert';
import * as web from 'modules/web.mjs';
import * as hs256 from 'modules/hs256.mjs';
import lenv from 'modules/lenv.mjs';
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

{
  const email = 'user@example.com';
  const response = await postgrest.request({
    pathname: '/users',
    search: { email: `eq.${email}` },
  });
  console.log({ response });
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<void>}
 */
const email_sign_up = async (email, password) => {
  assert(typeof email === 'string');
  assert(typeof password === 'string');
  // check if email is valid string
  // normalize email
  // check if email is unused
  // check if password length is ideal.

  return null;
};

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
