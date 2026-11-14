import { NextRequest, NextResponse } from "next/server";

/**
 * Simple private-site lock. Set SITE_PASSWORD (and optionally SITE_USER) in
 * Vercel → Project → Settings → Environment Variables. If SITE_PASSWORD is
 * not set (e.g. local dev) the site is open.
 */
export function middleware(req: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();
  const user = process.env.SITE_USER ?? "casa";

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const [u, p] = atob(header.slice(6)).split(":");
    if (u === user && p === password) return NextResponse.next();
  }
  return new NextResponse("Private — Casa Muffoletto", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Casa Muffoletto", charset="UTF-8"' },
  });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
