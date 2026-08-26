import { and, desc, eq, gt, not } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { boardInvitations, boardMembers, boards } from '@/src/db/schema';
import WorkspaceHeader from '../components/workspace-header';
import CreateBoardForm from './create-board-form';

export const dynamic = 'force-dynamic';

export default async function BoardsPage() {
	const { data: session } = await auth.getSession();
	if (!session?.user) {
		redirect('/sign-in');
	}

	const now = new Date();
	const [ownedBoards, joinedBoards, invitedBoards] = await Promise.all([
		db.select().from(boards).where(eq(boards.ownerId, session.user.id)).orderBy(desc(boards.updatedAt)),
		db.select({ id: boards.id, name: boards.name, updatedAt: boards.updatedAt })
			.from(boardMembers)
			.innerJoin(boards, eq(boardMembers.boardId, boards.id))
			.where(and(eq(boardMembers.userId, session.user.id), not(eq(boards.ownerId, session.user.id))))
			.orderBy(desc(boards.updatedAt)),
		db.select({ id: boards.id, name: boards.name, invitedAt: boardInvitations.createdAt })
			.from(boardInvitations)
			.innerJoin(boards, eq(boardInvitations.boardId, boards.id))
			.where(and(
				eq(boardInvitations.email, session.user.email),
				eq(boardInvitations.status, 'pending'),
				gt(boardInvitations.expiresAt, now),
			))
			.orderBy(desc(boardInvitations.createdAt)),
	]);

	return (
		<main className="boards-shell">
			<WorkspaceHeader activePage="/boards" />

			<section className="boards-intro">
				<div><p className="eyebrow">Your workspace</p><h1>Boards</h1><p className="boards-description">Keep every project close, whether you are leading it, helping out, or waiting to join.</p></div>
				<CreateBoardForm />
			</section>

			<section className="boards-content" aria-label="Your boards">
				<BoardGroup title="Created by you" count={ownedBoards.length} boards={ownedBoards} empty="Boards you create will live here." />
				<BoardGroup title="Joined boards" count={joinedBoards.length} boards={joinedBoards} empty="Boards you join will show up here." />
				<BoardGroup title="Invitations" count={invitedBoards.length} boards={invitedBoards} empty="New invitations will appear here." invited />
			</section>
		</main>
	);
}

type BoardCard = { id: string; name: string; updatedAt?: Date | null; invitedAt?: Date | null };

function BoardGroup({ title, count, boards: boardList, empty, invited = false }: { title: string; count: number; boards: BoardCard[]; empty: string; invited?: boolean }) {
	return <section className="board-group"><div className="group-heading"><div><p className="eyebrow">{invited ? 'Waiting for you' : 'Workspace'}</p><h2>{title}<span>{count}</span></h2></div>{count > 0 && <span className="group-rule" />}</div>{boardList.length > 0 ? <div className="board-grid">{boardList.map((board) => <BoardCard key={board.id} board={board} invited={invited} />)}</div> : <div className="empty-group"><span className="empty-mark" aria-hidden="true">＋</span><p>{empty}</p></div>}</section>;
}

function BoardCard({ board, invited }: { board: BoardCard; invited: boolean }) {
	const content = <><div className="board-card-icon" aria-hidden="true">▦</div><div className="board-card-copy"><h3>{board.name}</h3><p>{invited ? 'Invitation pending' : board.updatedAt ? `Updated ${formatDate(board.updatedAt)}` : 'Ready to get moving'}</p></div><span className="board-card-arrow" aria-hidden="true">↗</span></>;
	return invited ? <article className="board-card">{content}</article> : <Link className="board-card" href={`/boards/${board.id}`}>{content}</Link>;
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}