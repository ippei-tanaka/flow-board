'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export type SignUpState = {
	error: string;
} | null;

export async function signUpWithEmail(
	_previousState: SignUpState,
	formData: FormData,
): Promise<SignUpState> {
	const name = String(formData.get('name') ?? '').trim();
	const email = String(formData.get('email') ?? '').trim();
	const password = String(formData.get('password') ?? '');

	if (!name || !email || !password) {
		return { error: 'Enter your name, email, and password.' };
	}

	if (password.length < 8) {
		return { error: 'Your password must be at least 8 characters.' };
	}

	const { error } = await auth.signUp.email({ name, email, password });

	if (error) {
		return { error: error.message || 'Unable to create your account. Please try again.' };
	}

	redirect('/');
}
