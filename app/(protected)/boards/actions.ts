'use server';

import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { boardMembers, boards } from '@/src/db/schema';
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

	redirect('/boards');
}