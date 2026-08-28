'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type BoardMenuContextValue = {
	openMenuId: string | null;
	toggleMenu: (menuId: string) => void;
	closeMenu: () => void;
};

const BoardMenuContext = createContext<BoardMenuContextValue | null>(null);

export function BoardMenuProvider({ children }: { children: ReactNode }) {
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);
	const toggleMenu = useCallback((menuId: string) => {
		setOpenMenuId((currentId) => currentId === menuId ? null : menuId);
	}, []);
	const closeMenu = useCallback(() => setOpenMenuId(null), []);

	const value = {
		openMenuId,
		toggleMenu,
		closeMenu,
	};

	return <BoardMenuContext.Provider value={value}>{children}</BoardMenuContext.Provider>;
}

export function useBoardMenu() {
	const context = useContext(BoardMenuContext);
	if (!context) throw new Error('useBoardMenu must be used within a BoardMenuProvider');
	return context;
}