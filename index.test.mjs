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
    await new Promise((resolve) => setTimeout(resolve, 2500));
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

console.log('Closing HTTP server..');
web.uws.us_listen_socket_close(index.app_token);

console.log('Closing redis client..');
redis_client.connection.end();

console.log('OK.');
