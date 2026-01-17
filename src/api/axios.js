// api/axios.js - ZOPTYMALIZOWANY z CACHE
import axios from 'axios';

// 🔥 Prosty cache w pamięci
const cache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minuta
const pendingRequests = new Map(); // Deduplikacja requestów

// Funkcja do generowania klucza cache
const getCacheKey = (config) => {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
};

// Funkcja do sprawdzania czy request powinien być cache'owany
const shouldCache = (config) => {
  // Cache tylko GET requests
  if (config.method !== 'get') return false;
  
  // Lista endpointów do cache'owania
  const cacheableEndpoints = [
    '/cpm-rates',
    '/user/stats',
    '/user/links',
    '/admin/stats',
    '/user/profile'
  ];
  
  return cacheableEndpoints.some(endpoint => config.url.includes(endpoint));
};

const api = axios.create({
  baseURL: 'https://angoralinks-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 sekund timeout
});

// 🚀 Request Interceptor - dodaj token + sprawdź cache
api.interceptors.request.use((config) => {
  // Dodaj token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Sprawdź cache dla GET requests
  if (shouldCache(config)) {
    const cacheKey = getCacheKey(config);
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Zwróć z cache
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        cached: true
      });
    }
    
    // Deduplikacja - jeśli ten sam request jest w trakcie
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
  }
  
  return config;
});

// 🚀 Response Interceptor - zapisz do cache
api.interceptors.response.use(
  (response) => {
    // Zapisz do cache
    if (shouldCache(response.config) && !response.cached) {
      const cacheKey = getCacheKey(response.config);
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      pendingRequests.delete(cacheKey);
    }
    
    return response;
  },
  (error) => {
    // Usuń z pending requests
    if (error.config) {
      const cacheKey = getCacheKey(error.config);
      pendingRequests.delete(cacheKey);
    }
    
    // Obsługa 401 - wylogowanie
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Nie przekierowuj jeśli już jesteśmy na login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// 🚀 Helper do invalidacji cache
export const invalidateCache = (pattern = null) => {
  if (pattern) {
    // Usuń konkretne klucze
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    // Wyczyść cały cache
    cache.clear();
  }
};

// 🚀 Helper do prefetchingu
export const prefetch = async (url, params = {}) => {
  try {
    await api.get(url, { params });
  } catch (error) {
    // Ignoruj błędy prefetchu
    console.debug('Prefetch failed:', url);
  }
};

export default api;