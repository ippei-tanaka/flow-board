import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { boards } from '@/src/db/schema';
import CreateBoardForm from './create-board-form';

export const dynamic = 'force-dynamic';

export default async function BoardsPage() {
	const { data: session } = await auth.getSession();
	const user = session!.user;

	const ownedBoards = await db.select().from(boards)
		.where(eq(boards.ownerId, user.id))
		.orderBy(desc(boards.updatedAt));

	return (
		<main className="boards-shell">
			<section className="boards-content" aria-label="Your boards">
				<BoardGroup title={`Your Board${ownedBoards.length > 1 ? 's' : ''}`} count={ownedBoards.length} boards={ownedBoards} empty="Boards you create will live here." />
			</section>
			<section className="boards-intro">
				<CreateBoardForm />
			</section>
		</main>
	);
}

type BoardCard = { id: string; name: string; updatedAt?: Date | null; invitedAt?: Date | null };

function BoardGroup({ title, count, boards: boardList, empty }: { title: string; count: number; boards: BoardCard[]; empty: string }) {
	return <section className="board-group"><div className="group-heading"><div><p className="eyebrow">Workspace</p><h2>{title}<span>{count}</span></h2></div>{count > 0 && <span className="group-rule" />}</div>{boardList.length > 0 ? <div className="board-grid">{boardList.map((board) => <BoardCard key={board.id} board={board} />)}</div> : <div className="empty-group"><span className="empty-mark" aria-hidden="true">＋</span><p>{empty}</p></div>}</section>;
}

function BoardCard({ board }: { board: BoardCard }) {
	return <Link className="board-card" href={`/boards/${board.id}`}><div className="board-card-icon" aria-hidden="true">▦</div><div className="board-card-copy"><h3>{board.name}</h3><p>{board.updatedAt ? `Updated ${formatDate(board.updatedAt)}` : 'Ready to get moving'}</p></div><span className="board-card-arrow" aria-hidden="true">↗</span></Link>;
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}