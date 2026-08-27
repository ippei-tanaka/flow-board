'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createStore, type StoreApi } from 'zustand/vanilla';
import { useStore } from 'zustand';

export type Card = {
	id: string;
	title: string;
	description: string | null;
	listId: string;
	position: number;
};

export type ListWithCards = {
	id: string;
	name: string;
	boardId: string;
	position: number;
	color: string;
	cards: Card[];
};

export type DragState = { 
	cardId: string; 
	sourceListId: string 
} | null;

type BoardStore = {
	lists: ListWithCards[];
	dragState: DragState;
	dragOverListId: string | null;
	setDragState: (dragState: DragState) => void;
	setDragOverListId: (listId: string | null) => void;
	moveCardLocally: (sourceListId: string, cardId: string, targetListId: string, targetIndex: number) => void;
};

export function createBoardStore(initialLists: ListWithCards[]) {
	return createStore<BoardStore>((set) => ({
		lists: initialLists,
		dragState: null,
		dragOverListId: null,
		setDragState: (dragState) => set({ dragState }),
		setDragOverListId: (dragOverListId) => set({ dragOverListId }),
		moveCardLocally: (sourceListId, cardId, targetListId, targetIndex) => set((state) => {
			const nextLists = state.lists.map((list) => ({
				...list,
				cards: list.cards.map((card) => ({ ...card })),
			}));

			const sourceList = nextLists.find((list) => list.id === sourceListId);
			const targetList = nextLists.find((list) => list.id === targetListId);
			if (!sourceList || !targetList) return state;

			const sourceIndex = sourceList.cards.findIndex((card) => card.id === cardId);
			if (sourceIndex === -1) return state;

			const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
			if (!movedCard) return state;

			const normalizedTargetIndex = sourceListId === targetListId && sourceIndex < targetIndex
				? targetIndex - 1
				: targetIndex;
			movedCard.listId = targetListId;
			targetList.cards.splice(Math.max(0, Math.min(normalizedTargetIndex, targetList.cards.length)), 0, movedCard);

			for (const list of sourceListId === targetListId ? [sourceList] : [sourceList, targetList]) {
				list.cards = list.cards.map((card, index) => ({ ...card, position: index }));
			}

			return { lists: nextLists };
		}),
	}));
}

const BoardStoreContext = createContext<StoreApi<BoardStore> | null>(null);

export function BoardProvider({ initialLists, children }: { initialLists: ListWithCards[]; children: ReactNode }) {
	const [store] = useState(() => createBoardStore(initialLists));

	return <BoardStoreContext.Provider value={store}>{children}</BoardStoreContext.Provider>;
}

export function useBoardStore<T>(selector: (state: BoardStore) => T) {
	const store = useContext(BoardStoreContext);
	if (!store) throw new Error('useBoardStore must be used within a BoardProvider');
	return useStore(store, selector);
}