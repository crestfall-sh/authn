// @ts-check

/**
 * - [ ] load jwt secret from .env
 * - [ ] test connection with postgrest
 * - [ ] test sign-up
 * - [ ] test sign-in
 * - [ ] complete all authentication-related functions here.
 */

import fs from 'fs';
import url from 'url';
import path from 'path';
import assert from 'assert';
import * as web from 'modules/web.mjs';
import * as hs256 from 'modules/hs256.mjs';
import lenv from 'modules/lenv.mjs';
import hs256_create_token from './utils/hs256_create_token.mjs';
import * as postgrest from './utils/postgrest.mjs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

lenv(path.join(__dirname, '.env'));

const PGRST_JWT_SECRET = process.env['PGRST_JWT_SECRET'];
assert(typeof PGRST_JWT_SECRET === 'string');
console.log({ PGRST_JWT_SECRET });

/**
 * @param {string} refresh_token
 */
const use_refresh_token = async (refresh_token) => {

};

const admin_token = await hs256_create_token(PGRST_JWT_SECRET, { exp: null, role: 'admin' });
console.log({ admin_token });
console.log(hs256.read_token(admin_token));

postgrest.default_options.token = admin_token;
postgrest.default_options.headers['Accept-Profile'] = 'private';
postgrest.default_options.headers['Content-Profile'] = 'private';

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
