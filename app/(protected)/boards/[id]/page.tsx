import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { boardMembers, boards } from '@/src/db/schema';
import WorkspaceHeader from '@/app/components/workspace-header';

export const dynamic = 'force-dynamic';

const columns = [
	{ title: 'Ideas', color: 'coral' },
	{ title: 'In progress', color: 'gold' },
	{ title: 'Review', color: 'blue' },
	{ title: 'Done', color: 'green' },
] as const;

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) 
{
	const { data: session } = await auth.getSession();
	const user = session!.user;
	const { id } = await params;

	let board;
	try {
		[board] = await db
			.select({
				id: boards.id,
				name: boards.name,
				role: boardMembers.role,
			})
			.from(boardMembers)
			.innerJoin(boards, eq(boardMembers.boardId, boards.id))
			.where(and(eq(boardMembers.boardId, id), eq(boardMembers.userId, user.id)))
			.limit(1);
	} catch (error) {
		console.error('Failed to load board', { boardId: id, error });
        // notFound();
		return <BoardLoadError />;
	}

	// if (!board) {
		// notFound();
	// }

	return (
		<main className="workspace-shell">
			<WorkspaceHeader activePage="/boards" />

			<section className="board-header">
				<div>
					<p className="eyebrow">Workspace / Board</p>
					<div className="title-row">
						<h1>{board.name}</h1>
						<span className="private-label"><span aria-hidden="true">●</span> Private</span>
					</div>
					<p className="board-description">A clear place to gather ideas, move work forward, and keep the team aligned.</p>
				</div>
				<div className="board-actions">
					<button className="secondary-button" type="button"><span aria-hidden="true">☆</span> Star board</button>
					<button className="primary-button" type="button"><span aria-hidden="true">＋</span> Add member</button>
				</div>
			</section>

			<section className="board-toolbar" aria-label="Board tools">
				<div className="toolbar-left">
					<button className="toolbar-button toolbar-button-active" type="button"><span aria-hidden="true">▦</span> Board</button>
					<button className="toolbar-button" type="button"><span aria-hidden="true">☷</span> Table</button>
					<span className="toolbar-divider" />
					<button className="toolbar-button" type="button"><span aria-hidden="true">⚙</span> Views</button>
				</div>
				<div className="toolbar-right">
					<span className="toolbar-button"><span aria-hidden="true">♙</span> {board.role === 'admin' ? 'Admin' : 'Member'}</span>
					<button className="toolbar-button" type="button"><span aria-hidden="true">⌕</span> Filter</button>
					<button className="toolbar-button" type="button"><span aria-hidden="true">↗</span> Share</button>
				</div>
			</section>

			<section className="board" aria-label={`${board.name} board`}>
				{columns.map((column) => <BoardColumn key={column.title} title={column.title} color={column.color} />)}
				<button className="add-list-button" type="button"><span aria-hidden="true">＋</span> Add another list</button>
			</section>
		</main>
	);
}

function BoardColumn({ title, color }: { title: string; color: string }) {
	return (
		<section className="list-column">
			<div className="list-heading">
				<div className="list-title"><span className={`status-dot ${color}`} /><h2>{title}</h2><span className="card-count">0</span></div>
				<button className="more-button" type="button" aria-label={`More options for ${title}`} title={`More options for ${title}`}>•••</button>
			</div>
			<div className="empty-list"><p>No cards yet</p></div>
			<button className="add-card-button" type="button"><span aria-hidden="true">＋</span> Add a card</button>
		</section>
	);
}

function BoardLoadError() {
	return (
		<main className="workspace-shell">
			<WorkspaceHeader activePage="/boards" />
			<section className="board-header">
				<div>
					<p className="eyebrow">Board unavailable</p>
					<h1>We could not load this board</h1>
					<p className="board-description">There was a problem reaching the database. Please return to your boards and try again.</p>
				</div>
			</section>
		</main>
	);
}