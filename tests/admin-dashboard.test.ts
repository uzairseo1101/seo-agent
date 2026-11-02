import test from 'node:test';
import assert from 'node:assert';
import { db } from '../lib/db';
import { storage } from '../lib/storage';

test('Admin Console & Database Layer Verification', async () => {
  // Test 1: Fetch profiles
  const profiles = await db.getProfiles();
  assert.ok(Array.isArray(profiles), 'Profiles must be returned as array');
  assert.ok(profiles.length > 0, 'Must contain initial users');

  const targetUser = profiles[0];
  assert.ok(targetUser.email, 'User must have email');

  // Test 2: Role modification
  const roleUpdateResult = await db.updateProfileRole(targetUser.id, 'admin');
  assert.strictEqual(roleUpdateResult, true, 'Role update must succeed');

  // Test 3: Activity logging
  await db.logActivity('test_admin_action', 'system', 'sys-1', { test: true });
  const logs = await db.getActivityLogs(10);
  assert.ok(Array.isArray(logs), 'Logs must be returned as an array');
  assert.ok(logs.length > 0, 'Must contain activity logs');

  // Test 4: Website CRUD via db
  const site = await db.createWebsite({
    name: 'Admin Test Property',
    domain: 'admintest.io',
    url: 'https://admintest.io',
  });
  assert.ok(site.id, 'Must generate valid ID');
  assert.strictEqual(site.domain, 'admintest.io');

  const retrieved = await db.getWebsiteById(site.id);
  assert.ok(retrieved, 'Must be retrievable by ID');
  assert.strictEqual(retrieved?.id, site.id);

  // Test 5: Clean delete
  const deleted = await db.deleteWebsite(site.id);
  assert.strictEqual(deleted, true);
});
