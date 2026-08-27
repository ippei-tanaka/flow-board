'use client';

import { startTransition } from 'react';
import { createCard, moveCard } from './actions';
import { BoardProvider, useBoardStore, type ListWithCards } from '@/lib/stores/board-store';
import { CardMenu } from './card-menu';
import { ListMenu } from './list-menu';

export function BoardDnd({ boardId, initialLists }: { boardId: string; initialLists: ListWithCards[] }) {
	return <BoardProvider initialLists={initialLists}><BoardDndContent boardId={boardId} /></BoardProvider>;
}

function BoardDndContent({ boardId }: { boardId: string }) {
	const lists = useBoardStore((state) => state.lists);
	const dragState = useBoardStore((state) => state.dragState);
	const dragOverListId = useBoardStore((state) => state.dragOverListId);
	const setDragState = useBoardStore((state) => state.setDragState);
	const setDragOverListId = useBoardStore((state) => state.setDragOverListId);
	const moveCardLocally = useBoardStore((state) => state.moveCardLocally);

	const handleDrop = (targetListId: string, targetIndex: number) => {
		if (!dragState) return;

		const { cardId, sourceListId } = dragState;
		const sameList = sourceListId === targetListId;
		const resolvedTargetIndex = sameList && sourceListId
			? Math.max(0, targetIndex)
			: Math.max(0, targetIndex);

		moveCardLocally(sourceListId, cardId, targetListId, resolvedTargetIndex);
		setDragOverListId(null);

		startTransition(() => {
			const formData = new FormData();
			formData.set('boardId', boardId);
			formData.set('cardId', cardId);
			formData.set('sourceListId', sourceListId);
			formData.set('targetListId', targetListId);
			formData.set('targetIndex', String(resolvedTargetIndex));
			void moveCard(formData);
		});

		setDragState(null);
	};

	return (
		<>
			{lists.map((list) => (
				<section
					key={list.id}
					className={`list-column${dragOverListId === list.id ? ' is-over' : ''}`}
					onDragOver={(event) => {
						event.preventDefault();
						setDragOverListId(list.id);
					}}
					onDragLeave={() => {
						if (dragOverListId === list.id) {
							setDragOverListId(null);
						}
					}}
					onDrop={(event) => {
						event.preventDefault();
						handleDrop(list.id, list.cards.length);
					}}
				>
					<div className="list-heading">
						<div className="list-title">
							<span className={`status-dot ${list.color}`} />
							<h2>{list.name}</h2>
							<span className="card-count">{list.cards.length}</span>
						</div>
						<ListMenu listId={list.id} listName={list.name} />
					</div>

					{list.cards.length > 0 ? (
						<div className="card-stack">
							{list.cards.map((card, index) => (
								<article
									key={card.id}
									className={`task-card${dragState?.cardId === card.id ? ' is-dragging' : ''}`}
									draggable
									onDragStart={() => setDragState({ cardId: card.id, sourceListId: list.id })}
									onDragEnd={() => {
										setDragState(null);
										setDragOverListId(null);
									}}
									onDragOver={(event) => {
										event.preventDefault();
										setDragOverListId(list.id);
									}}
									onDrop={(event) => {
										event.preventDefault();
										handleDrop(list.id, index);
									}}
								>
									<div className="card-topline">
										<h3>{card.title}</h3>
										<CardMenu cardId={card.id} cardTitle={card.title} />
									</div>
									{card.description && <p>{card.description}</p>}
								</article>
							))}
						</div>
					) : (
						<div className="empty-list"><p>No cards yet</p></div>
					)}
					<form action={createCard} className="add-card-form">
						<input type="hidden" name="listId" value={list.id} />
						<input name="title" placeholder="Card title" aria-label={`New card in ${list.name}`} required maxLength={160} />
						<input name="description" placeholder="Description (optional)" aria-label="Card description" maxLength={500} />
						<button className="add-card-button" type="submit"><span aria-hidden="true">＋</span> Add a card</button>
					</form>
				</section>
			))}
		</>
	);
}
