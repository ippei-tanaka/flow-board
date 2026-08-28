'use client';

import { Fragment, startTransition, useState } from 'react';
import { createCard, moveCard } from './actions';
import { BoardMenuProvider } from './board-menu-context';
import { CardMenu } from './card-menu';
import { ListMenu } from './list-menu';

export type Card = {
	id: string;
	title: string;
	description: string | null;
	listId: string;
	position: number;
};

export type ListWithCards = {
	id: string;
	name: string;
	boardId: string;
	position: number;
	color: string;
	cards: Card[];
};

type DragState = { cardId: string; sourceListId: string; } | null;
type DragOverTarget = { listId: string; index: number } | null;

export function BoardDnd({ boardId, initialLists }: { boardId: string; initialLists: ListWithCards[] }) {
	return <BoardDndState key={JSON.stringify(initialLists)} boardId={boardId} initialLists={initialLists} />;
}

function BoardDndState({ boardId, initialLists }: { boardId: string; initialLists: ListWithCards[] }) {
	const [lists, setLists] = useState(initialLists);
	const [dragState, setDragState] = useState<DragState>(null);
	const [dragOverTarget, setDragOverTarget] = useState<DragOverTarget>(null);

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

			const normalizedTargetIndex = sourceListId === targetListId && sourceIndex < targetIndex
				? targetIndex - 1
				: targetIndex;
			movedCard.listId = targetListId;
			targetList.cards.splice(Math.max(0, Math.min(normalizedTargetIndex, targetList.cards.length)), 0, movedCard);

			for (const list of sourceListId === targetListId ? [sourceList] : [sourceList, targetList]) {
				list.cards = list.cards.map((card, index) => ({ ...card, position: index }));
			}

			return nextLists;
		});
	};

	return <BoardMenuProvider><BoardDndContent
		boardId={boardId}
		lists={lists}
		dragState={dragState}
		dragOverTarget={dragOverTarget}
		setDragState={setDragState}
		setDragOverTarget={setDragOverTarget}
		moveCardLocally={moveCardLocally}
	/></BoardMenuProvider>;
}

function BoardDndContent({
	boardId,
	lists,
	dragState,
	dragOverTarget,
	setDragState,
	setDragOverTarget,
	moveCardLocally,
}: {
	boardId: string;
	lists: ListWithCards[];
	dragState: DragState;
	dragOverTarget: DragOverTarget;
	setDragState: (dragState: DragState) => void;
	setDragOverTarget: (target: DragOverTarget) => void;
	moveCardLocally: (sourceListId: string, cardId: string, targetListId: string, targetIndex: number) => void;
}) {

	const handleDrop = (targetListId: string, targetIndex: number) => {
		if (!dragState) return;

		const { cardId, sourceListId } = dragState;
		const sameList = sourceListId === targetListId;
		const resolvedTargetIndex = sameList && sourceListId
			? Math.max(0, targetIndex)
			: Math.max(0, targetIndex);

		console.log(targetIndex);

		moveCardLocally(sourceListId, cardId, targetListId, targetIndex);
		setDragOverTarget(null);

		startTransition(() => {
			const formData = new FormData();
			formData.set('boardId', boardId);
			formData.set('cardId', cardId);
			formData.set('sourceListId', sourceListId);
			formData.set('targetListId', targetListId);
			formData.set('targetIndex', String(targetIndex));
			void moveCard(formData);
		});

		setDragState(null);
	};

	const CardSeparator = ({listId, index}:{listId:string, index: number}) => {
		return (
			<div className='card-separator'
				onDragEnter={(event) => {
					event.preventDefault();
					const sourceList = lists.find((list) => list.id === dragState?.sourceListId);
					const sourceIndex = sourceList?.cards.findIndex((card) => card.id === dragState?.cardId);
					if (!(dragState?.sourceListId === listId && (sourceIndex === index || sourceIndex === index - 1)))
					{
						setDragOverTarget({ listId, index: index });
					}
				}}
				onDragLeave={(event) => {
					event.preventDefault();
					setDragOverTarget(null);
				}}
			>
				{dragOverTarget?.listId === listId && dragOverTarget?.index === index && <div className="card-drop-preview" aria-hidden="true" />}
			</div>
		);
	}

	return (
		<>
			{lists.map((list) => (
				<section
					key={list.id}
					data-list-id={list.id}
					className={`list-column${dragOverTarget?.listId === list.id ? ' is-over' : ''}`}
					onDragOver={(event) => {
						event.preventDefault();
					}}
					onDrop={(event) => {
						event.preventDefault();
						handleDrop(list.id, dragOverTarget?.index ? dragOverTarget?.index - 1 : 0);
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
							<CardSeparator index={0} listId={list.id} />
							{list.cards.map((card, index) => (
								<Fragment key={card.id}>
								<article
									className={`task-card${dragState?.cardId === card.id ? ' is-dragging' : ''}`}
									draggable
									onDragStart={() => {
										setDragState({ cardId: card.id, sourceListId: list.id })
									}}
									onDragEnd={() => {
										setDragState(null);
									}}
								>
									<div className="card-topline">
										<h3>{card.title}</h3>
										<CardMenu cardId={card.id} cardTitle={card.title} />
									</div>
									{card.description && <p>{card.description}</p>}
								</article>
								<CardSeparator index={index + 1} listId={list.id} />
								</Fragment>
							))}
						</div>
					) : (
						<div className="empty-list">
							{dragOverTarget?.listId === list.id && dragOverTarget.index === 0
								? <div className="card-drop-preview" aria-hidden="true" />
								: <p>No cards yet</p>}
						</div>
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
