'use server';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { boardMembers, boards, cardLists } from '@/src/db/schema';
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