import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Play, Pause, RotateCcw, FastForward, Clock, Gauge, Compass } from 'lucide-react';

export const TransportPlaybackMap = ({
  playbackData,
  progress = 0,
  isPlaying = false,
  onTogglePlay,
  onSeek,
  onReset,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pathLineRef = useRef(null);
  const animatedBusMarkerRef = useRef(null);
  const stopsLayerRef = useRef(null);

  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Initialize playback Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25.6025, 85.1430],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      pathLineRef.current = L.polyline([], {
        color: '#0d9488',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      stopsLayerRef.current = L.layerGroup().addTo(map);

      // Custom animated bus icon
      const busIconHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            background: #0d9488;
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            white-space: nowrap;
            margin-bottom: 2px;
          ">
            ${playbackData?.busNumber || 'Bus 04'}
          </div>
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #0d9488;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          ">
            🚌
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        className: 'playback-bus-marker',
        html: busIconHtml,
        iconSize: [50, 50],
        iconAnchor: [25, 45],
      });

      animatedBusMarkerRef.current = L.marker([25.6025, 85.1430], { icon: busIcon }).addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Full Playback Path & Stops
  useEffect(() => {
    if (!mapInstanceRef.current || !playbackData) return;

    stopsLayerRef.current.clearLayers();

    const points = (playbackData.pathPoints || []).map((p) => [
      Number(p.latitude),
      Number(p.longitude),
    ]);

    if (points.length > 0) {
      pathLineRef.current.setLatLngs(points);
      mapInstanceRef.current.fitBounds(pathLineRef.current.getBounds().pad(0.12));
    }

    // Render Stops along the playback
    (playbackData.stops || []).forEach((st, idx) => {
      const lat = Number(st.latitude) || (points[idx] ? points[idx][0] : 25.60 + idx * 0.005);
      const lon = Number(st.longitude) || (points[idx] ? points[idx][1] : 85.13 + idx * 0.005);

      const stopIconHtml = `
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #10b981;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid #ffffff;
        ">
          ${st.stopOrder || idx + 1}
        </div>
      `;

      const marker = L.marker([lat, lon], {
        icon: L.divIcon({ className: 'pb-stop-pin', html: stopIconHtml, iconSize: [24, 24], iconAnchor: [12, 12] }),
      });

      marker.bindPopup(`
        <div style="font-size: 12px; font-family: inherit;">
          <strong>${st.stopName}</strong>
          <div>Arrival: ${st.arrivalTime || '07:25 AM'}</div>
          <div>Departure: ${st.departureTime || '07:28 AM'}</div>
          <div style="color: #0d9488; font-weight: bold;">Dwell Time: ${st.dwellDurationSeconds ? `${Math.round(st.dwellDurationSeconds / 60)} mins` : '2 mins'}</div>
        </div>
      `);

      stopsLayerRef.current.addLayer(marker);
    });
  }, [playbackData]);

  // Update bus marker position as playback progress updates
  useEffect(() => {
    if (!animatedBusMarkerRef.current || !playbackData?.pathPoints?.length) return;

    const points = playbackData.pathPoints;
    const targetIdx = Math.min(
      Math.floor((progress / 100) * points.length),
      points.length - 1
    );

    const pt = points[targetIdx];
    if (pt && pt.latitude && pt.longitude) {
      const latLng = [Number(pt.latitude), Number(pt.longitude)];
      animatedBusMarkerRef.current.setLatLng(latLng);

      // Optionally center slightly
      if (mapInstanceRef.current && isPlaying) {
        mapInstanceRef.current.panTo(latLng, { animate: true, duration: 0.4 });
      }
    }
  }, [progress, playbackData, isPlaying]);

  // Current point metrics
  const currentPointIndex = Math.min(
    Math.floor(((progress || 0) / 100) * ((playbackData?.pathPoints?.length || 1) - 1)),
    (playbackData?.pathPoints?.length || 1) - 1
  );
  const currentPoint = playbackData?.pathPoints?.[currentPointIndex] || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Playback Map Canvas */}
      <div
        style={{
          width: '100%',
          height: '420px',
          position: 'relative',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Live HUD Floating on playback map */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            zIndex: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            padding: '8px 14px',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '0.78rem',
            color: '#1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Gauge size={15} color="#0d9488" />
            <span>Speed: <strong>{Math.round(currentPoint.speedKmh || 28)} km/h</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Compass size={15} color="#2563eb" />
            <span>Heading: <strong>{Math.round(currentPoint.heading || 145)}°</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={15} color="#10b981" />
            <span>Playback: <strong>{progress}%</strong></span>
          </div>
        </div>
      </div>

      {/* Playback Scrubber & Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backgroundColor: 'var(--bg-app)',
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Scrubber slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>00:00</span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => onSeek && onSeek(Number(e.target.value))}
            style={{
              flex: 1,
              height: '6px',
              borderRadius: '3px',
              accentColor: '#0d9488',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {playbackData?.durationMinutes || 45} mins
          </span>
        </div>

        {/* Buttons Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onTogglePlay}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isPlaying ? '#ef4444' : '#0d9488',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              {isPlaying ? 'Pause' : 'Play Journey'}
            </button>

            <button
              onClick={onReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} /> Replay
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: playbackSpeed === spd ? '#0d9488' : 'var(--bg-card)',
                  color: playbackSpeed === spd ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                }}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
