'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function WorkspaceNavigation({}) {
	const pathname = usePathname();
	const activePage = pathname === '/' ? '/' : pathname.startsWith('/boards') ? '/boards' : null;

	return (
		<nav className="workspace-nav" aria-label="Workspace navigation">
			<Link href="/boards" className={`nav-item ${activePage === '/boards' ? 'nav-item-active' : ''}`} type="button">Boards</Link>
		</nav>
	);
}