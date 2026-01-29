import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //Public routes
  if (pathname === 'login' || pathname.startsWith('/auth/')) {
      return NextResponse.next();
  }

  //Protected routes
  const protectedPaths = ["/overview", "/compare"];

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!isProtected) return NextResponse.next();


  //unsecure placeholder just for function. Would store and use JWT tokens and verify in production
  const session = req.cookies.get("vc_view_session")?.value;
  if (session) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/overview/:path*", "/compare/:path*", "/login", "/auth/:path*"]
}