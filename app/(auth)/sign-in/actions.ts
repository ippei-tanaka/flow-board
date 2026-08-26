'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export type SignInState = {
  error: string;
} | null;

export async function signInWithEmail(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }

  const { error } = await auth.signIn.email({ email, password });

  if (error) {
    return { error: error.message || 'Unable to sign in. Please try again.' };
  }

  redirect('/');
}
