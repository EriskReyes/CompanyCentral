// Zentrale API-Konfiguration — Render in Produktion, localhost in Entwicklung
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; // Backend-URL: aus Umgebungsvariable oder lokaler Fallback
