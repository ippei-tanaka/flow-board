'use client';

import { createStore } from 'zustand/vanilla';
import type { DragState, CardList } from './index';

export type BoardStore = {
	lists: CardList[];
	dragState: DragState;
	dragOverListId: string | null;
	setDragState: (dragState: DragState) => void;
	setDragOverListId: (listId: string | null) => void;
	moveCardLocally: (sourceListId: string, cardId: string, targetListId: string, targetIndex: number) => void;
};

export function createBoardStore(initialLists: CardList[]) {
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