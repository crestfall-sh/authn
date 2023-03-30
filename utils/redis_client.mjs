// @ts-check

import * as redis from 'modules/redis.mjs';

const REDIS_HOST = process.env['REDIS_HOST'] || 'localhost';

const redis_client = redis.connect(REDIS_HOST, 6379);

await new Promise((resolve) => redis_client.events.on('ready', resolve));

export default redis_client;
