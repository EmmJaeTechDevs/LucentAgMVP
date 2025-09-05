// API Configuration
export const API_CONFIG = {
  // Base URL for your backend API - configurable via environment variables
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.NODE_ENV === 'production' 
      ? 'https://your-production-api.com' // Replace with your production API URL
      : 'http://localhost:8000'), // Default local backend URL
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      VERIFY: '/auth/verify',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
    },
    
    // User management
    USERS: {
      PROFILE: '/users/profile',
      UPDATE: '/users/update',
      DELETE: '/users/delete',
    },
    
    // Farmer-specific endpoints
    FARMERS: {
      REGISTER: '/farmers/register',
      PROFILE: '/farmers/profile',
      CROPS: '/farmers/crops',
      ORDERS: '/farmers/orders',
    },
    
    // Buyer-specific endpoints
    BUYERS: {
      REGISTER: '/buyers/register',
      PROFILE: '/buyers/profile',
      CART: '/buyers/cart',
      ORDERS: '/buyers/orders',
    },
    
    // Products/Crops
    PRODUCTS: {
      LIST: '/products',
      DETAILS: '/products/:id',
      SEARCH: '/products/search',
      CATEGORIES: '/products/categories',
    },
    
    // Orders
    ORDERS: {
      CREATE: '/orders',
      LIST: '/orders',
      DETAILS: '/orders/:id',
      UPDATE: '/orders/:id',
      CANCEL: '/orders/:id/cancel',
    },
    
    // Notifications
    NOTIFICATIONS: {
      LIST: '/notifications',
      MARK_READ: '/notifications/:id/read',
      PREFERENCES: '/notifications/preferences',
    },
  },
  
  // Request timeout in milliseconds - configurable via environment
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Replace URL parameters (e.g., :id with actual values)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  
  return url;
};

// Helper function to get headers with auth token
export const getAuthHeaders = (token?: string): HeadersInit => {
  const headers = { ...API_CONFIG.DEFAULT_HEADERS };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Environment-specific configuration
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.NODE_ENV === 'development',
  isProduction: import.meta.env.NODE_ENV === 'production',
  
  // Enable/disable logging - configurable via environment
  enableApiLogging: import.meta.env.VITE_ENABLE_API_LOGGING === 'true' || import.meta.env.NODE_ENV === 'development',
};