import test from 'node:test';
import assert from 'node:assert/strict';

import {
  adaptMatchCollection,
  adaptMatchRecord,
} from '../src/data/adapters/canonicalMatchAdapter.js';
import {
  CANONICAL_EXTERNAL_ID_FIELDS,
  CANONICAL_NULLABLE_STAT_FIELDS,
} from '../src/data/schema/canonicalMatchSchema.js';

test('canonical adapter normalizes missing nullable fields without erasing observed zero', () => {
  const raw = {
    id: 'match-1',
    tries: 0,
    metres: '',
    external: { rugbyComAu: '12345' },
  };

  const adapted = adaptMatchRecord(raw, { providerId: 'test-provider' });

  assert.equal(adapted.tries, 0);
  assert.equal(adapted.metres, null);

  for (const field of CANONICAL_NULLABLE_STAT_FIELDS) {
    assert.ok(Object.hasOwn(adapted, field));
    assert.notEqual(adapted[field], undefined);
  }

  for (const field of CANONICAL_EXTERNAL_ID_FIELDS) {
    assert.ok(Object.hasOwn(adapted.external, field));
    assert.notEqual(adapted.external[field], undefined);
  }

  assert.equal(adapted.external.rugbyComAu, '12345');
  assert.equal(adapted.external.svns, null);
  assert.equal(adapted.external.rugbyPass, null);

  assert.equal(raw.metres, '');
  assert.deepEqual(raw.external, { rugbyComAu: '12345' });
});

test('canonical adapter converts collections and rejects invalid provider output', () => {
  const collection = adaptMatchCollection([
    { id: 'one', carries: 3 },
    { id: 'two', carries: null },
  ]);

  assert.equal(collection.length, 2);
  assert.equal(collection[0].carries, 3);
  assert.equal(collection[1].carries, null);

  assert.throws(
    () => adaptMatchRecord(null, { providerId: 'test-provider' }),
    /Invalid match record/
  );
  assert.throws(
    () => adaptMatchCollection({}, { providerId: 'test-provider' }),
    /non-array/
  );
});
