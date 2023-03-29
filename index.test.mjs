// @ts-check

import assert from 'assert';
import crypto from 'crypto';
import * as hs256 from 'modules/hs256.mjs';
import * as tokens from './utils/tokens.mjs';
import * as index from './index.mjs';

const PGRST_JWT_SECRET = index.PGRST_JWT_SECRET;

{
  console.log('Test: tokens');
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
}

{
  console.log('Test: sign-up');
  const email = crypto.randomBytes(4).toString('hex').concat('@example.com');
  const password = crypto.randomBytes(4).toString('hex');
  const user = await index.email_sign_up(email, password);
  assert(user instanceof Object);
}