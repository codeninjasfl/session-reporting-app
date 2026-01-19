import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Proxy endpoint to serve PNG images from Supabase storage
 * This allows MakeCode to fetch images without CORS issues
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
        // Append cache-busting param to upstream URL
        const fetchUrl = url.includes('?') ? `${url}&cb=${Date.now()}` : `${url}?cb=${Date.now()}`;

        // Fetch the image from Supabase
        const response = await fetch(fetchUrl, {
            headers: {
                'Accept': 'image/png,image/*',
            },
            cache: 'no-store', // Ensure we always fetch fresh data from Supabase
        });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status });
        }

        const contentType = response.headers.get('content-type') || 'image/png';
        const imageBuffer = await response.arrayBuffer();

        // Return the image with proper headers
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse('Failed to proxy image', { status: 500 });
    }
}
