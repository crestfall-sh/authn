// @ts-check

import * as redis from 'modules/redis.mjs';

export const redisc = redis.connect('localhost', 6379);
await new Promise((resolve) => redisc.events.on('ready', resolve));

{
  const get_response = await redis.exec(redisc, 'GET', 'non-existent');
  console.log({ get_response });
  const exists_response = await redis.exec(redisc, 'EXISTS', 'non-existent');
  console.log({ exists_response });
  const keys = await redis.exec(redisc, 'KEYS', '*');
  console.log({ keys });
}

export default redisc;
