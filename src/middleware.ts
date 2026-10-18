import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/api/companies')
  const isAuthRoute = pathname === '/login' || pathname === '/signup'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase environment variables are missing on the hosting platform,
  // do not crash the public site. Only block protected routes.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtectedRoute) {
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // VERY IMPORTANT: You must call getUser() (not getSession) for authorization!
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (isProtectedRoute && !user) {
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    if (isAuthRoute && user) {
      url.pathname = '/dashboard/convert'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('[Middleware] Supabase auth check error:', error)
    if (isProtectedRoute) {
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, robots.txt, static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)',
  ],
}
