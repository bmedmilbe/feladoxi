import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function corsHeaders(): Record<string, string> {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
  };
}

async function proxyRequest(request: NextRequest) {
  const targetBase = (process.env.API_PROXY_TARGET || "https://easyadapp-production.up.railway.app/api").replace(/\/$/, "");
  const path = request.nextUrl.searchParams.get("path") || "/";
  const cleanPath = path.replace(/^\/+/, "");
  const targetUrl = new URL(`${targetBase}/${cleanPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "path") {
      targetUrl.searchParams.set(key, value);
    }
  });

  const headers = new Headers();
  const hopByHopHeaders = new Set([
    "accept-encoding",
    "connection",
    "content-length",
    "expect",
    "host",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
  ]);
  request.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key)) {
      headers.set(key, value);
    }
  });

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  });

  const responseBody = await upstreamResponse.arrayBuffer();

  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: {
      "content-type": upstreamResponse.headers.get("content-type") || "application/json",
      ...corsHeaders(),
    },
  });
}
