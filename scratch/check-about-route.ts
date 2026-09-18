import * as dotenv from 'dotenv';

require.cache[require.resolve('server-only')] = {
  id: require.resolve('server-only'),
  filename: require.resolve('server-only'),
  loaded: true,
  exports: {},
} as unknown as NodeModule;

dotenv.config({ path: '.env.local' });
dotenv.config();

import { resolveContent } from '../src/lib/routing/resolve-content';
import { getLegacyRedirect } from '../src/lib/routing/redirects';

console.log('resolveContent("ve-chung-toi"):', resolveContent('ve-chung-toi'));
console.log('resolveContent("ve-doctor-check"):', resolveContent('ve-doctor-check'));
console.log('getLegacyRedirect("ve-chung-toi"):', getLegacyRedirect('ve-chung-toi'));
