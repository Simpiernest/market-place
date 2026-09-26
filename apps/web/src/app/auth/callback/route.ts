import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Fetch user to check role
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role
      const targetPath = role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer'

      const forwardedHost = request.headers.get('x-forwarded-host') // useful for production
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that origin is localhost:3000
        return NextResponse.redirect(`${origin}${targetPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${targetPath}`)
      } else {
        return NextResponse.redirect(`${origin}${targetPath}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
}
