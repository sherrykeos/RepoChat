import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host || "";
  const hostname = hostHeader.split(":")[0];
  const protocol = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol || "http:";

  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  let backendUrl: string;

  if (envUrl) {
    backendUrl = envUrl.replace(/\/+$/, "");
  } else {
    const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host || "";
    const hostname = hostHeader.split(":")[0];
    const protocol = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol || "http:";

    // If accessing from LAN / mobile phone (e.g. 192.168.x.x) during local dev, route to that host on port 8080
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      backendUrl = `${protocol.endsWith(":") ? protocol : protocol + ":"}//${hostname}:8080`;
    } else {
      backendUrl = "http://localhost:8080";
    }
  }

  return NextResponse.redirect(`${backendUrl}/oauth2/authorization/github`);
}
