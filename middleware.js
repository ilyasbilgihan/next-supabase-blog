import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  //Runs on server side

  const res = NextResponse.next();

  const supabase = createMiddlewareSupabaseClient({ req, res });
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    // Authentication successful, forward request to protected route.
    return res;
  }

  // Auth condition not met, redirect to login page.
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = '/login';
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/bookmarks', '/write', '/settings', '/feed'],
};
