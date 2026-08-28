import { describe, expect, it } from 'vitest';
import { moveCardLocally, type BoardList } from './move-card';

const makeLists = (): BoardList[] => [
	{
		id: 'todo', name: 'To do', boardId: 'board', position: 0, color: 'coral',
		cards: [
			{ id: 'one', title: 'One', description: null, listId: 'todo', position: 0 },
			{ id: 'two', title: 'Two', description: null, listId: 'todo', position: 1 },
		],
	},
	{
		id: 'done', name: 'Done', boardId: 'board', position: 1, color: 'green',
		cards: [{ id: 'three', title: 'Three', description: null, listId: 'done', position: 0 }],
	},
];

const cardIds = (lists: BoardList[], listId: string) =>
	lists.find((list) => list.id === listId)?.cards.map((card) => card.id);

describe('moveCardLocally', () => {
	it('moves a card into another list at the requested index', () => {
		const result = moveCardLocally(makeLists(), 'todo', 'two', 'done', 0);

		expect(cardIds(result, 'todo')).toEqual(['one']);
		expect(cardIds(result, 'done')).toEqual(['two', 'three']);
		expect(result[1].cards[0]).toMatchObject({ id: 'two', listId: 'done', position: 0 });
	});

	it('moves a card within the same list without changing its order unexpectedly', () => {
		const result = moveCardLocally(makeLists(), 'todo', 'one', 'todo', 2);

		expect(cardIds(result, 'todo')).toEqual(['two', 'one']);
		expect(result[0].cards.map((card) => card.position)).toEqual([0, 1]);
	});

	it('clamps an insertion beyond the target list to its end', () => {
		const result = moveCardLocally(makeLists(), 'todo', 'one', 'done', 99);

		expect(cardIds(result, 'done')).toEqual(['three', 'one']);
	});

	it('returns the original lists when the source or card is missing', () => {
		const lists = makeLists();

		expect(moveCardLocally(lists, 'missing', 'one', 'done', 0)).toBe(lists);
		expect(moveCardLocally(lists, 'todo', 'missing', 'done', 0)).toBe(lists);
	});

	it('does not mutate the input lists', () => {
		const lists = makeLists();
		const original = structuredClone(lists);

		moveCardLocally(lists, 'todo', 'two', 'done', 0);

		expect(lists).toEqual(original);
	});
});
