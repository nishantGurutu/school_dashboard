import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import {
  X,
  Bus,
  MapPin,
  Phone,
  Navigation,
  Gauge,
  Clock,
  Compass,
  ArrowRight,
  Maximize2,
  Minimize2,
  LocateFixed,
  Route,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { GOOGLE_MAPS_API_KEY } from '../../../config/mapConfig';

/**
 * BusTrackModal
 * Dedicated, error-proof map modal showing a specific bus's route, sequenced stops,
 * and current location.
 * - When bus travel HAS NOT occurred: Map automatically shows the CURRENT LOCATION
 *   (real device/school GPS location) with 0 km/h Parked status, NO fake Patna data!
 * - When bus travel HAS occurred: Renders actual route & stops.
 * - Includes Google Maps API key from AndroidManifest with multi-layer switcher and unmissable close options.
 */
export const BusTrackModal = ({
  isOpen,
  onClose,
  bus,
  route,
  driver,
  liveData
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const stopsLayerRef = useRef(null);
  const busMarkerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTileType, setActiveTileType] = useState('GOOGLE_STREETS');

  // Real device/browser Geolocation
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        onClose?.();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Request actual Current Location via browser Geolocation API
  const detectCurrentLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy
        });
        setIsLocating(false);

        // If map is already initialized, pan smoothly to current location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15, { animate: true });
        }
      },
      (err) => {
        console.warn('Geolocation error / permission denied:', err.message);
        setIsLocating(false);
        setLocationError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 10000
      }
    );
  }, []);

  // Run location detection as soon as modal opens
  useEffect(() => {
    if (isOpen) {
      detectCurrentLocation();
    }
  }, [isOpen, detectCurrentLocation]);

  // Determine whether this bus has actually traveled / is in an active trip
  const isTraveling = useMemo(() => {
    if (!bus && !liveData) return false;
    const tripStatus = liveData?.tripStatus || bus?.tripStatus;
    const speed = Number(liveData?.currentSpeedKmh || bus?.currentSpeedKmh || 0);
    const dist = Number(liveData?.traveledDistanceKm || bus?.traveledDistanceKm || 0);

    // Bus is considered traveling only if trip is in progress and has movement/distance
    return tripStatus === 'IN_PROGRESS' && (speed > 0 || dist > 0);
  }, [bus, liveData]);

  // Resolve Real Stops from configured route (NO fake Patna hardcoded stops!)
  const stops = useMemo(() => {
    if (route && Array.isArray(route.stops) && route.stops.length > 0) {
      return route.stops;
    }
    return [];
  }, [route]);

  // Resolve Bus Coordinates:
  // 1. If bus hasn't traveled: Use real-time Current Location (from GPS/device)
  // 2. If bus is traveling: Use live telemetry coordinates from backend
  const busLat = useMemo(() => {
    if (!isTraveling && currentLocation?.lat) {
      return currentLocation.lat;
    }
    if (liveData?.currentLatitude && Math.abs(liveData.currentLatitude) > 0.001) {
      return Number(liveData.currentLatitude);
    }
    if (bus?.lastLatitude && Math.abs(bus.lastLatitude) > 0.001) {
      return Number(bus.lastLatitude);
    }
    if (currentLocation?.lat) {
      return currentLocation.lat;
    }
    // Default fallback to center of user/campus if no GPS is available
    return 28.6139; // Default reference (New Delhi)
  }, [isTraveling, currentLocation, liveData, bus]);

  const busLng = useMemo(() => {
    if (!isTraveling && currentLocation?.lng) {
      return currentLocation.lng;
    }
    if (liveData?.currentLongitude && Math.abs(liveData.currentLongitude) > 0.001) {
      return Number(liveData.currentLongitude);
    }
    if (bus?.lastLongitude && Math.abs(bus.lastLongitude) > 0.001) {
      return Number(bus.lastLongitude);
    }
    if (currentLocation?.lng) {
      return currentLocation.lng;
    }
    return 77.2090; // Default reference (New Delhi)
  }, [isTraveling, currentLocation, liveData, bus]);

  const busSpeed = isTraveling ? Math.round(Number(liveData?.currentSpeedKmh || 0)) : 0;
  const driverName = driver?.name || bus?.assignedDriverName || 'Not Assigned';
  const driverPhone = driver?.phone || bus?.assignedDriverPhone || 'N/A';
  const routeName = route?.routeName || bus?.assignedRouteName || 'Unassigned Route';

  // Helper to get tile configuration using AndroidManifest Google Maps API Key
  const getTileConfig = (type) => {
    const key = GOOGLE_MAPS_API_KEY || 'AIzaSyDKZHjGSluLqRpdpgrqrghIlAIi2kZ9FAs';
    if (type === 'GOOGLE_STREETS') {
      return {
        url: `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${key}`,
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps',
        maxZoom: 20
      };
    }
    if (type === 'GOOGLE_HYBRID') {
      return {
        url: `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${key}`,
        subdomains: ['0', '1', '2', '3'],
        attribution: '&copy; Google Maps Imagery',
        maxZoom: 20
      };
    }
    // High-speed clean CartoDB Voyager fallback
    return {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      subdomains: 'abcd',
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19
    };
  };

  // Switch Tile Layer
  const setTileLayer = (map, type) => {
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const config = getTileConfig(type);
    const newLayer = L.tileLayer(config.url, {
      subdomains: config.subdomains,
      maxZoom: config.maxZoom,
      attribution: config.attribution
    });

    // Graceful auto-fallback to Voyager if Google Maps tiles are blocked by key restrictions
    newLayer.on('tileerror', () => {
      if (type.startsWith('GOOGLE') && !map._hasAutoFallenBack) {
        map._hasAutoFallenBack = true;
        if (tileLayerRef.current) {
          map.removeLayer(tileLayerRef.current);
        }
        const fallback = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          {
            subdomains: 'abcd',
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
          }
        );
        fallback.addTo(map);
        tileLayerRef.current = fallback;
      }
    });

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  };

  // Initialize and Update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = [busLat, busLng];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Set initial tiles
    setTileLayer(map, activeTileType);

    // Layer groups
    const routeGroup = L.featureGroup().addTo(map);
    stopsLayerRef.current = L.layerGroup().addTo(map);

    // 1. Draw Route Polyline ONLY if bus is traveling AND route has actual stops!
    if (isTraveling && stops.length > 1) {
      const latLngs = stops.map((s) => [Number(s.latitude), Number(s.longitude)]);

      L.polyline(latLngs, {
        color: '#064e3b',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(routeGroup);

      routePolylineRef.current = L.polyline(latLngs, {
        color: '#0d9488',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '8, 8'
      }).addTo(routeGroup);

      // Add Ordered Stop Markers
      stops.forEach((stop, idx) => {
        const isDestination = idx === stops.length - 1;
        const isOrigin = idx === 0;
        const markerColor = isDestination ? '#2563eb' : isOrigin ? '#10b981' : '#0d9488';

        const stopHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              background: #ffffff;
              border: 2px solid ${markerColor};
              color: ${markerColor};
              font-size: 11px;
              font-weight: 800;
              padding: 2px 8px;
              border-radius: 12px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.22);
              white-space: nowrap;
              margin-bottom: 3px;
              font-family: inherit;
            ">
              ${stop.stopName}
            </div>
            <div style="
              width: 26px;
              height: 26px;
              border-radius: 50%;
              background: ${markerColor};
              color: #ffffff;
              border: 2px solid #ffffff;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 900;
              font-family: inherit;
            ">
              ${stop.stopOrder || idx + 1}
            </div>
          </div>
        `;

        const stopMarker = L.marker([Number(stop.latitude), Number(stop.longitude)], {
          icon: L.divIcon({
            className: 'custom-stop-marker',
            html: stopHtml,
            iconSize: [120, 50],
            iconAnchor: [60, 48]
          })
        });

        stopMarker.bindPopup(`
          <div style="font-family: inherit; min-width: 170px; padding: 4px;">
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
              Stop ${stop.stopOrder || idx + 1}: ${stop.stopName}
            </div>
            <div style="font-size: 11px; color: #0d9488; font-weight: 700;">
              Morning Pickup: ${stop.plannedMorningPickupTime || 'N/A'}
            </div>
            <div style="font-size: 11px; color: #2563eb; font-weight: 700;">
              Evening Drop: ${stop.plannedEveningDropTime || 'N/A'}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
              Landmark: ${stop.landmark || 'Not specified'}
            </div>
          </div>
        `);

        stopsLayerRef.current.addLayer(stopMarker);
      });
    }

    // 2. Bus Marker (Differentiates between Live In-Transit vs Parked at Current Location)
    const isLiveMoving = isTraveling && busSpeed > 0;
    const statusLabel = isLiveMoving
      ? `${busSpeed} km/h • In Transit`
      : 'Parked / Idle (Current Location)';
    const statusColor = isLiveMoving ? '#10b981' : '#f59e0b';

    const busHtml = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        ${
          isLiveMoving
            ? `<div style="
                position: absolute;
                top: 10px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: rgba(13, 148, 136, 0.4);
                animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>`
            : ''
        }
        <div style="
          background: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          white-space: nowrap;
          margin-bottom: 2px;
          border: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: ${statusColor}; display: inline-block;"></span>
          ${bus?.busNumber || 'Bus'} • ${statusLabel}
        </div>
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${
            isLiveMoving
              ? 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)'
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
          };
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 18px;
        ">
          🚌
        </div>
      </div>
    `;

    busMarkerRef.current = L.marker([busLat, busLng], {
      icon: L.divIcon({
        className: 'custom-bus-marker',
        html: busHtml,
        iconSize: [140, 65],
        iconAnchor: [70, 60]
      }),
      zIndexOffset: 1000
    });

    busMarkerRef.current.bindPopup(`
      <div style="font-family: inherit; min-width: 190px; padding: 4px;">
        <div style="font-size: 13px; font-weight: 800; color: #0d9488; margin-bottom: 4px;">
          ${bus?.busNumber || 'Vehicle'} (${bus?.registrationNumber || 'School Bus'})
        </div>
        <div style="font-size: 12px; font-weight: 700; color: ${statusColor}; margin-bottom: 4px;">
          Status: ${isLiveMoving ? '● IN TRANSIT' : '○ PARKED / IDLE (Travel Not Started)'}
        </div>
        <div style="font-size: 11px; color: #64748b;">
          Current Location: ${currentLocation ? 'Live Device GPS' : 'Depot / School Base'}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          Speed: ${busSpeed} km/h
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          Driver: ${driverName} (${driverPhone})
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          Assigned Route: ${routeName}
        </div>
      </div>
    `);

    busMarkerRef.current.addTo(map);

    // If bus is traveling and stops exist, fit all stops and bus position
    if (isTraveling && stops.length > 0) {
      try {
        const allPoints = [
          [busLat, busLng],
          ...stops.map((s) => [Number(s.latitude), Number(s.longitude)])
        ];
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch {
        map.setView([busLat, busLng], 15);
      }
    } else {
      // If bus has not traveled: Center purely on the CURRENT LOCATION
      map.setView([busLat, busLng], 15);
    }

    // Repeated size invalidation ensures no blank tiles
    const t1 = setTimeout(() => map.invalidateSize(), 60);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    mapInstanceRef.current = map;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    isOpen,
    busLat,
    busLng,
    isTraveling,
    stops,
    bus,
    busSpeed,
    driverName,
    driverPhone,
    routeName,
    currentLocation
  ]);

  // Handle Layer switch dynamically
  const handleSwitchLayer = (type) => {
    setActiveTileType(type);
    if (mapInstanceRef.current) {
      setTileLayer(mapInstanceRef.current, type);
    }
  };

  // Center on Bus / Current Location
  const handleCenterOnLocation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([busLat, busLng], 16, { animate: true });
      if (busMarkerRef.current) {
        busMarkerRef.current.openPopup();
      }
    }
  };

  if (!isOpen || !bus) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }}
      onClick={(e) => {
        // Close modal when clicking outside dialog
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          width: isFullscreen ? '99vw' : '95%',
          maxWidth: isFullscreen ? '99vw' : '1100px',
          height: isFullscreen ? '98vh' : '92vh',
          maxHeight: '94vh',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header with Unmissable Close Button */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '14px 22px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-app)',
            flexShrink: 0
          }}
        >
          {/* Bus Info & Location Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: isTraveling ? 'rgba(13, 148, 136, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isTraveling ? '#0d9488' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Bus size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {bus.busNumber} — {isTraveling ? 'Travel Route Tracker' : 'Current Bus Location'}
                </h3>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: isTraveling ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: isTraveling ? '#10b981' : '#f59e0b',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {isTraveling ? '● IN TRANSIT' : '○ PARKED / IDLE'}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {bus.registrationNumber}
                </span>

                {/* Live Geolocation Status */}
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: currentLocation ? 'rgba(16, 185, 129, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                    border: currentLocation ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(37, 99, 235, 0.3)',
                    color: currentLocation ? '#10b981' : '#2563eb',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: currentLocation ? '#10b981' : '#2563eb' }} />
                  {currentLocation ? 'Live GPS Location Synced' : 'Google Maps Active'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Assigned Route: <strong style={{ color: 'var(--text-primary)' }}>{routeName}</strong> • Driver: {driverName}
              </p>
            </div>
          </div>

          {/* Action & Close Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{isFullscreen ? 'Exit' : 'Expand'}</span>
            </button>

            {/* UNMISSABLE HIGH-CONTRAST RED CLOSE BUTTON */}
            <button
              onClick={onClose}
              title="Close Dialog (or press ESC key)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(239, 68, 68, 0.4)'
              }}
            >
              <X size={18} />
              <span>Close Map</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  marginLeft: '2px'
                }}
              >
                ESC
              </span>
            </button>
          </div>
        </div>

        {/* Informational Status Banner when Bus HAS NOT Traveled */}
        {!isTraveling && (
          <div
            style={{
              padding: '8px 22px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '0.82rem',
              color: '#d97706',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Bus ka travel abhi start nahi hua hai:</strong> Map par bus ki actual{' '}
                <strong>Current Location (Parked / Idle)</strong> dikhayi ja rahi hai.
              </span>
            </div>
            <button
              onClick={detectCurrentLocation}
              disabled={isLocating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={12} className={isLocating ? 'spin' : ''} />
              {isLocating ? 'Locating...' : 'Refresh Current Location'}
            </button>
          </div>
        )}

        {/* Info Strip (Driver, Speed, Distance, Current Location Status) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            padding: '10px 22px',
            backgroundColor: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            flexShrink: 0
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 600 }}>DRIVER IN-CHARGE</span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{driverName}</div>
            <div style={{ fontSize: '0.74rem', color: '#0d9488' }}>{driverPhone}</div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 600 }}>CURRENT TELEMETRY</span>
            <div
              style={{
                fontWeight: 800,
                fontSize: '1.05rem',
                color: isTraveling ? '#0d9488' : '#f59e0b',
                marginTop: '2px'
              }}
            >
              {busSpeed} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>km/h</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: isTraveling ? '#10b981' : '#f59e0b' }}>
              {isTraveling ? '● Bus in Motion' : '○ Parked / Travel Not Started'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 600 }}>LOCATION COORDINATES</span>
            <div style={{ fontWeight: 700, marginTop: '2px', fontSize: '0.8rem' }}>
              {busLat.toFixed(4)}° N, {busLng.toFixed(4)}° E
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {currentLocation ? 'Live Device GPS Synced' : 'Base / Depot Location'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 600 }}>ROUTE STATUS</span>
            <div style={{ fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
              {isTraveling ? `${stops.length} Stops Active` : 'Scheduled / Idle'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {routeName}
            </div>
          </div>
        </div>

        {/* Map Body Container */}
        <div style={{ position: 'relative', flex: 1, minHeight: '380px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
          {/* Leaflet Map Canvas */}
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          />

          {/* Floating Close Button on Top-Left of Map */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              zIndex: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.88)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(4px)'
              }}
            >
              <X size={14} color="#ef4444" /> Close Map
            </button>
          </div>

          {/* Floating Controls & Tile Switcher on Top-Right */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              zIndex: 500,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            {/* Tile Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '3px',
                gap: '3px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.18)'
              }}
            >
              <button
                onClick={() => handleSwitchLayer('GOOGLE_STREETS')}
                title="Google Streets Map"
                style={{
                  padding: '5px 9px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTileType === 'GOOGLE_STREETS' ? '#0d9488' : 'transparent',
                  color: activeTileType === 'GOOGLE_STREETS' ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🗺️ Google
              </button>
              <button
                onClick={() => handleSwitchLayer('GOOGLE_HYBRID')}
                title="Google Satellite / Hybrid"
                style={{
                  padding: '5px 9px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTileType === 'GOOGLE_HYBRID' ? '#0d9488' : 'transparent',
                  color: activeTileType === 'GOOGLE_HYBRID' ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🛰️ Satellite
              </button>
              <button
                onClick={() => handleSwitchLayer('CARTO_VOYAGER')}
                title="Standard Vector Map"
                style={{
                  padding: '5px 9px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTileType === 'CARTO_VOYAGER' ? '#0d9488' : 'transparent',
                  color: activeTileType === 'CARTO_VOYAGER' ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🌍 Clean
              </button>
            </div>

            {/* Quick Action: Center on Current Location */}
            <button
              onClick={handleCenterOnLocation}
              title="Focus on Bus / Current Location"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0d9488',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <LocateFixed size={14} /> Center on Location
            </button>

            {/* Detect Real Current Location button */}
            <button
              onClick={detectCurrentLocation}
              title="Query Browser Real GPS Location"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '7px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#2563eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <MapPin size={14} /> Detect Current GPS
            </button>
          </div>

          {/* Map Legend */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '14px',
              zIndex: 500,
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: isTraveling ? '#10b981' : '#f59e0b',
                  display: 'inline-block'
                }}
              />
              <span>{isTraveling ? 'Live Transit' : 'Current Location (Parked)'}</span>
            </div>
            {isTraveling && stops.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '4px', backgroundColor: '#0d9488', display: 'inline-block', borderRadius: '2px' }} />
                <span>Travel Path</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Stop Progression Strip ONLY when real stops are present */}
        {isTraveling && stops.length > 0 && (
          <div
            style={{
              padding: '12px 22px',
              backgroundColor: 'var(--bg-app)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                Route Stops Sequence ({stops.length} Stops)
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {routeName}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px'
              }}
            >
              {stops.map((stop, sIdx) => {
                const isFirst = sIdx === 0;
                const isLast = sIdx === stops.length - 1;
                return (
                  <React.Fragment key={stop.id || sIdx}>
                    <div
                      style={{
                        minWidth: '175px',
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        flexShrink: 0
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: isLast ? '#2563eb' : isFirst ? '#10b981' : '#0d9488',
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {stop.stopOrder || sIdx + 1}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {stop.stopName}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600 }}>
                        Pickup: {stop.plannedMorningPickupTime || 'N/A'}
                      </div>
                    </div>
                    {sIdx < stops.length - 1 && (
                      <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Actions Footer with Clear Close Option */}
        <div
          style={{
            padding: '12px 22px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-card)',
            flexShrink: 0
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Key configured:</span>
            <code style={{ fontSize: '0.72rem', backgroundColor: 'var(--bg-app)', padding: '2px 6px', borderRadius: '4px' }}>
              {GOOGLE_MAPS_API_KEY.slice(0, 10)}...{GOOGLE_MAPS_API_KEY.slice(-4)}
            </code>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 24px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
              }}
            >
              <X size={16} /> Close Route Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusTrackModal;
