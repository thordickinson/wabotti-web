import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to protect dashboard routes and handle onboarding flow
 * 
 *
 * Routes:
 * - /dashboard/* → Requires auth + company
 * - /onboarding → Requires auth, no company
 * - /login, /signup, /api/auth/* → Public
 */
export function proxy(request: NextRequest) {
    const url = request.nextUrl;
    const pathname = url.pathname;
    const fullHost = request.headers.get("host") || "";

    // Strip port for comparison/logic
    const hostname = fullHost.split(':')[0];

    // Module 3: Subdomain Handling (Sites)
    const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1");
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "wabotti.com").split(':')[0];

    // Robust Main Domain Check (Port agnostic)
    const isMainDomain = isLocal
        ? (hostname === "localhost" || hostname === "127.0.0.1")
        : (hostname === rootDomain || hostname === `www.${rootDomain}`);

    // DIAGNOSTIC LOG
    console.log(`[Proxy] Host: ${hostname}, Path: ${pathname}, isMain: ${isMainDomain}`);

    // 1. Handle Subdomain Rewrites
    // If NOT on main domain AND NOT already on an internal path (/sites, /api, /_next)
    // We use the hostname (without port) as the site identifier
    if (!isMainDomain && !pathname.startsWith('/api') && !pathname.startsWith('/sites') && !pathname.startsWith('/_next')) {
        const siteRewritePath = `/sites/${hostname}${pathname}`;
        console.log(`[Proxy] REWRITE: ${fullHost}${pathname} -> ${siteRewritePath}`);

        // Clone the URL and update pathname to preserve query params
        const url = request.nextUrl.clone();
        url.pathname = siteRewritePath;
        return NextResponse.rewrite(url);
    }

    // 2. Define Public Access Rules
    const publicPaths = ["/login", "/signup", "/api/auth", "/api/trpc", "/api/analytics", "/api/public", "/api/cron"];

    const isExplicitlyPublic = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
    );

    const isSitePath = pathname.startsWith("/sites");
    const isRootOfMainDomain = isMainDomain && pathname === "/";

    if (isExplicitlyPublic || isSitePath || isRootOfMainDomain) {
        // console.log(`[Middleware] ALLOW PUBLIC: ${pathname}`);
        return NextResponse.next();
    }

    // 3. Auth Check
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
        console.log(`[Proxy] REDIRECT TO LOGIN: ${pathname}`);
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
