import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Forward the subdomain to server components via the x-current-path request
  // header. It must be set on `request.headers` (not the response init), so
  // that `headers()` inside server components can read it downstream.
  const requestHeaders = new Headers(request.headers);
  const subdomain = requestHeaders.get("host")?.toString() || "";

  requestHeaders.set("x-current-path", subdomain.split(".")[0]);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
