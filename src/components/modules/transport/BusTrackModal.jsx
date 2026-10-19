import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { X, LocateFixed } from 'lucide-react';
import { coordinates, orderedStops, sameId } from './trackingMapData';

/** Bus positions come only from that bus's telemetry, never the viewer's GPS. */
export const BusTrackModal = ({ isOpen, onClose, bus, route, driver, liveData }) => {
  const container = useRef(null);
  const mapRef = useRef(null);
  const routeLayer = useRef(null);
  const markerRef = useRef(null);
  const fittedRoute = useRef(null);
  const [roadPath, setRoadPath] = useState(null);
  const stops = useMemo(() => orderedStops(route), [route]);
  const live = sameId(liveData?.busId, bus?.busId ?? bus?.id) ? liveData : null;
  const position = coordinates(live?.currentLatitude, live?.currentLongitude)
    ?? coordinates(bus?.lastLatitude, bus?.lastLongitude);
  const lat = position?.[0], lng = position?.[1];
  const routeCoordinates = stops.map(stop => `${Number(stop.longitude)},${Number(stop.latitude)}`).join(';');
  useEffect(() => {
    setRoadPath(null);
    if (!isOpen || stops.length < 2) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const routingBase = import.meta.env.VITE_ROUTING_BASE_URL || 'https://router.project-osrm.org';
    fetch(`${routingBase}/route/v1/driving/${routeCoordinates}?overview=full&geometries=geojson&steps=false`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Routing unavailable'); return response.json(); })
      .then(result => {
        const path = result.routes?.[0]?.geometry?.coordinates;
        if (!controller.signal.aborted && result.code === 'Ok' && Array.isArray(path)) {
          const points = path.map(([lng, lat]) => coordinates(lat, lng));
          if (points.length > 1 && points.every(Boolean)) setRoadPath({ key: routeCoordinates, points });
        }
      }).catch(() => { /* Clearly labeled stop sequence remains visible if routing is unavailable. */ })
      .finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [isOpen, routeCoordinates]);

  const active = live?.tripStatus === 'IN_PROGRESS';
  const fresh = active && live?.isGpsOnline === true;
  const speed = fresh ? Math.round(Number(live?.currentSpeedKmh ?? 0)) : 0;
  const fit = () => {
    const points = roadPath?.key === routeCoordinates ? [...roadPath.points] : stops.map(stop => coordinates(stop.latitude, stop.longitude));
    if (position) points.push(position);
    if (points.length && mapRef.current) {
      mapRef.current.fitBounds(L.latLngBounds(points), { padding: [45, 45], maxZoom: 16 });
    }
  };

  useEffect(() => {
    if (!isOpen || !container.current) return;
    const map = L.map(container.current, { center: [20.6, 78.9], zoom: 5 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    routeLayer.current = L.layerGroup().addTo(map);
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);
    const timeout = setTimeout(() => map.invalidateSize(), 100);
    return () => {
      clearTimeout(timeout); observer.disconnect(); map.remove();
      mapRef.current = null; markerRef.current = null; fittedRoute.current = null;
    };
  }, [isOpen, bus?.busId, bus?.id]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeLayer.current) return;
    routeLayer.current.clearLayers();
    const points = stops.map(stop => coordinates(stop.latitude, stop.longitude));
    if (points.length > 1) {
      const road = roadPath?.key === routeCoordinates ? roadPath.points : null;
      L.polyline(road ?? points, { color: '#0d9488', weight: 4, ...(road ? {} : { dashArray: '8 6' }) }).addTo(routeLayer.current);
    }
    stops.forEach((stop, index) => {
      const label = document.createElement('div');
      label.textContent = `${index + 1}. ${stop.stopName ?? 'Stop'}`;
      L.circleMarker(points[index], { radius: 7, color: '#0d9488', fillOpacity: 1 })
        .bindTooltip(label, { permanent: true, direction: 'top' }).addTo(routeLayer.current);
    });
    const key = `${route?.id}:${routeCoordinates}:${roadPath?.key === routeCoordinates ? 'road' : 'stops'}`;
    if (fittedRoute.current !== key) {
      fittedRoute.current = key;
      const bounds = roadPath?.key === routeCoordinates ? [...roadPath.points] : [...points];
      if (lat != null && lng != null) bounds.push([lat, lng]);
      if (bounds.length) map.fitBounds(L.latLngBounds(bounds), { padding: [45, 45], maxZoom: 16 });
    }
  }, [stops, route?.id, isOpen, bus?.id, bus?.busId, roadPath, routeCoordinates]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (lat == null || lng == null) {
      markerRef.current?.remove(); markerRef.current = null; return;
    }
    const label = document.createElement('div');
    label.textContent = `${bus.busNumber ?? 'Bus'} • ${fresh ? `${speed} km/h` : 'Last known position'}`;
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { icon: L.divIcon({
        className: 'bus-location-marker', html: '<span style="font-size:30px">🚌</span>',
        iconSize: [36, 36], iconAnchor: [18, 18],
      }) }).addTo(map);
      if (!stops.length) map.setView([lat, lng], 15);
    } else markerRef.current.setLatLng([lat, lng]);
    markerRef.current.unbindTooltip().bindTooltip(label);
  }, [lat, lng, speed, fresh, isOpen, bus, stops.length]);

  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [isOpen, onClose]);

  if (!isOpen || !bus) return null;
  return <div role="dialog" aria-modal="true" aria-label={`${bus.busNumber} route map`}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 1500, display: 'grid', placeItems: 'center', padding: 20 }}>
    <section style={{ background: 'var(--bg-card,white)', color: 'var(--text-primary,#0f172a)', borderRadius: 16, width: 'min(1100px,100%)', overflow: 'hidden' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 18 }}>
        <div><h3 style={{ margin: 0 }}>{bus.busNumber} — {route?.routeName ?? 'No assigned route'}</h3>
          <small>{driver?.name ?? live?.driverName ?? bus.assignedDriverName ?? 'Driver not assigned'} · {fresh ? 'Live GPS' : active ? 'Waiting for GPS / offline' : 'Trip inactive'}</small></div>
        <button onClick={onClose} aria-label="Close map"><X size={22} /></button>
      </header>
      <div style={{ padding: '0 18px 12px', display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <span>{stops.length} route stops</span><span>{speed} km/h</span>
        <span>Last GPS: {live?.lastGpsUpdate ? new Date(live.lastGpsUpdate).toLocaleString() : 'Not available'}</span>
        <button onClick={fit}><LocateFixed size={14} /> Fit bus and route</button>
      </div>
      <div ref={container} style={{ height: 'min(60vh,560px)', minHeight: 260 }} />
      <footer style={{ padding: 16, fontSize: 13 }}>
        {!position && <p>No GPS position received for this bus. The map shows its assigned stops only.</p>}
        {!stops.length && <p>This bus has no configured route stops.</p>}
        <p style={{ margin: 0 }}>{roadPath?.key === routeCoordinates ? 'Solid line: driving route through the assigned stops.' : 'Dashed line: planned stop sequence; road routing is unavailable or loading.'} GPS trip history is saved when the driver ends the trip.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
          {stops.map((stop, index) => <span key={stop.id ?? index}>{index + 1}. {stop.stopName}</span>)}
        </div>
      </footer>
    </section>
  </div>;
};
export default BusTrackModal;
