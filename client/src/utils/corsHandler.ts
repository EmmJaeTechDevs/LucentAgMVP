import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, getFullURL, getRequestHeaders } from './apiConfig';

// CORS-compliant API handler
class CORSHandler {
  private baseURL: string;
  private corsProxyEnabled: boolean;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.corsProxyEnabled = false;
  }

  // Check if we need to use CORS proxy
  private async checkCORSSupport(): Promise<boolean> {
    try {
      // Try a simple HEAD request to check CORS
      await axios.head(`${this.baseURL}/api/health`, {
        timeout: 5000,
        headers: {
          'Origin': window.location.origin,
        }
      });
      return true;
    } catch (error: any) {
      console.log('CORS check failed, enabling proxy mode');
      return false;
    }
  }

  // Get the appropriate URL for requests
  private getRequestURL(endpoint: string): string {
    // Check if we're in development and can use local proxy
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('replit')) {
      // Try direct request first, fallback to different strategies
      return `${this.baseURL}${endpoint}`;
    }
    return `${this.baseURL}${endpoint}`;
  }

  // Make CORS-compliant requests
  async makeRequest(endpoint: string, options: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    // Initialize CORS support check on first request
    if (!this.corsProxyEnabled) {
      const corsSupported = await this.checkCORSSupport();
      if (!corsSupported) {
        this.corsProxyEnabled = true;
      }
    }

    const url = this.getRequestURL(endpoint);
    
    const config: AxiosRequestConfig = {
      ...options,
      url,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin,
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
      },
      timeout: API_CONFIG.TIMEOUT,
      withCredentials: false, // Important for CORS
      // Additional axios config for CORS
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // Accept 4xx errors as valid responses
    };

    try {
      return await axios(config);
    } catch (error: any) {
      // If CORS proxy fails, try direct request as fallback
      if (this.corsProxyEnabled && error.code === 'NETWORK_ERROR') {
        console.log('Proxy failed, trying direct request');
        this.corsProxyEnabled = false;
        const directUrl = `${this.baseURL}${endpoint}`;
        
        return await axios({
          ...config,
          url: directUrl,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
          }
        });
      }
      throw error;
    }
  }

  // Specific method for POST requests that avoids CORS preflight
  async post(endpoint: string, data: any, options: AxiosRequestConfig = {}): Promise<AxiosResponse> {
    // Use simple request to avoid CORS preflight
    const url = this.getRequestURL(endpoint);
    
    try {
      return await axios({
        method: 'POST',
        url,
        data,
        headers: {
          'Content-Type': 'text/plain', // Use text/plain to avoid preflight
        },
        timeout: API_CONFIG.TIMEOUT,
        withCredentials: false,
        transformRequest: [(data) => {
          // Transform data to JSON string for text/plain content type
          return JSON.stringify(data);
        }],
        transformResponse: [(data) => {
          // Parse JSON response
          try {
            return JSON.parse(data);
          } catch (e) {
            return data;
          }
        }],
        ...options,
      });
    } catch (error: any) {
      // Fallback: Try with form data encoding
      if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
        try {
          const formData = new FormData();
          formData.append('data', JSON.stringify(data));
          
          return await axios({
            method: 'POST',
            url,
            data: formData,
            headers: {
              // Let browser set Content-Type for FormData
            },
            timeout: API_CONFIG.TIMEOUT,
            withCredentials: false,
            ...options,
          });
        } catch (formError) {
          console.error('Both JSON and FormData requests failed');
          throw error; // Throw original error
        }
      }
      throw error;
    }
  }

  // Method to enable/disable CORS proxy manually
  setCORSProxy(enabled: boolean) {
    this.corsProxyEnabled = enabled;
  }
}

// Export singleton instance
export const corsHandler = new CORSHandler();