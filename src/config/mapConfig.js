/**
 * Google Maps Configuration and Multi-Provider Tile Definitions
 * Uses user-provided Google Maps API Key with robust fallbacks
 */

export const GOOGLE_MAPS_API_KEY =
  import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDKZHjGSluLqRpdpgrqrghIlAIi2kZ9FAs';

// Fallback tile URLs in case of quota, key restriction, or network offline issues
export const FALLBACK_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const FALLBACK_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const GOOGLE_MAP_STYLES = {
  STREETS: {
    key: 'STREETS',
    name: 'Google Streets',
    icon: '🗺️',
    url: (key = GOOGLE_MAPS_API_KEY) =>
      key
        ? `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${key}`
        : `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`,
    fallbackUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    subdomains: ['0', '1', '2', '3']
  },
  HYBRID: {
    key: 'HYBRID',
    name: 'Google Hybrid',
    icon: '🌐',
    url: (key = GOOGLE_MAPS_API_KEY) =>
      key
        ? `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${key}`
        : `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}`,
    fallbackUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Google Maps Imagery',
    maxZoom: 20,
    subdomains: ['0', '1', '2', '3']
  },
  SATELLITE: {
    key: 'SATELLITE',
    name: 'Google Satellite',
    icon: '🛰️',
    url: (key = GOOGLE_MAPS_API_KEY) =>
      key
        ? `https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${key}`
        : `https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}`,
    fallbackUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Google Maps Imagery',
    maxZoom: 20,
    subdomains: ['0', '1', '2', '3']
  },
  TERRAIN: {
    key: 'TERRAIN',
    name: 'Google Terrain',
    icon: '⛰️',
    url: (key = GOOGLE_MAPS_API_KEY) =>
      key
        ? `https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&key=${key}`
        : `https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}`,
    fallbackUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    subdomains: ['0', '1', '2', '3']
  },
  OSM: {
    key: 'OSM',
    name: 'OpenStreetMap',
    icon: '🌍',
    url: () => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    fallbackUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c']
  },
  TRAFFIC: {
    key: 'TRAFFIC',
    name: 'Live Traffic',
    icon: '🚦',
    url: (key = GOOGLE_MAPS_API_KEY) =>
      key
        ? `https://mt{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}&key=${key}`
        : `https://mt{s}.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}`,
    fallbackUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; Google Maps Traffic',
    maxZoom: 20,
    subdomains: ['0', '1', '2', '3']
  }
};
