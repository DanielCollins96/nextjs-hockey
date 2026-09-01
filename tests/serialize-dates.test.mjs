import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeDateOnly } from '../lib/format.js';

test('serializeDateOnly turns pg Date objects into YYYY-MM-DD strings', () => {
  assert.equal(serializeDateOnly(new Date('1997-01-13T00:00:00.000Z')), '1997-01-13');
  assert.equal(serializeDateOnly('1997-01-13'), '1997-01-13');
  assert.equal(serializeDateOnly(null), null);
  assert.equal(serializeDateOnly(undefined), null);
  assert.equal(serializeDateOnly(new Date('invalid')), null);
});

test('serialized player and roster rows are JSON-safe for Next.js page props', () => {
  const player = {
    playerId: 8478402,
    birthdate: serializeDateOnly(new Date('1997-01-13T00:00:00.000Z')),
  };
  const skater = {
    playerId: 8478402,
    birthdate: serializeDateOnly(new Date('1997-01-13T00:00:00.000Z')),
  };

  assert.equal(typeof player.birthdate, 'string');
  assert.equal(typeof skater.birthdate, 'string');
  assert.doesNotThrow(() => JSON.parse(JSON.stringify({ person: player, seasons: { 20252026: { skaters: [skater] } } })));
});
