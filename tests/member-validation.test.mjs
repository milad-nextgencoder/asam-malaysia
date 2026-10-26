import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail,registrationError,registrationMessage,profileProgress,safeSiteLink } from '../lib/member/validation.ts';
test('email normalization preserves distinct addresses',()=>{
 assert.equal(normalizeEmail(' AMINA@Example.COM '),'amina@example.com');
 assert.notEqual(normalizeEmail('amina+study@example.com'),normalizeEmail('amina@example.com'));
});
test('registration validates server action input',()=>{
 const valid={email:'amina@example.com',password:'a-long-password',firstName:' Amina ',lastName:' Ahmad '};
 assert.equal(registrationError(valid),null);
 for(const invalid of [{email:'invalid'},{firstName:' '},{password:'short'},{password:'x'.repeat(129)}])assert.ok(registrationError({...valid,...invalid}));
});
test('obfuscated signup never announces a second account or ID',()=>{
 assert.match(registrationMessage({identities:[]}),/existing account/);
 assert.doesNotMatch(registrationMessage({identities:[{}]}),/Account created/);
});
test('profile progress covers every required field',()=>{
 const empty=profileProgress({});assert.equal(empty.total,11);assert.equal(empty.percentage,0);
 const full=Object.fromEntries(empty.missing.map(field=>[field,'valid']));
 assert.equal(profileProgress(full).percentage,100);
 assert.equal(profileProgress({...full,bio:'  '}).missing[0],'bio');
});
test('links reject scripts, protocol-relative URLs, credentials and backslashes',()=>{
 for(const value of ['javascript:alert(1)','//evil.test','/\\evil.test','https://user:pass@example.com','/a\nb'])assert.equal(safeSiteLink(value),null);
 assert.equal(safeSiteLink('/member'),'/member');
 assert.equal(safeSiteLink('https://example.com/path'),'https://example.com/path');
});
