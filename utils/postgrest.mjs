// @ts-check

/**
 * PostgREST Client
 */

import assert from 'assert';
import _ from 'lodash';

/**
 * @type {import('./postgrest').options}
 */
export const default_options = {
  protocol: 'http',
  hostname: 'localhost',
  port: 5433,
  pathname: null,
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'Accept-Profile': 'public', // For GET or HEAD
    'Content-Profile': 'public', // For POST, PATCH, PUT and DELETE
  },
  search: {},
  body: null,
  token: null,
};

/**
 * @type {import('./postgrest').request}
*/
export const request = async (partial_options) => {
  const options = _.merge(_.cloneDeep(default_options), partial_options);
  assert(options instanceof Object);
  assert(typeof options.protocol === 'string');
  assert(typeof options.hostname === 'string');
  assert(typeof options.port === 'number');
  assert(typeof options.method === 'string');
  assert(options.headers instanceof Object);
  assert(typeof options.pathname === 'string');
  assert(options.search instanceof Object);
  assert(typeof options.token === 'string');
  const token = options.token;
  const method = options.method || 'GET';
  options.headers['Authorization'] = `Bearer ${token}`;
  const url = new URL(`${options.protocol}://${options.hostname}:${options.port}`);
  url.pathname = options.pathname;
  if (options.search instanceof Object) {
    url.search = new URLSearchParams(options.search).toString();
  }
  if (options.body instanceof Object) {
    assert(method !== 'HEAD');
    assert(method !== 'GET');
    options.body = JSON.stringify(options.body);
  }
  const response = await fetch(url, {
    method: method,
    headers: options.headers,
    body: options.body,
    credentials: 'include',
    mode: 'cors',
  });
  assert(response.headers.has('content-type') === true);
  assert(response.headers.get('content-type').includes('application/json') === true || response.headers.get('content-type').includes('application/openapi+json') === true);
  return {
    status: response.status,
    headers: response.headers,
    body: await response.json(),
  };
};
