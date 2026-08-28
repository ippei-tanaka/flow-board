'use server';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { boardMembers, boards, cardLists, cards } from '@/src/db/schema';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

export type CreateBoardState = { error: string } | null;

const DEFAULT_LISTS = [
	{ name: 'Ideas', position: 0 },
	{ name: 'In progress', position: 1 },
	{ name: 'Review', position: 2 },
	{ name: 'Done', position: 3 },
];

const DEFAULT_CARDS = [
	{ list: 'Ideas', title: 'Brainstorm new features', description: 'Think about what would improve the product' },
	{ list: 'Ideas', title: 'Gather user feedback', description: 'Collect insights from our users' },
	{ list: 'In progress', title: 'Set up the project', description: 'Initialize the repository and tools' },
	{ list: 'Review', title: 'Code review guidelines', description: 'Establish review standards for the team' },
	{ list: 'Done', title: 'Project kickoff', description: 'Team alignment and planning session' },
];

async function createBoardWithDefaultLists(name: string, ownerId: string, withCards: boolean = false) {
	const [board] = await db.insert(boards).values({
		name,
		ownerId,
	}).returning({ id: boards.id });

	await db.insert(boardMembers).values({
		boardId: board.id,
		userId: ownerId,
		role: 'admin',
	});

	const insertedLists = await db.insert(cardLists).values(
		DEFAULT_LISTS.map(list => ({ boardId: board.id, ...list }))
	).returning({ id: cardLists.id, name: cardLists.name });

	if (withCards) {
		const listMap = new Map(insertedLists.map(list => [list.name, list.id]));

		await db.insert(cards).values(
			DEFAULT_CARDS.map((card, index) => ({
				listId: listMap.get(card.list)!,
				title: card.title,
				description: card.description,
				position: DEFAULT_CARDS.filter(c => c.list === card.list).indexOf(card),
			}))
		);
	}

	return board;
}

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

	await createBoardWithDefaultLists(name, session.user.id, true);

	redirect('/boards');
}

export async function createFirstTimeBoard(userId: string) {
	// Check if user already has boards
	const existingBoards = await db.select().from(boards)
		.where(eq(boards.ownerId, userId));

	console.log(existingBoards);

	if (existingBoards.length > 0) {
		return; // User already has boards
	}

	await createBoardWithDefaultLists('Welcome to Flow Board', userId, true);
}