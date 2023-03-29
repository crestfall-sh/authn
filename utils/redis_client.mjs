// @ts-check

import * as redis from 'modules/redis.mjs';

const redis_client = redis.connect('localhost', 6379);

await new Promise((resolve) => redis_client.events.on('ready', resolve));

export default redis_client;
