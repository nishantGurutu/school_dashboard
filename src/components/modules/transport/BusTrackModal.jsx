import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { X, LocateFixed } from 'lucide-react';
import { coordinates, sameId } from './trackingMapData';
import { transportService } from '../../../services/transportService';

export const BusTrackModal = ({ isOpen, onClose, bus, driver, liveData }) => {
  const container = useRef(null);
  const mapRef = useRef(null);
  const layer = useRef(null);
  const fitted = useRef(null);
  const [trips, setTrips] = useState([]);
  const [selected, setSelected] = useState('');
  const [playback, setPlayback] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const busId = bus?.busId ?? bus?.id;
  const schoolId = bus?.schoolId ?? 'SCH-001';
  const live = sameId(liveData?.busId, busId) ? liveData : null;
  const active = trips.find(trip => sameId(trip.tripId, selected))?.status === 'IN_PROGRESS';
  const points = useMemo(() => (playback?.pathPoints ?? [])
    .map(point => coordinates(point.latitude, point.longitude)).filter(Boolean), [playback]);
  const current = active ? coordinates(live?.currentLatitude, live?.currentLongitude) : null;
  const lat = current?.[0], lng = current?.[1];

  useEffect(() => {
    if (!isOpen || busId == null) return;
    let cancelled = false;
    let running = false;
    setTrips([]); setSelected(''); setPlayback(null); setError(''); setLoading(true);
    const load = async () => {
      if (running) return;
      running = true;
      try {
        const result = await transportService.getTripReports(schoolId, null, busId);
        if (cancelled) return;
        setTrips(result);
        setSelected(previous => result.some(trip => sameId(trip.tripId, previous)) ? previous : String(result[0]?.tripId ?? ''));
        setError('');
      } catch (failure) {
        if (!cancelled) setError(failure.message || 'Could not load bus trips.');
      } finally { running = false; if (!cancelled) setLoading(false); }
    };
    load();
    const timer = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [isOpen, busId, schoolId]);

  useEffect(() => {
    setPlayback(null);
    if (!isOpen || !selected) return;
    let cancelled = false;
    let running = false;
    const load = async () => {
      if (running) return;
      running = true;
      try {
        const result = await transportService.getTripPlayback(selected, schoolId);
        if (!cancelled) { setPlayback(result); setError(''); }
      } catch (failure) {
        if (!cancelled) setError(failure.message || 'Could not load recorded route.');
      } finally { running = false; }
    };
    load();
    const timer = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [isOpen, selected, schoolId]);

  const fit = () => {
    const bounds = [...points];
    if (lat != null && lng != null) bounds.push([lat, lng]);
    if (bounds.length && mapRef.current) mapRef.current.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 16 });
  };
  useEffect(() => {
    if (!isOpen || !container.current) return;
    const map = L.map(container.current, { center: [20.6, 78.9], zoom: 5 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    layer.current = L.layerGroup().addTo(map);
    fitted.current = null;
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);
    return () => { observer.disconnect(); map.remove(); mapRef.current = null; layer.current = null; };
  }, [isOpen, busId]);

  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();
    if (points.length > 1) L.polyline(points, { color: '#0d9488', weight: 5 }).addTo(layer.current);
    if (points.length) {
      L.circleMarker(points[0], { radius: 7, color: '#16a34a', fillOpacity: 1 }).bindTooltip('Trip start').addTo(layer.current);
      const last = points[points.length - 1];
      L.circleMarker(last, { radius: 7, color: active ? '#0d9488' : '#dc2626', fillOpacity: 1 })
        .bindTooltip(active ? 'Latest recorded position' : 'Trip end').addTo(layer.current);
    }
    if (lat != null && lng != null) {
      L.marker([lat, lng], { icon: L.divIcon({ className: 'bus-location-marker', html: '<span style="font-size:30px">🚌</span>', iconSize: [36, 36], iconAnchor: [18, 18] }) })
        .bindTooltip('Latest live bus position').addTo(layer.current);
    }
    if (fitted.current !== selected && (points.length || lat != null)) { fitted.current = selected; fit(); }
  }, [points, lat, lng, selected, active, isOpen]);

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
        <div><h3 style={{ margin: 0 }}>{bus.busNumber} — Recorded Trip Route</h3>
          <small>{playback?.driverName ?? driver?.name ?? bus.assignedDriverName ?? 'Driver not assigned'}</small></div>
        <button onClick={onClose} aria-label="Close map"><X size={22} /></button>
      </header>
      <div style={{ padding: '0 18px 12px', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <label>Trip: <select aria-label="Recorded trip" value={selected} onChange={event => setSelected(event.target.value)} disabled={!trips.length}>
          {!trips.length && <option value="">{loading ? 'Loading trips…' : 'No trips recorded'}</option>}
          {trips.map(trip => <option key={trip.tripId} value={trip.tripId}>{trip.tripDate} · {trip.shift} · {trip.status} · #{trip.tripId}</option>)}
        </select></label>
        <span>Start: {playback?.startTime ? new Date(playback.startTime).toLocaleString() : '—'}</span>
        <span>End: {playback?.endTime ? new Date(playback.endTime).toLocaleString() : active ? 'Trip active' : '—'}</span>
        <button onClick={fit}><LocateFixed size={14} /> Fit route</button>
      </div>
      {error && <p role="alert" style={{ padding: '0 18px', color: '#dc2626' }}>{error}</p>}
      <div ref={container} style={{ height: 'min(60vh,560px)', minHeight: 260 }} />
      <footer style={{ padding: 16, fontSize: 13 }}>
        {active ? 'Background GPS is recording on the driver phone. The full driven route appears here after End Trip saves it.'
          : points.length ? `${points.length} recorded GPS points from Start Trip to End Trip. Green: start. Red: end.`
          : 'No recorded GPS route available for this trip.'}
      </footer>
    </section>
  </div>;
};
export default BusTrackModal;
