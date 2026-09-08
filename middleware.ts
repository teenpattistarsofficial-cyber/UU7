import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = host.slice(4);
    return NextResponse.redirect(url, { status: 301 });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|uploads).*)"],
};
