'use server';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { boardMembers, boards, cardLists, cards } from '@/src/db/schema';
import { and, eq, max, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type CreateBoardState = { error: string } | null;

export async function createBoard(
	_previousState: CreateBoardState,
	formData: FormData,
): Promise<CreateBoardState> {
	const { data: session } = await auth.getSession();
	if (!session?.user) {
		redirect('/sign-in');
	}

	const name = String(formData.get('name') ?? '').trim();
	if (!name) {
		return { error: 'Give your board a name.' };
	}

	const [board] = await db.insert(boards).values({
		name,
		ownerId: session.user.id,
	}).returning({ id: boards.id });

	await db.insert(boardMembers).values({
		boardId: board.id,
		userId: session.user.id,
		role: 'admin',
	});
	await db.insert(cardLists).values([
		{ boardId: board.id, name: 'Ideas', position: 0 },
		{ boardId: board.id, name: 'In progress', position: 1 },
		{ boardId: board.id, name: 'Review', position: 2 },
		{ boardId: board.id, name: 'Done', position: 3 },
	]);

	redirect('/boards');
}

export async function createCardList(formData: FormData) {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect('/sign-in');

	const boardId = String(formData.get('boardId') ?? '');
	const name = String(formData.get('name') ?? '').trim();
	if (!boardId || !name) return;

	const [membership] = await db.select({ boardId: boardMembers.boardId })
		.from(boardMembers)
		.where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id)))
		.limit(1);
	if (!membership) return;

	const [lastList] = await db.select({ position: max(cardLists.position) })
		.from(cardLists).where(eq(cardLists.boardId, boardId));
	await db.insert(cardLists).values({ boardId, name, position: (lastList.position ?? -1) + 1 });
	revalidatePath(`/boards/${boardId}`);
}

export async function deleteCardList(formData: FormData) {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect('/sign-in');

	const listId = String(formData.get('listId') ?? '');
	if (!listId) return;

	const [list] = await db.select({ boardId: cardLists.boardId })
		.from(cardLists)
		.innerJoin(boardMembers, eq(boardMembers.boardId, cardLists.boardId))
		.where(and(eq(cardLists.id, listId), eq(boardMembers.userId, session.user.id)))
		.limit(1);
	if (!list) return;

	await db.delete(cardLists).where(eq(cardLists.id, listId));
	revalidatePath(`/boards/${list.boardId}`);
}

export async function createCard(formData: FormData) {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect('/sign-in');

	const listId = String(formData.get('listId') ?? '');
	const title = String(formData.get('title') ?? '').trim();
	const description = String(formData.get('description') ?? '').trim();
	if (!listId || !title) return;

	const [list] = await db.select({ boardId: cardLists.boardId })
		.from(cardLists)
		.innerJoin(boardMembers, eq(boardMembers.boardId, cardLists.boardId))
		.where(and(eq(cardLists.id, listId), eq(boardMembers.userId, session.user.id)))
		.limit(1);
	if (!list) return;

	const [lastCard] = await db.select({ position: max(cards.position) })
		.from(cards).where(eq(cards.listId, listId));
	await db.insert(cards).values({ listId, title, description: description || null, position: (lastCard.position ?? -1) + 1 });
	revalidatePath(`/boards/${list.boardId}`);
}

export async function deleteCard(formData: FormData) {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect('/sign-in');

	const cardId = String(formData.get('cardId') ?? '');
	if (!cardId) return;

	const [card] = await db.select({ boardId: cardLists.boardId })
		.from(cards)
		.innerJoin(cardLists, eq(cards.listId, cardLists.id))
		.innerJoin(boardMembers, eq(boardMembers.boardId, cardLists.boardId))
		.where(and(eq(cards.id, cardId), eq(boardMembers.userId, session.user.id)))
		.limit(1);
	if (!card) return;

	await db.delete(cards).where(eq(cards.id, cardId));
	revalidatePath(`/boards/${card.boardId}`);
}

export async function moveCard(formData: FormData) {
	const { data: session } = await auth.getSession();
	if (!session?.user) redirect('/sign-in');

	const boardId = String(formData.get('boardId') ?? '');
	const cardId = String(formData.get('cardId') ?? '');
	const sourceListId = String(formData.get('sourceListId') ?? '');
	const targetListId = String(formData.get('targetListId') ?? '');
	const targetIndex = Number(formData.get('targetIndex') ?? 0);

	if (!boardId || !cardId || !sourceListId || !targetListId) return;

	const [membership] = await db.select({ boardId: boardMembers.boardId })
		.from(boardMembers)
		.where(and(eq(boardMembers.boardId, boardId), eq(boardMembers.userId, session.user.id)))
		.limit(1);
	if (!membership) return;

	const [cardRecord] = await db.select({
		id: cards.id,
		listId: cards.listId,
		position: cards.position,
	})
		.from(cards)
		.innerJoin(cardLists, eq(cards.listId, cardLists.id))
		.where(and(eq(cards.id, cardId), eq(cardLists.boardId, boardId)))
		.limit(1);
	if (!cardRecord) return;

	const sourceCards = await db.select()
		.from(cards)
		.where(eq(cards.listId, sourceListId))
		.orderBy(asc(cards.position));

	const sourceWithoutDragged = sourceCards.filter((card) => card.id !== cardId);

	let nextSource = sourceWithoutDragged;
	let nextTarget: typeof cards.$inferSelect[] = [];

	if (sourceListId === targetListId) {
		nextSource = [...sourceWithoutDragged];
		nextSource.splice(Math.max(0, Math.min(targetIndex, nextSource.length)), 0, { ...cardRecord, listId: sourceListId } as typeof cards.$inferSelect);
	} else {
		nextTarget = await db.select()
			.from(cards)
			.where(eq(cards.listId, targetListId))
			.orderBy(asc(cards.position));
		nextTarget = nextTarget.filter((card) => card.id !== cardId);
		nextTarget.splice(Math.max(0, Math.min(targetIndex, nextTarget.length)), 0, { ...cardRecord, listId: targetListId } as typeof cards.$inferSelect);
	}

	for (let index = 0; index < nextSource.length; index += 1) {
		const card = nextSource[index];
		await db.update(cards)
			.set({ position: index, listId: sourceListId })
			.where(eq(cards.id, card.id));
	}

	if (sourceListId !== targetListId) {
		for (let index = 0; index < nextTarget.length; index += 1) {
			const card = nextTarget[index];
			await db.update(cards)
				.set({ position: index, listId: targetListId })
				.where(eq(cards.id, card.id));
		}
	}

	revalidatePath(`/boards/${boardId}`);
}