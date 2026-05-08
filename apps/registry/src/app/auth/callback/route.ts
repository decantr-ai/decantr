import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function resolveSafeCallbackPath(searchParams: URLSearchParams): string {
  let safePath = '/dashboard';
  const requestedPath = searchParams.get('next');

  if (requestedPath === '/dashboard/settings') {
    safePath = '/dashboard/settings';
  }

  return safePath;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const safePath = resolveSafeCallbackPath(searchParams);
  const callbackExchangeError = 'auth_callback_exchange_failed';

  if (code) {
    const supabase = await createClient();
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      const authSuccess = !error;
      if (authSuccess) {
        return NextResponse.redirect(new URL(safePath, origin));
      }
    } catch {
      const route = `/login?error=${callbackExchangeError}`;
      return NextResponse.redirect(new URL(route, origin));
    }
  }

  const route = '/login?error=auth_failed';
  return NextResponse.redirect(new URL(route, origin));
}
