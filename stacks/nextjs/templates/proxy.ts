import { NextResponse, type NextRequest } from "next/server";

const securityHeaders = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
};

export const proxy = (request: NextRequest) => {
  const requestId =
    request.headers.get("cf-ray") ?? request.headers.get("x-vercel-id") ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-request-id", requestId);
  for (const [name, value] of Object.entries(securityHeaders)) {
    response.headers.set(name, value);
  }
  return response;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
