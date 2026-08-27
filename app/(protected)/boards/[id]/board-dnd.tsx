'use client';

import { startTransition, useState } from 'react';
import { createCard, moveCard } from '../actions';
import { CardMenu } from './card-menu';
import { ListMenu } from './list-menu';

type Card = {
	id: string;
	title: string;
	description: string | null;
	listId: string;
	position: number;
};

type ListWithCards = {
	id: string;
	name: string;
	boardId: string;
	position: number;
	color: string;
	cards: Card[];
};

type DragState = { cardId: string; sourceListId: string } | null;

export function BoardDnd({ boardId, initialLists }: { boardId: string; initialLists: ListWithCards[] }) {
	const [lists, setLists] = useState(initialLists);
	const [dragState, setDragState] = useState<DragState>(null);
	const [dragOverListId, setDragOverListId] = useState<string | null>(null);

	const moveCardLocally = (sourceListId: string, cardId: string, targetListId: string, targetIndex: number) => {
		setLists((currentLists) => {
			const nextLists = currentLists.map((list) => ({
				...list,
				cards: list.cards.map((card) => ({ ...card })),
			}));

			const sourceList = nextLists.find((list) => list.id === sourceListId);
			const targetList = nextLists.find((list) => list.id === targetListId);
			if (!sourceList || !targetList) return currentLists;

			const sourceIndex = sourceList.cards.findIndex((card) => card.id === cardId);
			if (sourceIndex === -1) return currentLists;

			const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
			if (!movedCard) return currentLists;

			const normalizedTargetIndex =
				sourceListId === targetListId && sourceIndex < targetIndex
					? targetIndex - 1
					: targetIndex;

			movedCard.listId = targetListId;
			targetList.cards.splice(Math.max(0, Math.min(normalizedTargetIndex, targetList.cards.length)), 0, movedCard);

			if (sourceListId === targetListId) {
				sourceList.cards = sourceList.cards.map((card, index) => ({ ...card, position: index }));
			} else {
				sourceList.cards = sourceList.cards.map((card, index) => ({ ...card, position: index }));
				targetList.cards = targetList.cards.map((card, index) => ({ ...card, position: index }));
			}

			return nextLists;
		});
	};

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
