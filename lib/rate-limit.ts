/**
 * Simple in-memory rate limiting for API routes
 * For production, consider using Redis or a dedicated service
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
};

/**
 * Get client identifier from request
 */
function getClientId(request: Request): string {
  // Try to get IP from various headers (for production behind proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return ip;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: Request,
  options: Partial<RateLimitOptions> = {}
): { allowed: boolean; remaining: number; resetTime: number } {
  const opts = { ...defaultOptions, ...options };
  const clientId = getClientId(request);
  const now = Date.now();
  
  // Clean up old entries periodically (simple cleanup)
  if (Math.random() < 0.01) {
    // 1% chance to clean up on each request
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }
  
  const entry = store[clientId];
  
  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    store[clientId] = {
      count: 1,
      resetTime: now + opts.windowMs,
    };
    
    return {
      allowed: true,
      remaining: opts.maxRequests - 1,
      resetTime: now + opts.windowMs,
    };
  }
  
  // Increment count
  entry.count += 1;
  
  // Check if limit exceeded
  if (entry.count > opts.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  return {
    allowed: true,
    remaining: opts.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware for Next.js API routes
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  options?: Partial<RateLimitOptions>
) {
  return async (request: Request): Promise<Response> => {
    const result = checkRateLimit(request, options);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(options?.maxRequests || defaultOptions.maxRequests),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.resetTime),
            'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }
    
    // Add rate limit headers to response
    const response = await handler(request);
    response.headers.set('X-RateLimit-Limit', String(options?.maxRequests || defaultOptions.maxRequests));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(result.resetTime));
    
    return response;
  };
}

