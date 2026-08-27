import { and, asc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { boardMembers, boards, cardLists, cards as cardsTable } from '@/src/db/schema';
import { createCardList } from '../actions';
import { BoardDnd } from './board-dnd';

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
		return <BoardLoadError />;
	}

	const [lists, boardCards] = await Promise.all([
		db.select().from(cardLists).where(eq(cardLists.boardId, id)).orderBy(asc(cardLists.position)),
		db.select().from(cardsTable).innerJoin(cardLists, eq(cardsTable.listId, cardLists.id))
			.where(eq(cardLists.boardId, id)).orderBy(asc(cardsTable.position)),
	]);

	return (
		<main className="workspace-shell">
			<section className="board-header">
				<div>
					<p className="eyebrow">Workspace / Board</p>
					<div className="title-row">
						<h1>{board.name}</h1>
						{/* <span className="private-label"><span aria-hidden="true">●</span> Private</span> */}
					</div>
					{/* <p className="board-description">A clear place to gather ideas, move work forward, and keep the team aligned.</p> */}
				</div>
				<div className="board-actions">
					{/* <button className="secondary-button" type="button"><span aria-hidden="true">☆</span> Star board</button> */}
					{/* <button className="primary-button" type="button"><span aria-hidden="true">＋</span> Add member</button> */}
				</div>
			</section>

			{/* <section className="board-toolbar" aria-label="Board tools">
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
			</section> */}

			<section className="board" aria-label={`${board.name} board`}>
				<BoardDnd
					boardId={id}
					initialLists={lists.map((list, index) => ({
						...list,
						color: columns[index % columns.length].color,
						cards: boardCards.filter(({ cards }) => cards.listId === list.id).map(({ cards }) => ({
							id: cards.id,
							title: cards.title,
							description: cards.description,
							listId: cards.listId,
							position: cards.position,
						})),
					}))}
				/>
				<form action={createCardList} className="add-list-form">
					<input type="hidden" name="boardId" value={id} />
					<input name="name" placeholder="New list name" aria-label="New list name" required maxLength={80} />
					<button className="add-list-button" type="submit"><span aria-hidden="true">＋</span> Add list</button>
				</form>
			</section>
		</main>
	);
}

function BoardLoadError() {
	return (
		<main className="workspace-shell">
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