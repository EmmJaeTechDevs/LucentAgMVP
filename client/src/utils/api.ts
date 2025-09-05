import { API_CONFIG, buildApiUrl, getAuthHeaders, ENV_CONFIG } from '@/config/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Custom error class for API errors
export class ApiException extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.code = code;
  }
}

// Helper function to get auth token from localStorage
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
};

// Core API client class
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Log API calls in development
  private log(method: string, url: string, data?: any) {
    if (ENV_CONFIG.enableApiLogging) {
      console.log(`[API] ${method.toUpperCase()} ${url}`, data ? { data } : '');
    }
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, string | number>
  ): Promise<T> {
    const url = buildApiUrl(endpoint, params);
    const token = getStoredToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...getAuthHeaders(token),
        ...options.headers,
      },
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    this.log(options.method || 'GET', url, options.body);

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiException(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiException) {
        throw error;
      }
      
      if (error.name === 'AbortError') {
        throw new ApiException('Request timeout', 408, 'TIMEOUT');
      }
      
      throw new ApiException('Network error', 0, 'NETWORK_ERROR');
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, params);
  }

  // POST request
  async post<T>(endpoint: string, data?: any, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      params
    );
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      params
    );
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      params
    );
  }

  // DELETE request
  async delete<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, params);
  }

  // Upload file
  async upload<T>(endpoint: string, file: File, data?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const token = getStoredToken();
    const url = buildApiUrl(endpoint);

    this.log('POST', url, { file: file.name, ...data });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiException(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    return response.json();
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Convenience functions using the predefined endpoints
export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),
    
    register: (userData: any) =>
      apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData),
    
    verify: (token: string) =>
      apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY, { token }),
    
    refreshToken: () =>
      apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH),
    
    logout: () =>
      apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT),
  },

  // Farmers
  farmers: {
    register: (farmerData: any) =>
      apiClient.post(API_CONFIG.ENDPOINTS.FARMERS.REGISTER, farmerData),
    
    getProfile: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.FARMERS.PROFILE),
    
    updateProfile: (data: any) =>
      apiClient.put(API_CONFIG.ENDPOINTS.FARMERS.PROFILE, data),
    
    getCrops: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.FARMERS.CROPS),
    
    getOrders: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.FARMERS.ORDERS),
  },

  // Buyers
  buyers: {
    register: (buyerData: any) =>
      apiClient.post(API_CONFIG.ENDPOINTS.BUYERS.REGISTER, buyerData),
    
    getProfile: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.BUYERS.PROFILE),
    
    updateProfile: (data: any) =>
      apiClient.put(API_CONFIG.ENDPOINTS.BUYERS.PROFILE, data),
    
    getCart: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.BUYERS.CART),
    
    getOrders: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.BUYERS.ORDERS),
  },

  // Products
  products: {
    getAll: (filters?: any) =>
      apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.LIST, filters),
    
    getById: (id: string | number) =>
      apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.DETAILS, { id }),
    
    search: (query: string) =>
      apiClient.get(`${API_CONFIG.ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}`),
    
    getCategories: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.PRODUCTS.CATEGORIES),
  },

  // Orders
  orders: {
    create: (orderData: any) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ORDERS.CREATE, orderData),
    
    getAll: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.ORDERS.LIST),
    
    getById: (id: string | number) =>
      apiClient.get(API_CONFIG.ENDPOINTS.ORDERS.DETAILS, { id }),
    
    update: (id: string | number, data: any) =>
      apiClient.put(API_CONFIG.ENDPOINTS.ORDERS.UPDATE, data, { id }),
    
    cancel: (id: string | number) =>
      apiClient.post(API_CONFIG.ENDPOINTS.ORDERS.CANCEL, {}, { id }),
  },

  // Notifications
  notifications: {
    getAll: () =>
      apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST),
    
    markAsRead: (id: string | number) =>
      apiClient.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ, {}, { id }),
    
    updatePreferences: (preferences: any) =>
      apiClient.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences),
  },
};