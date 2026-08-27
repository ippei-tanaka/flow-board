'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';

type UiStore = {
	openMenuId: string | null;
	toggleMenu: (menuId: string) => void;
	closeMenu: () => void;
};

function createUiStore() {
	return createStore<UiStore>((set) => ({
		openMenuId: null,
		toggleMenu: (menuId) => set((state) => ({ openMenuId: state.openMenuId === menuId ? null : menuId })),
		closeMenu: () => set({ openMenuId: null }),
	}));
}

const UiStoreContext = createContext<StoreApi<UiStore> | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
	const [store] = useState(() => createUiStore());
	return <UiStoreContext.Provider value={store}>{children}</UiStoreContext.Provider>;
}

export function useUiStore<T>(selector: (state: UiStore) => T) {
	const store = useContext(UiStoreContext);
	if (!store) throw new Error('useUiStore must be used within a UiProvider');
	return useStore(store, selector);
}