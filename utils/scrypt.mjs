// @ts-check

import assert from 'assert';
import crypto from 'crypto';

const length = 64;

/**
 * - https://words.filippo.io/the-scrypt-parameters/
 * @type {import('crypto').ScryptOptions}
 */
const options = { N: 2 ** 15, p: 1, maxmem: 128 * (2 ** 16) * 8 };

/**
 * @returns {string}
 */
export const salt = () => crypto.randomBytes(32).toString('hex');

/**
 * @param {string} password utf-8 nfkc
 * @param {string} password_salt hex-encoded
 * @returns {Buffer}
 */
export const derive = (password, password_salt) => {
  assert(typeof password === 'string');
  assert(typeof password_salt === 'string');
  /**
   * @type {Buffer}
   */
  const password_key_buffer = crypto.scryptSync(Buffer.from(password), Buffer.from(password_salt, 'hex'), length, options);
  return password_key_buffer;
};

export const compare = crypto.timingSafeEqual;
