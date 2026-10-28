import test from 'node:test';
import assert from 'node:assert/strict';
import { staffPassword } from './staffCredentials.js';
import { canAccess, visibleMenu } from '../config/roleAccess.js';
test('staff edits omit blank passwords from JSON rather than reset credentials', () => {
  for (const loginPassword of ['', '   ', undefined]) {
    assert.equal(JSON.stringify({ password: staffPassword({ loginPassword }, true) }), '{}');
  }
  assert.equal(staffPassword({loginPassword:'Changed42!'}, true), 'Changed42!');
  assert.equal(staffPassword({}, false), 'password');
});
test('accountant menu exposes finance and blocks staff administration', () => {
  const user = {role:'ACCOUNTANT'};
  for (const key of ['dashboard','fees','fees-collect','accounts','holidays','notice']) assert.equal(canAccess(user,key),true);
  for (const key of ['staff','teachers','hrm','students']) assert.equal(canAccess(user,key),false);
  assert.deepEqual(visibleMenu(user,[{key:'dashboard'},{key:'staff'},{key:'accounts'}]).map(i=>i.key),['dashboard','accounts']);
});
