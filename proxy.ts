import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy for authentication and route protection
 * 
 * This is a basic implementation that can be extended with:
 * - JWT token validation
 * - Session management
 * - Role-based access control
 */

// Routes that require authentication
const protectedRoutes = [
    "/admin",
    "/dashboard",
    // Add more protected routes as needed
];

// Routes that should redirect authenticated users
const authRoutes = [
    "/login",
    "/register",
];

/**
 * Check if user is authenticated
 * This is a placeholder - implement your actual auth logic
 */
function isAuthenticated(request: NextRequest): boolean {
    // TODO: Implement actual authentication check
    // Example: Check for JWT token in cookies or headers
    const token = request.cookies.get("auth-token");
    return !!token?.value;
}

/**
 * Get user role from request
 * This is a placeholder - implement your actual role check
 */
function getUserRole(request: NextRequest): string | null {
    // TODO: Implement actual role retrieval
    // Example: Decode JWT and extract role
    const role = request.cookies.get("user-role");
    return role?.value || null;
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isAuth = isAuthenticated(request);

    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Check if route is auth route (login, register)
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !isAuth) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users from auth routes
    if (isAuthRoute && isAuth) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Add security headers to all responses
    const response = NextResponse.next();

    // Security headers
    response.headers.set("X-DNS-Prefetch-Control", "on");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Content Security Policy (adjust as needed)
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Adjust for Next.js
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.cloudinary.com",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);

    return response;
}

// Configure which routes the proxy should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
