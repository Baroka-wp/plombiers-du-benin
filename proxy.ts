import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Proxy for authentication and route protection with NextAuth
 */

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check for NextAuth session token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Protect artisan dashboard routes
    if (pathname.startsWith("/artisan/dashboard")) {
        if (!token) {
            const loginUrl = new URL("/artisan/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect authenticated artisans from login page
    if (pathname === "/artisan/login" && token) {
        return NextResponse.redirect(new URL("/artisan/dashboard", request.url));
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
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.cloudinary.com https:",
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
