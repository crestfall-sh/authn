// @ts-check

/**
 * Note
 * - If access_token is expired, return 401 (https://httpstatuses.io/401).
 * - This way, the client should refresh the tokens and retry.
 * - Better approach: the client checks first if the access token is expired.
 */

import assert from 'assert';
import crypto from 'crypto';
import * as luxon from 'luxon';
import * as hs256 from 'modules/hs256.mjs';
import * as redis from 'modules/redis.mjs';
import redis_client from './redis_client.mjs';

/**
 * @param {string} secret_b64
 * @returns {Promise<string>}
 */
export const create_admin_token = async (secret_b64) => {
  assert(typeof secret_b64 === 'string');
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
    exp: null,
    iss: 'crestfall',
    aud: 'crestfall',
    sub: null,
    role: 'admin',
  };
  const admin_token = hs256.create_token(header, payload, secret_b64);
  return admin_token;
};

/**
 * exp: defaults to T + 15 Minutes
 * sub, role, email, scopes: defaults to null
 * @param {string} secret_b64
 * @param {import('modules/hs256').payload} payload_override
 * @returns {Promise<{ access_token: string, refresh_token: string }>}
 */
export const create_user_tokens = async (secret_b64, payload_override) => {
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
    role: 'authenticated',
  };
  Object.assign(payload, payload_override);
  const access_token = hs256.create_token(header, payload, secret_b64);
  const refresh_token = crypto.randomBytes(32).toString('hex');
  const refresh_token_sub = payload.sub;
  const refresh_token_exp = luxon.DateTime.fromSeconds(payload.iat).plus({ hours: 6 }).toSeconds();
  const set_response = await redis.exec(redis_client, 'SET', refresh_token, String(refresh_token_sub), 'EXAT', String(refresh_token_exp));
  assert(set_response === 'OK');
  const user_tokens = { access_token, refresh_token };
  return user_tokens;
};

/**
 * @param {string} secret_b64
 * @param {string} refresh_token
 */
export const use_refresh_token = async (secret_b64, refresh_token) => {
  const get_response = await redis.exec(redis_client, 'GET', refresh_token);
  assert(typeof get_response === 'string');
  const del_response = await redis.exec(redis_client, 'DEL', refresh_token);
  assert(del_response === 1);
  const refresh_token_sub = get_response;
  const user_tokens = await create_user_tokens(secret_b64, { sub: refresh_token_sub });
  return user_tokens;
};
