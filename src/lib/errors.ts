// ══════════════════════════════════════════════════════════════
// ERROR HANDLING
// Centralized error types and utilities
// ══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

// ══════════════════════════════════════════════════════════════
// ERROR TYPES
// ══════════════════════════════════════════════════════════════

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super("Too many requests", "RATE_LIMIT", 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
  retryAfter: number;
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`, "EXTERNAL_SERVICE", 502);
    this.name = "ExternalServiceError";
  }
}

// ══════════════════════════════════════════════════════════════
// API RESPONSE HELPERS
// ══════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export function apiSuccess<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

export function apiCreated<T>(data: T): NextResponse<ApiResponse<T>> {
  return apiSuccess(data, 201);
}

export function apiError(
  error: AppError | Error,
  status?: number
): NextResponse<ApiResponse<never>> {
  if (error instanceof AppError) {
    const field = error instanceof ValidationError ? error.field : undefined;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          field,
        },
      },
      { status: error.statusCode }
    );
  }

  // Unknown error - don't leak details
  console.error("Unhandled error:", error);
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: status || 500 }
  );
}

export function apiValidationError(message: string, field?: string): NextResponse {
  const error = new ValidationError(message, field);
  return apiError(error);
}

export function apiAuthError(message?: string): NextResponse {
  const error = new AuthenticationError(message);
  return apiError(error);
}

export function apiNotFound(resource: string): NextResponse {
  const error = new NotFoundError(resource);
  return apiError(error);
}

export function apiRateLimitError(retryAfter: number): NextResponse {
  const error = new RateLimitError(retryAfter);
  const response = apiError(error);
  response.headers.set("Retry-After", retryAfter.toString());
  return response;
}

// ══════════════════════════════════════════════════════════════
// ERROR LOGGER
// ══════════════════════════════════════════════════════════════

export function logError(error: Error, context?: Record<string, unknown>): void {
  const logData = {
    timestamp: new Date().toISOString(),
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    ...context,
  };

  // In production, you'd send this to a logging service
  if (process.env.NODE_ENV === "production") {
    // TODO: Send to logging service (Sentry, Datadog, etc.)
    console.error("[ERROR]", JSON.stringify(logData));
  } else {
    console.error("[ERROR]", logData);
  }
}

// ══════════════════════════════════════════════════════════════
// ASYNC WRAPPER
// ══════════════════════════════════════════════════════════════

// Wrap async route handlers with error handling
export type RouteHandler = (
  request: Request,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      logError(error as Error, {
        url: request.url,
        method: request.method,
      });
      return apiError(error as Error);
    }
  };
}
