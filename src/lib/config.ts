export const APP_NAME = 'Duisburg Wohn-Straßen';

export const BASEMAP_CONFIG = {
  primary: {
    name: 'Geoportal (konfigurierbar)',
    url:
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  fallback: {
    name: 'OSM Fallback',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

export const DUISBURG_CENTER: [number, number] = [51.4344, 6.7623];
export const DEFAULT_ZOOM = 13;
