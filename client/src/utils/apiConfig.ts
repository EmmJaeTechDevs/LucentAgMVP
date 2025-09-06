import { BaseUrl } from "../../../config";

// API Configuration for CORS-compliant requests
export const API_CONFIG = {
  BASE_URL: 'https://lucent-ag-api-damidek.replit.app',
  TIMEOUT: 15000,
  CORS_ENABLED: true,
  
  // Default headers for all requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },

  // CORS-specific headers for cross-origin requests
  CORS_HEADERS: {
    'Origin': typeof window !== 'undefined' ? window.location.origin : '',
    'X-Requested-With': 'XMLHttpRequest',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type, Accept'
  }
};

// Helper function to get full URL
export const getFullURL = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get request headers
export const getRequestHeaders = (customHeaders: Record<string, string> = {}): Record<string, string> => {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...API_CONFIG.CORS_HEADERS,
    ...customHeaders
  };
};