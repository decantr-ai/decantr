import { readNpmAuthState } from './npm-surface-lib.mjs';

const auth = readNpmAuthState();

console.log('# npm Auth Audit');
console.log('');
console.log(`- Authenticated: ${auth.authenticated ? 'yes' : 'no'}`);
if (auth.username) {
  console.log(`- Username: ${auth.username}`);
}
if (!auth.authenticated && auth.error) {
  console.log(`- Error: ${auth.error}`);
}

if (!auth.authenticated) {
  process.exitCode = 1;
}
