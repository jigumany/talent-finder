import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://gslstaging.mytalentcrm.com/api/v1/talent-finder';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = (await cookies()).get('session_token')?.value;

    const headers: HeadersInit = {
      Accept: 'application/json',
    };
    if (token) {
      const normalizedToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      headers.Authorization = `Bearer ${normalizedToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/candidates/${id}/availabilities`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const text = await response.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = { success: false, data: [], raw: text };
    }

    return NextResponse.json(json, { status: response.status });
  } catch (error) {
    console.error('Availability proxy error:', error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}

