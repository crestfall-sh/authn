// @ts-check

import assert from 'assert';

/**
 *
 * @param {{
*  protocol: string,
*  hostname: string,
*  port: number,
*  pathname: string,
*  method: string,
*  headers: Record<string, string>,
*  search: Record<string, string>,
*  body?: Record<string, any>,
*  token: string,
* }} options
*/
export const postgrest_request = async (options) => {
  // host, pathname, method, headers, query, body
  assert(options instanceof Object);
  assert(typeof options.protocol === 'string');
  assert(typeof options.hostname === 'string');
  assert(typeof options.port === 'number');
  assert(typeof options.token === 'string');
  assert(options.method === undefined || typeof options.method === 'string');
  assert(options.headers === undefined || options.headers instanceof Object);
  assert(typeof options.pathname === 'string');
  assert(options.search === undefined || options.search instanceof Object);
  const token = options.token;
  const method = options.method || 'GET';
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${token}`,
    'Accept-Profile': 'public', // For GET or HEAD
    'Content-Profile': 'public', // For POST, PATCH, PUT and DELETE
  };
  if (options.headers instanceof Object) {
    Object.assign(headers, options.headers);
  }
  const url = new URL(`${options.protocol}://${options.hostname}:${options.port}`);
  url.pathname = options.pathname;
  if (options.search instanceof Object) {
    url.search = new URLSearchParams(options.search).toString();
  }
  let body = undefined;
  if (method !== 'HEAD' && method !== 'GET') {
    if (options.body instanceof Object) {
      body = JSON.stringify(options.body);
    }
  }
  console.log({
    method: method,
    headers: headers,
    body: body,
  });
  const response = await fetch(url, {
    method: method,
    headers: headers,
    body: body,
    mode: 'cors',
    credentials: 'include',
  });
  assert(response.headers.has('content-type') === true);
  assert(response.headers.get('content-type').includes('application/json') === true || response.headers.get('content-type').includes('application/openapi+json') === true);
  return {
    status: response.status,
    headers: response.headers,
    body: await response.json(),
  };
};

export default postgrest_request;