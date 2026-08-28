export type BoardCard = {
	id: string;
	title: string;
	description: string | null;
	listId: string;
	position: number;
};

export type BoardList = {
	id: string;
	name: string;
	boardId: string;
	position: number;
	color: string;
	cards: BoardCard[];
};

export function moveCardLocally(
	lists: BoardList[],
	sourceListId: string,
	cardId: string,
	targetListId: string,
	targetIndex: number,
): BoardList[] {
	const nextLists = lists.map((list) => ({
		...list,
		cards: list.cards.map((card) => ({ ...card })),
	}));

	const sourceList = nextLists.find((list) => list.id === sourceListId);
	const targetList = nextLists.find((list) => list.id === targetListId);
	if (!sourceList || !targetList) return lists;

	const sourceIndex = sourceList.cards.findIndex((card) => card.id === cardId);
	if (sourceIndex === -1) return lists;

	const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
	if (!movedCard) return lists;

	const normalizedTargetIndex = sourceListId === targetListId && sourceIndex < targetIndex
		? targetIndex - 1
		: targetIndex;
	movedCard.listId = targetListId;
	targetList.cards.splice(Math.max(0, Math.min(normalizedTargetIndex, targetList.cards.length)), 0, movedCard);

	for (const list of sourceListId === targetListId ? [sourceList] : [sourceList, targetList]) {
		list.cards = list.cards.map((card, index) => ({ ...card, position: index }));
	}

	return nextLists;
}
