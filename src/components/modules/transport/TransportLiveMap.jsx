import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Navigation, ZoomIn, ZoomOut, Maximize2, AlertTriangle, Eye, Compass } from 'lucide-react';

export const TransportLiveMap = ({
  selectedBus,
  allBuses = [],
  routes = [],
  alerts = [],
  onSelectBus,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Layer groups refs
  const busesLayerRef = useRef(null);
  const plannedRouteLayerRef = useRef(null);
  const actualPathLayerRef = useRef(null);
  const stopsLayerRef = useRef(null);
  const geofencesLayerRef = useRef(null);
  const alertsLayerRef = useRef(null);

  // Layer toggles
  const [showPlannedRoute, setShowPlannedRoute] = useState(true);
  const [showActualPath, setShowActualPath] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [autoFollowBus, setAutoFollowBus] = useState(true);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = selectedBus?.currentLatitude || 25.6025;
      const initialLon = selectedBus?.currentLongitude || 85.1430;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Voyager tiles (clean, high-contrast, modern SaaS look)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Create layer groups
      plannedRouteLayerRef.current = L.layerGroup().addTo(map);
      actualPathLayerRef.current = L.layerGroup().addTo(map);
      geofencesLayerRef.current = L.layerGroup().addTo(map);
      stopsLayerRef.current = L.layerGroup().addTo(map);
      alertsLayerRef.current = L.layerGroup().addTo(map);
      busesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Planned Route & Stops
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    plannedRouteLayerRef.current.clearLayers();
    stopsLayerRef.current.clearLayers();
    geofencesLayerRef.current.clearLayers();

    // Resolve route for selected bus
    const route = routes.find((r) => r.id === selectedBus?.routeId) || routes[0];
    if (!route || !route.stops || route.stops.length === 0) return;

    const stopCoordinates = [];

    route.stops.forEach((stop, index) => {
      const lat = Number(stop.latitude) || 25.60 + index * 0.005;
      const lon = Number(stop.longitude) || 85.13 + index * 0.005;
      stopCoordinates.push([lat, lon]);

      const isCompleted = index < (selectedBus?.completedStops || 0);
      const isCurrent = index === (selectedBus?.completedStops || 0);
      const isSchoolDest = index === route.stops.length - 1;

      // 1. Geofence Circle (50m)
      if (showGeofences) {
        const radius = stop.geofenceRadiusMeters || 50;
        const circle = L.circle([lat, lon], {
          radius: radius,
          color: isCurrent ? '#06b6d4' : '#0d9488',
          weight: 1.5,
          dashArray: isCurrent ? null : '4, 4',
          fillColor: isCurrent ? '#06b6d4' : '#0d9488',
          fillOpacity: isCurrent ? 0.22 : 0.08,
        });
        circle.bindTooltip(`Geofence: ${radius}m radius`, { direction: 'top' });
        geofencesLayerRef.current.addLayer(circle);
      }

      // 2. Stop Numbered Pin Marker
      if (showStops) {
        let pinBg = '#64748b';
        let pinIcon = stop.stopOrder || index + 1;
        if (isCompleted) {
          pinBg = '#10b981';
          pinIcon = '✓';
        } else if (isCurrent) {
          pinBg = '#06b6d4';
        } else if (isSchoolDest) {
          pinBg = '#ef4444';
          pinIcon = '★';
        }

        const stopIconHtml = `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: ${pinBg};
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${pinIcon}
          </div>
        `;

        const stopMarkerIcon = L.divIcon({
          className: 'custom-stop-marker',
          html: stopIconHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const stopMarker = L.marker([lat, lon], { icon: stopMarkerIcon });

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #1e293b; min-width: 190px;">
            <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
              Stop ${stop.stopOrder}: ${stop.stopName}
            </div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
              ${stop.landmark || 'Planned student stop'}
            </div>
            <div style="background: #f8fafc; border-radius: 6px; padding: 6px 8px; margin-bottom: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div><strong>Morning:</strong> ${stop.plannedMorningPickupTime || '07:15 AM'}</div>
              <div><strong>Evening:</strong> ${stop.plannedEveningDropTime || '03:15 PM'}</div>
              <div><strong>Students:</strong> ${stop.assignedStudentsCount || 0}</div>
              <div><strong>Status:</strong> <span style="color: ${isCompleted ? '#10b981' : '#0d9488'}; font-weight: 700;">${isCompleted ? 'Departed' : (isCurrent ? 'Next' : 'Pending')}</span></div>
            </div>
            ${isCompleted ? '<div style="font-size: 11px; color: #10b981; font-weight: 600;">⏱ Dwell Duration: 1 min 45 sec</div>' : ''}
          </div>
        `;

        stopMarker.bindPopup(popupContent);
        stopsLayerRef.current.addLayer(stopMarker);
      }
    });

    // 3. Planned Route Polyline
    if (showPlannedRoute && stopCoordinates.length > 1) {
      const plannedLine = L.polyline(stopCoordinates, {
        color: '#0284c7',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85,
        lineCap: 'round',
      });
      plannedLine.bindTooltip(`Planned Route: ${route.routeName}`, { sticky: true });
      plannedRouteLayerRef.current.addLayer(plannedLine);
    }
  }, [selectedBus, routes, showPlannedRoute, showStops, showGeofences]);

  // Render Traveled Path & Active Bus Location
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    actualPathLayerRef.current.clearLayers();
    busesLayerRef.current.clearLayers();
    alertsLayerRef.current.clearLayers();

    // 1. Draw Actual Traveled GPS Trail for selected bus
    if (showActualPath && selectedBus) {
      const currentLat = Number(selectedBus.currentLatitude) || 25.6025;
      const currentLon = Number(selectedBus.currentLongitude) || 85.1430;

      // Realistic path leading up to current position
      const traveledPoints = [
        [25.6150, 85.1280],
        [25.6135, 85.1305],
        [25.6100, 85.1350],
        [25.6075, 85.1380],
        [25.6050, 85.1410],
        [currentLat, currentLon],
      ];

      const actualLine = L.polyline(traveledPoints, {
        color: '#0d9488',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });
      actualLine.bindTooltip(`Actual GPS Path: ${selectedBus.busNumber} (${selectedBus.traveledDistanceKm || 7.8} km)`, { sticky: true });
      actualPathLayerRef.current.addLayer(actualLine);
    }

    // 2. Render Fleet Bus Markers
    const fleet = allBuses.length > 0 ? allBuses : (selectedBus ? [selectedBus] : []);

    fleet.forEach((bus) => {
      const isSelected = selectedBus?.busId === bus.busId;
      const lat = Number(bus.currentLatitude) || 25.6025;
      const lon = Number(bus.currentLongitude) || 85.1430;
      const speed = Math.round(bus.currentSpeedKmh || 0);
      const isMoving = bus.tripStatus === 'IN_PROGRESS' && speed > 2;

      const busIconHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <!-- Speed / Bus Badge -->
          <div style="
            background: ${isSelected ? '#0d9488' : '#0f172a'};
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            white-space: nowrap;
            margin-bottom: 3px;
            display: flex;
            align-items: center;
            gap: 4px;
            border: 1.5px solid ${isSelected ? '#2dd4bf' : '#334155'};
          ">
            <span>${bus.busNumber}</span>
            <span style="color: ${speed > 45 ? '#f87171' : '#34d399'};">• ${speed}k</span>
          </div>

          <!-- Pin marker with pulse ring -->
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            ${isMoving ? `
              <div style="
                position: absolute;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: rgba(13, 148, 136, 0.35);
                animation: leafletBusPulse 1.8s infinite;
              "></div>
            ` : ''}
            <div style="
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background: ${isSelected ? '#0d9488' : '#1e293b'};
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path>
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4C2.9 6 1.9 6.8 1.6 7.8L.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
                <circle cx="7" cy="18" r="2"></circle><circle cx="15" cy="18" r="2"></circle>
              </svg>
            </div>
          </div>
        </div>
      `;

      const busMarkerIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: busIconHtml,
        iconSize: [60, 55],
        iconAnchor: [30, 48],
      });

      const marker = L.marker([lat, lon], { icon: busMarkerIcon, zIndexOffset: isSelected ? 1000 : 500 });

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; color: #1e293b; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 14px; color: #0f172a;">${bus.busNumber}</span>
            <span style="background: ${bus.tripStatus === 'IN_PROGRESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)'}; color: ${bus.tripStatus === 'IN_PROGRESS' ? '#10b981' : '#64748b'}; font-weight: 800; font-size: 10px; padding: 2px 6px; border-radius: 4px;">
              ${bus.tripStatus || 'IDLE'}
            </span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${bus.registrationNumber} • ${bus.routeName || 'School Loop'}
          </div>
          <div style="background: #f8fafc; border-radius: 8px; padding: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px;">
            <div><strong>Speed:</strong> <span style="color: ${speed > 45 ? '#ef4444' : '#0d9488'}; font-weight: 800;">${speed} km/h</span></div>
            <div><strong>Next Stop ETA:</strong> <span style="color: #0d9488; font-weight: 800;">~${bus.nextStopEtaMinutes || 5} min</span></div>
            <div><strong>Driver:</strong> ${bus.driverName || 'Ramesh Kumar'}</div>
            <div><strong>Phone:</strong> ${bus.driverPhone || 'N/A'}</div>
            <div><strong>GPS Status:</strong> <span style="color: #10b981; font-weight: 700;">● Online (5m)</span></div>
            <div><strong>Completed:</strong> ${bus.completedStops || 0}/${bus.totalStops || 5} Stops</div>
          </div>
          <div style="font-size: 10px; color: #94a3b8; text-align: right;">
            Last GPS: ${new Date(bus.lastGpsUpdate || Date.now()).toLocaleTimeString()}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectBus) onSelectBus(bus);
      });

      busesLayerRef.current.addLayer(marker);
    });

    // 3. Render Incident / Deviation Alerts
    if (showAlerts && alerts && alerts.length > 0) {
      alerts.forEach((alert) => {
        const lat = 25.6080;
        const lon = 85.1375;

        const alertIconHtml = `
          <div style="
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #ef4444;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.45);
            border: 2px solid #ffffff;
            cursor: pointer;
            animation: leafletAlertPulse 1.5s infinite;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
        `;

        const alertMarkerIcon = L.divIcon({
          className: 'custom-alert-marker',
          html: alertIconHtml,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const alertMarker = L.marker([lat, lon], { icon: alertMarkerIcon });
        alertMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #1e293b;">
            <div style="font-weight: 800; color: #ef4444; margin-bottom: 2px;">⚠️ ${alert.title || 'Fleet Alert'}</div>
            <div style="color: #64748b; margin-bottom: 4px;">${alert.message || 'Alert description'}</div>
            <div style="font-size: 10px; color: #94a3b8;">Status: ${alert.status}</div>
          </div>
        `);
        alertsLayerRef.current.addLayer(alertMarker);
      });
    }

    // Auto follow selected bus
    if (autoFollowBus && selectedBus && mapInstanceRef.current) {
      const lat = Number(selectedBus.currentLatitude) || 25.6025;
      const lon = Number(selectedBus.currentLongitude) || 85.1430;
      mapInstanceRef.current.panTo([lat, lon], { animate: true, duration: 0.8 });
    }
  }, [selectedBus, allBuses, alerts, showActualPath, showAlerts, autoFollowBus]);

  // Fit bounds helper
  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const group = L.featureGroup([
      busesLayerRef.current,
      stopsLayerRef.current,
      actualPathLayerRef.current,
    ]);
    if (group.getLayers().length > 0) {
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15));
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
      {/* Real Interactive Leaflet Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '560px', zIndex: 1 }} />

      {/* Embedded CSS animations for markers */}
      <style>{`
        @keyframes leafletBusPulse {
          0% { transform: scale(0.85); opacity: 0.8; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes leafletAlertPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Floating Interactive Layer Controls */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          padding: '8px 14px',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#1e293b',
          border: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0d9488', marginRight: '4px' }}>
          <Layers size={15} />
          <span>Layers:</span>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showPlannedRoute}
            onChange={(e) => setShowPlannedRoute(e.target.checked)}
            style={{ accentColor: '#0284c7' }}
          />
          <span style={{ color: '#0284c7' }}>Planned Route</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showActualPath}
            onChange={(e) => setShowActualPath(e.target.checked)}
            style={{ accentColor: '#0d9488' }}
          />
          <span style={{ color: '#0d9488' }}>Travelled Path</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showStops}
            onChange={(e) => setShowStops(e.target.checked)}
            style={{ accentColor: '#10b981' }}
          />
          <span>Stops</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showGeofences}
            onChange={(e) => setShowGeofences(e.target.checked)}
            style={{ accentColor: '#06b6d4' }}
          />
          <span>50m Geofences</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showAlerts}
            onChange={(e) => setShowAlerts(e.target.checked)}
            style={{ accentColor: '#ef4444' }}
          />
          <span style={{ color: '#ef4444' }}>Alerts</span>
        </label>
      </div>

      {/* Floating Action Buttons (Zoom & Follow) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom In"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1e293b',
          }}
        >
          <ZoomIn size={18} />
        </button>

        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          title="Zoom Out"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1e293b',
          }}
        >
          <ZoomOut size={18} />
        </button>

        <button
          onClick={handleFitAll}
          title="Fit All Fleet & Route"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0d9488',
          }}
        >
          <Maximize2 size={18} />
        </button>

        <button
          onClick={() => setAutoFollowBus(!autoFollowBus)}
          title={autoFollowBus ? 'Disable Auto-center' : 'Enable Auto-center'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: autoFollowBus ? '#0d9488' : '#ffffff',
            color: autoFollowBus ? '#ffffff' : '#1e293b',
            border: '1px solid #e2e8f0',
            boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* Live Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: '#475569',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: '#0d9488', borderRadius: '2px' }} />
          <span>Actual Traveled Trail</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '12px', height: '3px', borderTop: '2px dashed #0284c7' }} />
          <span>Planned Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} />
          <span>Completed Stop</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#06b6d4', borderRadius: '50%' }} />
          <span>Current Stop</span>
        </div>
      </div>
    </div>
  );
};
