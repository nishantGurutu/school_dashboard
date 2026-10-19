export const sameId = (left, right) => left != null && right != null && String(left) === String(right);

export function trackingDataForBus(bus, liveBuses, routes, assignments = []) {
  const busId = bus.busId ?? bus.id;
  const live = liveBuses.find(item => sameId(item.busId, busId)) ?? null;
  const assignment = assignments.find(item => sameId(item.busId, busId) && item.status === 'ACTIVE');
  // The active trip's route wins over an older bus assignment.
  const routeId = live?.routeId ?? bus.assignedRouteId ?? bus.routeId ?? assignment?.routeId;
  const route = routeId == null ? null : routes.find(item => sameId(item.id, routeId)) ?? null;
  return { live, route };
}

export function coordinates(latitude, longitude) {
  if (latitude == null || longitude == null || latitude === '' || longitude === '') return null;
  const lat = Number(latitude), lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    ? [lat, lng] : null;
}

export function orderedStops(route) {
  return [...(route?.stops ?? [])].filter(stop => coordinates(stop.latitude, stop.longitude))
    .sort((a, b) => Number(a.stopOrder ?? 0) - Number(b.stopOrder ?? 0));
}
