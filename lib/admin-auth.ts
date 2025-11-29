import { getServerSession } from 'next-auth';
import { adminAuthOptions } from '@/lib/auth-admin';
import { NextResponse } from 'next/server';

/**
 * Check if user is authenticated as admin
 * Returns the admin session or null
 */
export async function checkAdminAuth() {
    const session = await getServerSession(adminAuthOptions);
    
    if (!session?.user?.id || !(session.user as any).isAdmin) {
        return null;
    }
    
    return session;
}

/**
 * Middleware helper to require admin authentication
 * Returns NextResponse with error if not authenticated, or null if authenticated
 */
export async function requireAdminAuth() {
    const session = await checkAdminAuth();
    
    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'Admin authentication required' },
            { status: 401 }
        );
    }
    
    return null;
}

