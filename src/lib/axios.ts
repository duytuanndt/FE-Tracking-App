import { refreshToken } from '@/apis/authApis';
import { RefreshTokenResponse } from '@/entities/auth';
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// Create axios instance with base URL
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:7337/api', // http://localhost:7337/api https://appletracking.mobileltd.org/api
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 5 seconds
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');

    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    // Handle request error
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // You can modify or process response data here
    return response;
  },
  (error: AxiosError) => {
    // Handle specific error statuses
    const status = error.response?.status;

    switch (status) {
      case 401: {
        // Unauthorized - try to refresh token
        const refresh_token = localStorage.getItem('refresh_token');
        if (!refresh_token) {
          localStorage.removeItem('accessToken');
          console.error('Authentication error. Please log in again.');
          return Promise.reject(error);
        }
        return refreshToken(refresh_token)
          .then((data: any) => {
            const { access_token: token, refresh_token: newRefreshToken } =
              data as RefreshTokenResponse;
            // Save new tokens to localStorage
            if (token) {
              localStorage.setItem('accessToken', token);
            }
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }
            // Retry the original request with the new token
            if (token) {
              const originalRequest = error.config;
              if (originalRequest && originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return apiClient(originalRequest);
              }
            }
            // If no new token, remove old token and throw error
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refresh_token');
            console.error('Authentication error. Please log in again.');
            return Promise.reject(error);
          })
          .catch((refreshError: any) => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refresh_token');
            console.error('Authentication error. Please log in again.');
            return Promise.reject(refreshError);
          });
      }

      case 403:
        // Forbidden
        console.error('You do not have permission to access this resource');
        break;

      case 404:
        // Not found
        console.error('Resource not found');
        break;

      case 500:
        // Server error
        console.error('Server error occurred. Please try again later.');
        break;

      default:
        console.error('API request failed:', error.message);
    }

    return Promise.reject(error);
  },
);

// Export the configured axios instance
export default apiClient;

// Helper methods for common HTTP requests
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient
      .get<T>(url, config)
      .then((response: AxiosResponse<T>) => response.data),

  post: <T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ) =>
    apiClient
      .post<T>(url, data, config)
      .then((response: AxiosResponse<T>) => response.data),

  put: <T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ) =>
    apiClient
      .put<T>(url, data, config)
      .then((response: AxiosResponse<T>) => response.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient
      .delete<T>(url, config)
      .then((response: AxiosResponse<T>) => response.data),

  patch: <T, D = Record<string, unknown>>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ) =>
    apiClient
      .patch<T>(url, data, config)
      .then((response: AxiosResponse<T>) => response.data),
};

// React Query hooks for API calls
export function useApiQuery<T>(
  queryKey: QueryKey,
  url: string,
  config?: AxiosRequestConfig,
  options?: Omit<
    UseQueryOptions<T, AxiosError, T, QueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<T, AxiosError>({
    queryKey,
    queryFn: () => api.get<T>(url, config),
    ...options,
  });
}

export function useApiMutation<TData, TVariables = Record<string, unknown>>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post',
  options?: Omit<
    UseMutationOptions<TData, AxiosError, TVariables>,
    'mutationFn'
  >,
) {
  const mutationFn = (variables: TVariables) => {
    if (method === 'delete') {
      return api.delete<TData>(url);
    }

    return api[method]<TData, TVariables>(url, variables);
  };

  return useMutation<TData, AxiosError, TVariables>({
    mutationFn,
    ...options,
  });
}
