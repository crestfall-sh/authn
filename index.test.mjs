// @ts-check

import assert from 'assert';
import crypto from 'crypto';
import * as web from 'modules/web.mjs';
import * as hs256 from 'modules/hs256.mjs';
import * as tokens from './utils/tokens.mjs';
import * as index from './index.mjs';
import redis_client from './utils/redis_client.mjs';

const PGRST_JWT_SECRET = index.PGRST_JWT_SECRET;

{
  console.log('Test: tokens..');
  const user_tokens = await tokens.create_user_tokens(PGRST_JWT_SECRET, {
    sub: 'example-uuid',
  });
  assert(user_tokens instanceof Object);
  assert(typeof user_tokens.access_token === 'string');
  assert(typeof user_tokens.refresh_token === 'string');
  hs256.verify_sig(user_tokens.access_token, PGRST_JWT_SECRET);
  {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const user_tokens2 = await tokens.use_refresh_token(PGRST_JWT_SECRET, user_tokens.refresh_token);
    assert(user_tokens2 instanceof Object);
    assert(typeof user_tokens2.access_token === 'string');
    assert(typeof user_tokens2.refresh_token === 'string');
    hs256.verify_sig(user_tokens2.access_token, PGRST_JWT_SECRET);
  }
  console.log('Test: tokens OK.');
}

{
  const email = crypto.randomBytes(4).toString('hex').concat('@example.com');
  const password = crypto.randomBytes(4).toString('hex');
  {
    console.log('Test: sign-up..');
    const session = await index.email_sign_up(email, password);
    assert(session instanceof Object);
    assert(session.user instanceof Object);
    assert(typeof session.access_token === 'string');
    assert(typeof session.refresh_token === 'string');
    hs256.verify_sig(session.access_token, PGRST_JWT_SECRET);
    console.log('Test: sign-up OK.');
  }
  {
    console.log('Test: sign-in..');
    const session = await index.email_sign_in(email, password);
    assert(session instanceof Object);
    assert(session.user instanceof Object);
    assert(typeof session.access_token === 'string');
    assert(typeof session.refresh_token === 'string');
    hs256.verify_sig(session.access_token, PGRST_JWT_SECRET);
    console.log('Test: sign-in OK.');
  }
}

{
  const email = crypto.randomBytes(4).toString('hex').concat('@example.com');
  const password = crypto.randomBytes(4).toString('hex');
  {
    console.log('Test: HTTP sign-up..');
    const response = await fetch('http://localhost:8080/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ email, password }),
    });
    assert(response.status === 200);
    assert(response.headers.has('content-type') === true);
    assert(response.headers.get('content-type').includes('application/json') === true);
    const response_body = await response.json();
    assert(response_body instanceof Object);
    assert(response_body.session instanceof Object);
    assert(response_body.session.user instanceof Object);
    assert(typeof response_body.session.access_token === 'string');
    assert(typeof response_body.session.refresh_token === 'string');
    console.log('Test: HTTP sign-up OK.');
  }
  {
    console.log('Test: HTTP sign-in..');
    const response = await fetch('http://localhost:8080/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ email, password }),
    });
    assert(response.status === 200);
    assert(response.headers.has('content-type') === true);
    assert(response.headers.get('content-type').includes('application/json') === true);
    const response_body = await response.json();
    assert(response_body instanceof Object);
    assert(response_body.session instanceof Object);
    assert(response_body.session.user instanceof Object);
    assert(typeof response_body.session.access_token === 'string');
    assert(typeof response_body.session.refresh_token === 'string');
    console.log('Test: HTTP sign-in OK.');
  }
  {
    console.log('Test: HTTP sign-in with wrong password..');
    const response = await fetch('http://localhost:8080/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ email, password: 'wrong password' }),
    });
    assert(response.status === 400);
    const response_body = await response.text();
    assert(response_body === 'ERR_INVALID_CREDENTIALS');
    console.log('Test: HTTP sign-in with wrong password OK.');
  }
}

console.log('Closing HTTP server..');
web.uws.us_listen_socket_close(index.app_token);

console.log('Closing redis client..');
redis_client.connection.end();

console.log('OK.');
