import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Layers,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  Eye,
  Compass,
  Expand,
  Shrink,
  Activity,
  LocateFixed,
  Flag,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Clock,
  Gauge
} from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAP_STYLES, FALLBACK_TILE_URL, FALLBACK_ATTRIBUTION } from '../../../config/mapConfig';

export const TransportLiveMap = ({
  selectedBus,
  allBuses = [],
  routes = [],
  alerts = [],
  onSelectBus,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Layer groups refs
  const tileLayerRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const busesLayerRef = useRef(null);
  const plannedRouteLayerRef = useRef(null);
  const actualPathLayerRef = useRef(null);
  const stopsLayerRef = useRef(null);
  const geofencesLayerRef = useRef(null);
  const alertsLayerRef = useRef(null);
  const userLocationLayerRef = useRef(null);
  const isFallingBackRef = useRef(false);

  // Map Style State (Google Maps roadmap, hybrid, satellite, terrain, OSM)
  const [mapStyle, setMapStyle] = useState('STREETS');
  const [showTrafficOverlay, setShowTrafficOverlay] = useState(false);

  // Layer toggles
  const [showPlannedRoute, setShowPlannedRoute] = useState(true);
  const [showActualPath, setShowActualPath] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [autoFollowBus, setAutoFollowBus] = useState(true);

  // Permission & Location state
  const [geoPermissionStatus, setGeoPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  // Check geolocation permission on mount
  useEffect(() => {
    if ('permissions' in navigator && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setGeoPermissionStatus(result.state);
          result.onchange = () => setGeoPermissionStatus(result.state);
        })
        .catch(() => {
          // fallback for browsers that don't support geolocation permission query
        });
    }
  }, []);

  // Request & locate admin position
  const handleLocateAdmin = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser');
      setTimeout(() => setLocationMessage(''), 3000);
      return;
    }

    setIsLocating(true);
    setLocationMessage('Requesting GPS permission & locating...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setGeoPermissionStatus('granted');
        setLocationMessage('Admin location locked');
        setTimeout(() => setLocationMessage(''), 3000);

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        if (mapInstanceRef.current && userLocationLayerRef.current) {
          userLocationLayerRef.current.clearLayers();

          const adminIconHtml = `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="
                position: absolute;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: rgba(37, 99, 235, 0.35);
                animation: leafletPulseAdmin 1.8s infinite;
              "></div>
              <div style="
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #2563eb;
                border: 3px solid #ffffff;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              "></div>
            </div>
          `;

          const adminMarker = L.marker([lat, lon], {
            icon: L.divIcon({
              className: 'admin-location-pin',
              html: adminIconHtml,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            }),
          });

          adminMarker.bindPopup(`
            <div style="font-size: 12px; font-family: inherit;">
              <strong>Admin / Device Location</strong>
              <div style="color: #64748b; font-size: 11px;">Latitude: ${lat.toFixed(4)}, Longitude: ${lon.toFixed(4)}</div>
              <div style="color: #10b981; font-weight: 700; margin-top: 4px;">● GPS Accuracy: ±${Math.round(pos.coords.accuracy)}m</div>
            </div>
          `);

          const circle = L.circle([lat, lon], {
            radius: pos.coords.accuracy || 40,
            color: '#2563eb',
            weight: 1,
            fillColor: '#2563eb',
            fillOpacity: 0.12,
          });

          userLocationLayerRef.current.addLayer(circle);
          userLocationLayerRef.current.addLayer(adminMarker);

          mapInstanceRef.current.setView([lat, lon], 15, { animate: true });
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setGeoPermissionStatus('denied');
          setLocationMessage('Location permission was denied');
        } else {
          setLocationMessage('Could not retrieve location');
        }
        setTimeout(() => setLocationMessage(''), 3500);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Helper to create tile layer with automatic fallback
  const createTileLayer = useCallback((styleKey) => {
    const config = GOOGLE_MAP_STYLES[styleKey] || GOOGLE_MAP_STYLES.STREETS;
    const primaryUrl = config.url(GOOGLE_MAPS_API_KEY);

    const layer = L.tileLayer(primaryUrl, {
      maxZoom: config.maxZoom || 20,
      subdomains: config.subdomains || ['0', '1', '2', '3'],
      attribution: config.attribution,
    });

    // Fallback if primary tiles fail (e.g. key restriction or network issues)
    layer.on('tileerror', () => {
      if (!isFallingBackRef.current && mapInstanceRef.current) {
        isFallingBackRef.current = true;
        console.warn('Map tile failed to load. Switching to reliable OpenStreetMap tile layer.');
        if (tileLayerRef.current && mapInstanceRef.current.hasLayer(tileLayerRef.current)) {
          mapInstanceRef.current.removeLayer(tileLayerRef.current);
        }
        const fallback = L.tileLayer(FALLBACK_TILE_URL, {
          maxZoom: 19,
          attribution: FALLBACK_ATTRIBUTION,
        });
        fallback.addTo(mapInstanceRef.current);
        tileLayerRef.current = fallback;
      }
    });

    return layer;
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = Number(selectedBus?.currentLatitude) || 25.6025;
      const initialLon = Number(selectedBus?.currentLongitude) || 85.1430;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // 1. Initial Tile Layer
      isFallingBackRef.current = false;
      const initialLayer = createTileLayer(mapStyle);
      initialLayer.addTo(map);
      tileLayerRef.current = initialLayer;

      // 2. Layer Groups
      plannedRouteLayerRef.current = L.layerGroup().addTo(map);
      actualPathLayerRef.current = L.layerGroup().addTo(map);
      geofencesLayerRef.current = L.layerGroup().addTo(map);
      stopsLayerRef.current = L.layerGroup().addTo(map);
      alertsLayerRef.current = L.layerGroup().addTo(map);
      busesLayerRef.current = L.layerGroup().addTo(map);
      userLocationLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    // Smoothly invalidate size multiple times after mount to guarantee NO blank canvas
    const timer1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
    const timer2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 250);
    const timer3 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 650);

    // Resize observer to ensure full body layout is rendered smoothly without tile gaps
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Invalidate map size on layout / fullscreen change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Handle Map Style Switch (Google Streets, Satellite, Hybrid, Terrain, OSM)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current && map.hasLayer(tileLayerRef.current)) {
      map.removeLayer(tileLayerRef.current);
    }

    isFallingBackRef.current = false;
    const newLayer = createTileLayer(mapStyle);
    newLayer.addTo(map);
    tileLayerRef.current = newLayer;

    // Bring marker layers back on top
    if (busesLayerRef.current) busesLayerRef.current.bringToFront();
    if (stopsLayerRef.current) stopsLayerRef.current.bringToFront();
  }, [mapStyle, createTileLayer]);

  // Handle Google Live Traffic overlay toggle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (showTrafficOverlay) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = L.tileLayer(GOOGLE_MAP_STYLES.TRAFFIC.url(GOOGLE_MAPS_API_KEY), {
          maxZoom: 20,
          subdomains: ['0', '1', '2', '3'],
          opacity: 0.85,
        });
      }
      trafficLayerRef.current.addTo(map);
    } else {
      if (trafficLayerRef.current && map.hasLayer(trafficLayerRef.current)) {
        map.removeLayer(trafficLayerRef.current);
      }
    }
  }, [showTrafficOverlay]);

  // Resolve current active route
  const resolvedRoute =
    routes.find(
      (r) =>
        r.id === selectedBus?.routeId ||
        r.routeName === selectedBus?.routeName ||
        r.routeName === selectedBus?.assignedRouteName
    ) ||
    routes[0] || {
      id: 1,
      routeName: 'North Campus Loop',
      startLocation: 'North City Square',
      endLocation: 'School Main Gate',
      stops: [
        { id: 1, stopName: 'North City Square', stopOrder: 1, latitude: 25.6150, longitude: 85.1280, plannedMorningPickupTime: '07:15 AM' },
        { id: 2, stopName: 'Metro Station Pillar 42', stopOrder: 2, latitude: 25.6100, longitude: 85.1350, plannedMorningPickupTime: '07:25 AM' },
        { id: 3, stopName: 'Central Mall Junction', stopOrder: 3, latitude: 25.6050, longitude: 85.1410, plannedMorningPickupTime: '07:35 AM' },
        { id: 4, stopName: 'Kankarbagh Park', stopOrder: 4, latitude: 25.6010, longitude: 85.1480, plannedMorningPickupTime: '07:45 AM' },
        { id: 5, stopName: 'School Main Gate (Arrival)', stopOrder: 5, latitude: 25.5970, longitude: 85.1550, plannedMorningPickupTime: '08:00 AM' }
      ]
    };

  const routeStops = resolvedRoute?.stops || [];
  const originStop = routeStops[0];
  const destinationStop = routeStops[routeStops.length - 1];

  // Render Planned Route, Stops, and Origin / Destination Pins
  useEffect(() => {
    if (!mapInstanceRef.current || !plannedRouteLayerRef.current) return;

    plannedRouteLayerRef.current.clearLayers();
    stopsLayerRef.current.clearLayers();
    geofencesLayerRef.current.clearLayers();

    if (routeStops.length === 0) return;

    const stopCoordinates = [];
    const completedStopsCount = Number(selectedBus?.completedStops) || 1;

    routeStops.forEach((stop, index) => {
      const lat = Number(stop.latitude) || (25.615 - index * 0.004);
      const lon = Number(stop.longitude) || (85.128 + index * 0.007);
      stopCoordinates.push([lat, lon]);

      const isOrigin = index === 0;
      const isDestination = index === routeStops.length - 1;
      const isCompleted = index < completedStopsCount;
      const isCurrent = index === completedStopsCount;

      // 1. Geofence Circle (50m)
      if (showGeofences) {
        const radius = stop.geofenceRadiusMeters || 50;
        const circle = L.circle([lat, lon], {
          radius: radius,
          color: isDestination ? '#ef4444' : isCurrent ? '#06b6d4' : isCompleted ? '#10b981' : '#0d9488',
          weight: 1.5,
          dashArray: isCurrent ? null : '4, 4',
          fillColor: isDestination ? '#ef4444' : isCurrent ? '#06b6d4' : isCompleted ? '#10b981' : '#0d9488',
          fillOpacity: isCurrent ? 0.22 : 0.08,
        });
        circle.bindTooltip(`Geofence: ${stop.stopName} (${radius}m)`, { direction: 'top' });
        geofencesLayerRef.current.addLayer(circle);
      }

      // 2. High-Impact Stop Marker (Origin, Intermediate, Destination)
      if (showStops) {
        let pinHtml = '';

        if (isDestination) {
          // Final Destination Pin with Radiant Beacon
          pinHtml = `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="
                background: #ef4444;
                color: #ffffff;
                font-size: 10px;
                font-weight: 800;
                padding: 3px 8px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.45);
                white-space: nowrap;
                margin-bottom: 2px;
                border: 2px solid #ffffff;
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                <span>🏁 DESTINATION</span>
              </div>
              <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                <div style="
                  position: absolute;
                  width: 44px;
                  height: 44px;
                  border-radius: 50%;
                  background: rgba(239, 68, 68, 0.3);
                  animation: leafletAlertPulse 1.6s infinite;
                "></div>
                <div style="
                  width: 34px;
                  height: 34px;
                  border-radius: 50%;
                  background: #ef4444;
                  border: 3px solid #ffffff;
                  box-shadow: 0 4px 14px rgba(0,0,0,0.35);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #ffffff;
                  font-size: 15px;
                ">
                  🏫
                </div>
              </div>
            </div>
          `;
        } else if (isOrigin) {
          // Origin / Start Pin
          pinHtml = `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
              <div style="
                background: #059669;
                color: #ffffff;
                font-size: 10px;
                font-weight: 800;
                padding: 2px 7px;
                border-radius: 10px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.25);
                white-space: nowrap;
                margin-bottom: 2px;
                border: 1.5px solid #ffffff;
              ">
                🚩 START
              </div>
              <div style="
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: #10b981;
                border: 3px solid #ffffff;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-weight: 800;
                font-size: 12px;
              ">
                1
              </div>
            </div>
          `;
        } else {
          // Intermediate Stops
          const pinBg = isCompleted ? '#10b981' : isCurrent ? '#06b6d4' : '#64748b';
          const pinText = isCompleted ? '✓' : String(stop.stopOrder || index + 1);

          pinHtml = `
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
            ">
              ${pinText}
            </div>
          `;
        }

        const stopMarker = L.marker([lat, lon], {
          icon: L.divIcon({
            className: 'custom-stop-marker',
            html: pinHtml,
            iconSize: isDestination ? [80, 60] : isOrigin ? [60, 50] : [28, 28],
            iconAnchor: isDestination ? [40, 55] : isOrigin ? [30, 45] : [14, 14],
          }),
        });

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; color: #1e293b; min-width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 800; font-size: 13px; color: #0f172a;">
                ${isDestination ? '🏁 Final Destination' : isOrigin ? '🚩 Route Origin' : `Stop ${stop.stopOrder || index + 1}`}
              </span>
              <span style="
                font-size: 10px;
                font-weight: 800;
                padding: 2px 6px;
                border-radius: 4px;
                background: ${isCompleted ? 'rgba(16, 185, 129, 0.15)' : isCurrent ? 'rgba(6, 182, 212, 0.15)' : 'rgba(100, 116, 139, 0.15)'};
                color: ${isCompleted ? '#10b981' : isCurrent ? '#06b6d4' : '#64748b'};
              ">
                ${isCompleted ? 'Departed' : isCurrent ? 'Next Stop' : 'Pending'}
              </span>
            </div>
            <div style="font-weight: 700; color: #334155; margin-bottom: 6px;">${stop.stopName}</div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
              ${stop.landmark || 'Designated student pickup & drop point'}
            </div>
            <div style="background: #f8fafc; border-radius: 6px; padding: 6px 8px; margin-bottom: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div><strong>Morning:</strong> ${stop.plannedMorningPickupTime || '07:15 AM'}</div>
              <div><strong>Evening:</strong> ${stop.plannedEveningDropTime || '03:15 PM'}</div>
              <div><strong>Students:</strong> ${stop.assignedStudentsCount || 8}</div>
              <div><strong>Geofence:</strong> ${stop.geofenceRadiusMeters || 50}m</div>
            </div>
          </div>
        `;

        stopMarker.bindPopup(popupContent);
        stopsLayerRef.current.addLayer(stopMarker);
      }
    });

    // 3. Planned Route Full Polyline (Dashed Sky Blue)
    if (showPlannedRoute && stopCoordinates.length > 1) {
      const plannedLine = L.polyline(stopCoordinates, {
        color: '#0284c7',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85,
        lineCap: 'round',
      });
      plannedLine.bindTooltip(`Planned Route: ${resolvedRoute.routeName}`, { sticky: true });
      plannedRouteLayerRef.current.addLayer(plannedLine);
    }
  }, [selectedBus, resolvedRoute, routeStops, showPlannedRoute, showStops, showGeofences]);

  // Render Traveled Path (Bus Jitna Travel Kiya Hai) & Active Fleet Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !actualPathLayerRef.current) return;

    actualPathLayerRef.current.clearLayers();
    busesLayerRef.current.clearLayers();
    alertsLayerRef.current.clearLayers();

    const currentLat = Number(selectedBus?.currentLatitude) || (originStop?.latitude || 25.6025);
    const currentLon = Number(selectedBus?.currentLongitude) || (originStop?.longitude || 85.1430);

    // 1. Draw Actual Traveled GPS Trail (Bus Jitna Travel Kiya Hai)
    if (showActualPath && selectedBus) {
      const completedCount = Number(selectedBus.completedStops) || 1;
      const traveledCoords = [];

      // Add route stops up to current stop
      for (let i = 0; i <= completedCount && i < routeStops.length; i++) {
        const st = routeStops[i];
        traveledCoords.push([Number(st.latitude), Number(st.longitude)]);
      }

      // Add current live position
      traveledCoords.push([currentLat, currentLon]);

      if (traveledCoords.length > 1) {
        // Glowing background trail
        const glowLine = L.polyline(traveledCoords, {
          color: '#0d9488',
          weight: 10,
          opacity: 0.25,
          lineCap: 'round',
        });
        actualPathLayerRef.current.addLayer(glowLine);

        // Core solid traveled line
        const actualLine = L.polyline(traveledCoords, {
          color: '#0d9488',
          weight: 6,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        });

        actualLine.bindTooltip(
          `<strong>Bus Traveled Trail</strong><br/>${selectedBus.busNumber}: ${selectedBus.traveledDistanceKm || 7.8} km traveled`,
          { sticky: true }
        );
        actualPathLayerRef.current.addLayer(actualLine);
      }
    }

    // 2. Render Fleet Bus Markers
    const fleet = allBuses.length > 0 ? allBuses : selectedBus ? [selectedBus] : [];

    fleet.forEach((bus) => {
      const isSelected = String(selectedBus?.busId) === String(bus.busId);
      const lat = Number(bus.currentLatitude) || currentLat;
      const lon = Number(bus.currentLongitude) || currentLon;
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
            padding: 3px 8px;
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
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            ${
              isMoving
                ? `
              <div style="
                position: absolute;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: rgba(13, 148, 136, 0.35);
                animation: leafletBusPulse 1.8s infinite;
              "></div>
            `
                : ''
            }
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: ${isSelected ? '#0d9488' : '#1e293b'};
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 16px;
            ">
              🚌
            </div>
          </div>
        </div>
      `;

      const busMarker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: 'custom-bus-marker',
          html: busIconHtml,
          iconSize: [60, 55],
          iconAnchor: [30, 48],
        }),
        zIndexOffset: isSelected ? 1000 : 500,
      });

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; color: #1e293b; min-width: 230px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 14px; color: #0f172a;">${bus.busNumber}</span>
            <span style="
              background: ${bus.tripStatus === 'IN_PROGRESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)'};
              color: ${bus.tripStatus === 'IN_PROGRESS' ? '#10b981' : '#64748b'};
              font-weight: 800;
              font-size: 10px;
              padding: 2px 6px;
              border-radius: 4px;
            ">
              ${bus.tripStatus || 'IDLE'}
            </span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${bus.registrationNumber || 'N/A'} • ${bus.routeName || 'School Loop'}
          </div>
          <div style="background: #f8fafc; border-radius: 8px; padding: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; margin-bottom: 8px;">
            <div><strong>Speed:</strong> <span style="color: ${speed > 45 ? '#ef4444' : '#0d9488'}; font-weight: 800;">${speed} km/h</span></div>
            <div><strong>Traveled:</strong> <span style="color: #0d9488; font-weight: 800;">${bus.traveledDistanceKm || 7.8} km</span></div>
            <div><strong>Driver:</strong> ${bus.driverName || 'Not Assigned'}</div>
            <div><strong>Phone:</strong> ${bus.driverPhone || 'N/A'}</div>
            <div><strong>Next Stop:</strong> ${bus.nextStopName || 'Campus Depot'}</div>
            <div><strong>Destination:</strong> ${destinationStop?.stopName || 'School Main Gate'}</div>
          </div>
          <div style="font-size: 10px; color: #94a3b8; text-align: right;">
            GPS Active • Last Ping: ${new Date(bus.lastGpsUpdate || Date.now()).toLocaleTimeString()}
          </div>
        </div>
      `;

      busMarker.bindPopup(popupContent);
      busMarker.on('click', () => {
        if (onSelectBus) onSelectBus(bus);
      });

      busesLayerRef.current.addLayer(busMarker);
    });

    // 3. Render Incident / Deviation Alerts
    if (showAlerts && alerts && alerts.length > 0) {
      alerts.forEach((alert) => {
        const lat = 25.608;
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
            ⚠️
          </div>
        `;

        const alertMarker = L.marker([lat, lon], {
          icon: L.divIcon({
            className: 'custom-alert-marker',
            html: alertIconHtml,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          }),
        });

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

    // Auto follow or fit bounds
    if (autoFollowBus && selectedBus && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([currentLat, currentLon], { animate: true, duration: 0.8 });
    }
  }, [selectedBus, allBuses, alerts, showActualPath, showAlerts, autoFollowBus, routeStops, originStop, destinationStop]);

  // Fit Entire Route & Bus on Map
  const handleFitRoute = useCallback(() => {
    if (!mapInstanceRef.current) return;

    const points = [];
    routeStops.forEach((s) => {
      if (s.latitude && s.longitude) points.push([Number(s.latitude), Number(s.longitude)]);
    });

    if (selectedBus?.currentLatitude && selectedBus?.currentLongitude) {
      points.push([Number(selectedBus.currentLatitude), Number(selectedBus.currentLongitude)]);
    }

    if (points.length > 0) {
      mapInstanceRef.current.fitBounds(L.latLngBounds(points).pad(0.18), { animate: true });
    }
  }, [routeStops, selectedBus]);

  // Automatically fit bounds once on initial selection
  useEffect(() => {
    if (selectedBus) {
      const timer = setTimeout(() => handleFitRoute(), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedBus?.busId]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '620px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'inherit',
        backgroundColor: '#f1f5f9',
      }}
    >
      {/* Real Interactive Full-Body Leaflet Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '620px',
          zIndex: 1,
          backgroundColor: '#e2e8f0',
        }}
      />

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
        @keyframes leafletPulseAdmin {
          0% { transform: scale(0.9); opacity: 0.8; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(0.9); opacity: 0; }
        }
      `}</style>

      {/* Top Floating Telemetry & Route Destination Banner */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          maxWidth: 'calc(100% - 32px)',
        }}
      >
        {/* Route & Destination Telemetry Pill */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            color: '#ffffff',
            padding: '7px 16px',
            borderRadius: '24px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '0.8rem',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#2dd4bf' }}>
            <span>🚌</span>
            <span>{selectedBus?.busNumber || 'Fleet Vehicle'}</span>
          </div>

          <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#94a3b8' }}>Traveled:</span>
            <strong style={{ color: '#38bdf8' }}>
              {selectedBus?.traveledDistanceKm || 7.8} km
            </strong>
            <span style={{ color: '#64748b' }}>
              / {selectedBus?.totalRouteDistanceKm || resolvedRoute?.totalDistanceKm || 18.5} km
            </span>
          </div>

          <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🏁</span>
            <span style={{ color: '#94a3b8' }}>Destination:</span>
            <strong style={{ color: '#f87171' }}>
              {destinationStop?.stopName || resolvedRoute?.endLocation || 'School Main Gate'}
            </strong>
          </div>

          <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.2)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 700 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 6px #10b981' }} />
            <span>GPS Live</span>
          </div>
        </div>

        {/* Floating Controls Bar: Map Style Selector & Layer Toggles */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Map Style Selector Pills */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '4px 6px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid rgba(226, 232, 240, 0.9)',
            }}
          >
            {[
              { key: 'STREETS', label: 'Streets', icon: '🗺️' },
              { key: 'HYBRID', label: 'Hybrid', icon: '🌐' },
              { key: 'SATELLITE', label: 'Satellite', icon: '🛰️' },
              { key: 'TERRAIN', label: 'Terrain', icon: '⛰️' },
              { key: 'OSM', label: 'OSM', icon: '🌍' },
            ].map((style) => {
              const isActive = mapStyle === style.key;
              return (
                <button
                  key={style.key}
                  onClick={() => setMapStyle(style.key)}
                  style={{
                    border: 'none',
                    background: isActive ? '#0d9488' : 'transparent',
                    color: isActive ? '#ffffff' : '#334155',
                    padding: '4px 9px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 2px 6px rgba(13, 148, 136, 0.35)' : 'none',
                  }}
                >
                  <span>{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              );
            })}

            {/* Traffic Toggle */}
            <button
              onClick={() => setShowTrafficOverlay(!showTrafficOverlay)}
              title="Toggle Live Traffic Layer"
              style={{
                border: showTrafficOverlay ? '1px solid #10b981' : '1px solid #e2e8f0',
                background: showTrafficOverlay ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: showTrafficOverlay ? '#059669' : '#64748b',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🚦</span>
              <span>Traffic</span>
            </button>
          </div>

          {/* Layer Filter Checkboxes */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '6px 12px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              border: '1px solid rgba(226, 232, 240, 0.9)',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showPlannedRoute}
                onChange={(e) => setShowPlannedRoute(e.target.checked)}
                style={{ accentColor: '#0284c7' }}
              />
              <span style={{ color: '#0284c7' }}>Route</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showActualPath}
                onChange={(e) => setShowActualPath(e.target.checked)}
                style={{ accentColor: '#0d9488' }}
              />
              <span style={{ color: '#0d9488' }}>Traveled Trail</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showStops}
                onChange={(e) => setShowStops(e.target.checked)}
                style={{ accentColor: '#10b981' }}
              />
              <span>Stops</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showGeofences}
                onChange={(e) => setShowGeofences(e.target.checked)}
                style={{ accentColor: '#06b6d4' }}
              />
              <span>Geofences</span>
            </label>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons (Right Controls: Geolocation, Zoom, Recenter, Fit Route, Fullscreen) */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Geolocation Permission & Locate Button */}
        <button
          onClick={handleLocateAdmin}
          disabled={isLocating}
          title={
            geoPermissionStatus === 'granted'
              ? 'GPS Permission Granted - Center on My Location'
              : 'Request GPS Permission & Locate My Position'
          }
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: geoPermissionStatus === 'granted' ? '#2563eb' : '#ffffff',
            color: geoPermissionStatus === 'granted' ? '#ffffff' : '#2563eb',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isLocating ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isLocating ? <RefreshCw size={18} className="animate-spin" /> : <LocateFixed size={18} />}
        </button>

        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          title="Zoom In"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
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
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1e293b',
          }}
        >
          <ZoomOut size={18} />
        </button>

        {/* Fit Entire Route & Bus */}
        <button
          onClick={handleFitRoute}
          title="Fit Entire Route & Destination"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0d9488',
          }}
        >
          <Maximize2 size={18} />
        </button>

        {/* Auto follow bus toggle */}
        <button
          onClick={() => setAutoFollowBus(!autoFollowBus)}
          title={autoFollowBus ? 'Disable Auto-follow Bus' : 'Enable Auto-follow Bus'}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            backgroundColor: autoFollowBus ? '#0d9488' : '#ffffff',
            color: autoFollowBus ? '#ffffff' : '#1e293b',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Navigation size={18} />
        </button>

        {/* Fullscreen toggle */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen' : 'Full Body Fullscreen'}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: isFullscreen ? '#0f172a' : '#ffffff',
              color: isFullscreen ? '#38bdf8' : '#1e293b',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isFullscreen ? <Shrink size={18} /> : <Expand size={18} />}
          </button>
        )}
      </div>

      {/* Floating Status Toast (if any) */}
      {locationMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '75px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 600,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {locationMessage}
        </div>
      )}

      {/* Bottom Left Legend & Status Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          zIndex: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '8px 14px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#475569',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '14px', height: '4px', backgroundColor: '#0d9488', borderRadius: '2px' }} />
          <span>Traveled Trail ({selectedBus?.traveledDistanceKm || 7.8} km)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '14px', height: '3px', borderTop: '2px dashed #0284c7' }} />
          <span>Remaining Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} />
          <span>Completed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span>🏁</span>
          <span style={{ color: '#ef4444' }}>Destination</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.7rem' }}>
          <span>● Active Map Sync</span>
        </div>
      </div>
    </div>
  );
};

export default TransportLiveMap;
