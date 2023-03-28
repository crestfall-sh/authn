// @ts-check

/**
 * To do:
 * - [ ] create refresh token
 * - [ ] store refresh token with expiry in redis
 * - [ ] create use_refresh_token function
 */

import assert from 'assert';
import * as luxon from 'luxon';
import * as hs256 from 'modules/hs256.mjs';

/**
 * exp: defaults to T + 15 Minutes
 * sub, role, email, scopes: defaults to null
 * @param {string} secret_b64
 * @param {import('modules/hs256').payload} payload_override
 * @returns {Promise<string>}
 */
export const hs256_create_token = async (secret_b64, payload_override) => {
  assert(typeof secret_b64 === 'string');
  assert(payload_override instanceof Object);
  /**
   * @type {import('modules/hs256').header}
   */
  const header = { alg: 'HS256', typ: 'JWT' };
  /**
   * @type {import('modules/hs256').payload}
   */
  const payload = {
    iat: Math.trunc(luxon.DateTime.now().toSeconds()),
    nbf: Math.trunc(luxon.DateTime.now().toSeconds()),
    exp: Math.trunc(luxon.DateTime.now().plus({ minutes: 15 }).toSeconds()),
    iss: 'crestfall',
    aud: 'crestfall',
    sub: null,
    role: null,
  };
  Object.assign(payload, payload_override);
  const token = hs256.create_token(header, payload, secret_b64);
  return token;
};

export default hs256_create_token;