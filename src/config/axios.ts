import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from './environment';

// Create axios instance with default configuration
const createAxiosInstance = (baseURL?: string): AxiosInstance => {
  const config: {
    timeout: number;
    headers: {
      'Content-Type': string;
      'Accept': string;
    };
    baseURL?: string;
  } = {
    timeout: 30000, // 30 seconds timeout
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };
  
  if (baseURL) {
    config.baseURL = baseURL;
  }
  
  const instance = axios.create(config);

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Add timestamp to prevent caching
      config.params = {
        ...config.params,
        _t: Date.now(),
      };

      return config;
    },
    (error) => {
      console.error('[HTTP Request Error]', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      // Log error
      console.error('[HTTP Response Error]', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
      });

      // Handle specific error cases
      const status = error.response?.status;
      if (status === 401) {
        console.error('Unauthorized access - check authentication');
      } else if (status === 403) {
        console.error('Forbidden access - insufficient permissions');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status && status >= 500) {
        console.error('Server error occurred');
      } else if (error.code === 'ECONNABORTED') {
        console.error('Request timeout');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.error('Connection failed - service may be down');
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create axios instance for core service
export const httpClient = createAxiosInstance(config.API_URL_CORE);

// Create custom axios instance for specific services
export const createHttpClient = (baseURL: string): AxiosInstance => {
  return createAxiosInstance(baseURL);
};

// Create axios instance without baseURL for flexible usage
export const createFlexibleHttpClient = (): AxiosInstance => {
  return createAxiosInstance();
};

// HTTP methods wrapper with error handling
export class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL?: string) {
    this.instance = createAxiosInstance(baseURL);
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with error status
        return new Error(`HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`);
      } else if (axiosError.request) {
        // Request was made but no response received
        return new Error('Network error: No response from server');
      } else {
        // Something else happened
        return new Error(`Request error: ${axiosError.message}`);
      }
    }
    
    return error;
  }
}

// Export default HTTP client instance
export const defaultHttpClient = new HttpClient();

export default httpClient;
