import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
	const { data: session } = await auth.getSession();
	if (session?.user) {
		redirect('/');
	}

	return children;
}
