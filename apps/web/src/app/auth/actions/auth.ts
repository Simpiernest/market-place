'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const role = formData.get('role') as string

  // 1. Create in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name,
        role: role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (authError) {
    redirect('/register?error=' + encodeURIComponent(authError.message))
  }

  // 2. Create in our PostgreSQL DB via FastAPI
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: authData.user?.id,
        email,
        password,
        full_name,
        role,
      }),
    })
  } catch (e) {
    console.error("Failed to sync user to PostgreSQL:", e)
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=' + encodeURIComponent('Check your email to continue the registration process.'))
}

export async function resendVerificationEmail(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  if (!email) {
    redirect('/verify-email?error=' + encodeURIComponent('Email address is required'))
  }
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })
  if (error) {
    redirect('/verify-email?error=' + encodeURIComponent(error.message))
  }
  revalidatePath('/', 'layout')
  redirect('/verify-email?message=' + encodeURIComponent('Verification email resent. Check your inbox.'))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
