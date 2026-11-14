import { NextRequest, NextResponse } from "next/server";

/**
 * Simple private-site lock. Set SITE_PASSWORD (and optionally SITE_USER) in
 * Vercel → Project → Settings → Environment Variables. If SITE_PASSWORD is
 * not set (e.g. local dev) the site is open.
 * Written defensively: it must never throw (a throw = 500 for every page).
 */
function challenge() {
  return new NextResponse("Private — Casa Muffoletto", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Casa Muffoletto"' },
  });
}

export function middleware(req: NextRequest) {
  try {
    const password = (process.env.SITE_PASSWORD ?? "").trim();
    if (!password) return NextResponse.next();
    const user = (process.env.SITE_USER ?? "casa").trim();

    const header = req.headers.get("authorization") ?? "";
    if (!header.toLowerCase().startsWith("basic ")) return challenge();

    // Decode as UTF-8 so passwords with accents/symbols work.
    const bytes = Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const i = decoded.indexOf(":");
    const u = i >= 0 ? decoded.slice(0, i) : decoded;
    const p = i >= 0 ? decoded.slice(i + 1) : "";
    if (u.toLowerCase() === user.toLowerCase() && p === password) return NextResponse.next();
    return challenge();
  } catch {
    return challenge();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
