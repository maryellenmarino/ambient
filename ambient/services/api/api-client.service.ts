/**
 * API Client Service
 * 
 * Provides a centralized HTTP client with error handling,
 * retry logic, and request/response interceptors.
 */

import { API_CONFIG } from "@/config/api.config";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retryAttempts?: number;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Make an API request with retry logic and error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    timeout = API_CONFIG.TIMEOUT,
    retryAttempts = API_CONFIG.RETRY_ATTEMPTS,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const requestHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...headers,
      };

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
      };

      if (body) {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(endpoint, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await parseErrorResponse(response);
        throw new ApiClientError(
          response.status,
          errorData.code || "API_ERROR",
          errorData.message || `Request failed with status ${response.status}`,
          errorData.details
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (
        error instanceof ApiClientError &&
        error.status >= 400 &&
        error.status < 500 &&
        error.status !== 429
      ) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt < retryAttempts) {
        await delay(API_CONFIG.RETRY_DELAY * (attempt + 1));
        continue;
      }

      // If it's an abort (timeout), throw a specific error
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiClientError(
          408,
          "TIMEOUT",
          `Request timed out after ${timeout}ms`
        );
      }

      throw error;
    }
  }

  throw lastError || new Error("Request failed after retries");
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(
  response: Response
): Promise<{ message: string; code?: string; details?: unknown }> {
  try {
    const data = await response.json();
    return {
      message: data.message || data.error || "An error occurred",
      code: data.code || data.error_code,
      details: data.details || data,
    };
  } catch {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
      code: `HTTP_${response.status}`,
    };
  }
}

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

