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
import * as hs256 from 'modules/hs256.mjs';
import * as web from 'modules/web.mjs';
import lenv from 'modules/lenv.mjs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = lenv(path.join(__dirname, '.env'));
if (env.get('CRESTFALL_ENVIRONMENT') === 'development') {
  console.log({ env });
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
