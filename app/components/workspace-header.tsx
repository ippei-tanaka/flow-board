import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';

type WorkspaceHeaderProps = {
    activePage: '/' | '/boards';
};

async function logout() {
    'use server';
    await auth.signOut();
    redirect('/sign-in');
};

export default async function WorkspaceHeader({ activePage }: WorkspaceHeaderProps) {
    
    const { data: session } = await auth.getSession();

    if (!session?.user) {
        redirect('/sign-in');
    }

    const initials = session.user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="topbar">
            <Link className="brand-mark" href="/">
                <span className="brand-dot" />
                <span>Flow Board</span>
            </Link>
            <nav className="workspace-nav" aria-label="Workspace navigation">
                <Link href={'/boards'} className={`nav-item ${activePage === '/boards' ? "nav-item-active" : ""}`} type="button">Boards</Link>
                {/* <button className="nav-item" type="button">Calendar</button> */}
                {/* <button className="nav-item" type="button">Insights</button> */}
            </nav>
            <div className="topbar-actions">
                <button className="icon-button" type="button" aria-label="Search boards" title="Search boards">⌕</button>
                <span className="avatar" aria-label="Your profile">{initials}</span>
                <form action={logout}>
                    <button className="logout-button" type="submit">
                        <span aria-hidden="true">↪</span>
                        Log out
                    </button>
                </form>
            </div>
        </header>
    );
}