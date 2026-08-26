'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signUpWithEmail } from './actions';

export default function SignUp() {
	const [state, formAction, isPending] = useActionState(signUpWithEmail, null);

	return (
		<main className="min-h-screen bg-[#f5f1e8] px-6 py-10 text-[#1c2b25] sm:px-10">
			<div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-[#e3e9df] shadow-[0_24px_80px_rgba(28,43,37,0.14)]">
				<section className="hidden w-1/2 flex-col justify-between bg-[#1c2b25] p-12 text-[#f5f1e8] lg:flex">
					<div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em]">
						<span className="h-3 w-3 rounded-full bg-[#e7a64a]" />
						Flow Board
					</div>
					<div>
						<p className="mb-5 text-sm uppercase tracking-[0.2em] text-[#b9c8bb]">Make space for momentum</p>
						<h1 className="max-w-md text-5xl font-semibold leading-[1.05] tracking-tight">
							Start with a clear next step.
						</h1>
						<p className="mt-6 max-w-sm text-lg leading-8 text-[#b9c8bb]">
							Bring your projects into focus and make progress feel visible.
						</p>
					</div>
					<p className="text-sm text-[#8fa495]">A calmer way to move ideas forward.</p>
				</section>

				<section className="flex w-full flex-col justify-center px-6 py-12 sm:px-16 lg:w-1/2 lg:px-20">
					<div className="mx-auto w-full max-w-md">
						<div className="mb-10 lg:hidden">
							<div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em]">
								<span className="h-3 w-3 rounded-full bg-[#e7a64a]" />
								Flow Board
							</div>
						</div>

						<p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#b36b25]">Get started</p>
						<h2 className="text-4xl font-semibold tracking-tight text-[#1c2b25]">Create your account</h2>
						<p className="mt-4 text-[#5d6d63]">A better place for your best work.</p>

						<form action={formAction} className="mt-10 space-y-5">
							<div>
								<label htmlFor="name" className="mb-2 block text-sm font-medium text-[#1c2b25]">
									Name
								</label>
								<input
									id="name"
									name="name"
									type="text"
									autoComplete="name"
									required
									className="w-full rounded-xl border border-[#b9c8bb] bg-[#f5f1e8] px-4 py-3.5 text-[#1c2b25] outline-none transition focus:border-[#b36b25] focus:ring-2 focus:ring-[#e7a64a]/40"
								/>
							</div>

							<div>
								<label htmlFor="email" className="mb-2 block text-sm font-medium text-[#1c2b25]">
									Email address
								</label>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									className="w-full rounded-xl border border-[#b9c8bb] bg-[#f5f1e8] px-4 py-3.5 text-[#1c2b25] outline-none transition focus:border-[#b36b25] focus:ring-2 focus:ring-[#e7a64a]/40"
								/>
							</div>

							<div>
								<label htmlFor="password" className="mb-2 block text-sm font-medium text-[#1c2b25]">
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="new-password"
									required
									minLength={8}
									className="w-full rounded-xl border border-[#b9c8bb] bg-[#f5f1e8] px-4 py-3.5 text-[#1c2b25] outline-none transition focus:border-[#b36b25] focus:ring-2 focus:ring-[#e7a64a]/40"
								/>
							</div>

							{state?.error && (
								<p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
									{state.error}
								</p>
							)}

							<button
								type="submit"
								disabled={isPending}
								className="w-full rounded-xl bg-[#1c2b25] px-4 py-3.5 font-semibold text-[#f5f1e8] transition hover:bg-[#2b4035] disabled:cursor-wait disabled:opacity-60"
							>
								{isPending ? 'Creating account...' : 'Create account'}
							</button>
						</form>

						<p className="mt-8 text-center text-sm text-[#5d6d63]">
							Already have an account?{' '}
							<Link href="/sign-in" className="font-semibold text-[#b36b25] hover:text-[#1c2b25]">
								Sign in
							</Link>
						</p>
					</div>
				</section>
			</div>
		</main>
	);
}
