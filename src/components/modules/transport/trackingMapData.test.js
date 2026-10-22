import test from 'node:test';
import assert from 'node:assert/strict';
import { selectBusTrip, recordedRouteFitKey, trackingDataForBus, coordinates, orderedStops } from './trackingMapData.js';

test('selected bus matches by ID and active trip route wins', () => {
  const bus = { id: '2', assignedRouteId: 10, busNumber: 'duplicate name' };
  const live = [{ busId: 1, routeId: 10 }, { busId: 2, routeId: '20' }];
  const routes = [{ id: 10 }, { id: 20 }];
  const result = trackingDataForBus(bus, live, routes);
  assert.equal(result.live.busId, 2);
  assert.equal(result.route.id, 20);
  assert.equal(trackingDataForBus({ id: 99 }, live, routes).route, null);
});
test('inactive bus uses its own assignment; malformed coordinates are rejected', () => {
  const result = trackingDataForBus({ id: 2 }, [], [{ id: 30 }],
    [{ busId: 1, routeId: 10, status: 'ACTIVE' }, { busId: '2', routeId: 30, status: 'ACTIVE' }]);
  assert.equal(result.route.id, 30);
  assert.deepEqual(coordinates(0, 0), [0, 0]);
  assert.equal(coordinates(null, 5), null);
  assert.equal(coordinates('bad', 5), null);
  assert.equal(coordinates(95, 5), null);
});
test('route markers preserve stop order and discard missing GPS', () => {
  assert.deepEqual(orderedStops({ stops: [
    { id: 2, stopOrder: 2, latitude: 25, longitude: 85 },
    { id: 3, stopOrder: 3, latitude: null, longitude: 85 },
    { id: 1, stopOrder: 1, latitude: 26, longitude: 86 },
  ] }).map(s => s.id), [1, 2]);
});

const trips = [
  { tripId: 10, busId: 3, tripDate: '2026-10-21', status: 'COMPLETED' },
  { tripId: 13, busId: 99, tripDate: '2026-10-22', status: 'IN_PROGRESS' },
  { tripId: 12, busId: 3, tripDate: '2026-10-22', status: 'COMPLETED' },
];

test('bus map opens latest saved trip, excluding other buses', () => {
  assert.equal(selectBusTrip(trips, '3'), '12');
  assert.equal(selectBusTrip(trips, 3, '10'), '12');
  assert.equal(selectBusTrip(trips, 4), '');
});

test('active journey wins, while an explicitly chosen old trip remains selected', () => {
  const active = [...trips, { tripId: 14, busId: 3, tripDate: '2026-10-22', status: 'IN_PROGRESS' }];
  assert.equal(selectBusTrip(active, 3), '14');
  assert.equal(selectBusTrip(active, 3, '10', false), '10');
  assert.equal(selectBusTrip(active, 3, '999', false), '14');
});

test('map fits again when completion replaces the start point with the full GPS route', () => {
  const start = [[28.6, 77.0]];
  const saved = [...start, [28.61, 77.01], [28.62, 77.02]];
  assert.notEqual(recordedRouteFitKey(12, true, start), recordedRouteFitKey(12, false, start));
  assert.notEqual(recordedRouteFitKey(12, false, start), recordedRouteFitKey(12, false, saved));
  assert.notEqual(recordedRouteFitKey(12, true, []), recordedRouteFitKey(12, true, start));
});
