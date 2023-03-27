// @ts-check

import fs from 'fs';
import url from 'url';
import path from 'path';
import * as hs256 from 'modules/hs256.mjs';
import * as web from 'modules/web.mjs';
import lenv from 'modules/lenv.mjs';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = lenv(path.join(__dirname, '.env'));
console.log({ env });