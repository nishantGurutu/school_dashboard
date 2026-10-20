import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('available buses excludes assigned and unavailable buses and rejects old API responses', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { default: network } = await server.ssrLoadModule('/src/services/networkService.js');
    const { staffService } = await server.ssrLoadModule('/src/services/staffService.js');
    const get = network.get;
    try {
      network.get = async (_url, _params, options) => {
        assert.equal(options.cache, 'no-store');
        return [
          { id: 1, status: 'ACTIVE', assignmentStatus: 'AVAILABLE', availableForAssignment: true },
          { id: 2, status: 'ACTIVE', assignmentStatus: 'ASSIGNED', availableForAssignment: false },
          { id: 3, status: 'MAINTENANCE', assignmentStatus: 'AVAILABLE', availableForAssignment: false },
        ];
      };
      assert.deepEqual((await staffService.availableBuses()).map(bus => bus.id), [1]);
      network.get = async () => [{ id: 1, status: 'ACTIVE' }];
      await assert.rejects(staffService.availableBuses(), /updated backend/);
    } finally { network.get = get; }
  } finally { await server.close(); }
});
