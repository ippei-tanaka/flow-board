import { deleteCard } from './actions';

export function CardMenu({ cardId, cardTitle }: { cardId: string; cardTitle: string }) {
	return (
		<form action={deleteCard} className="card-menu-wrapper">
			<input type="hidden" name="cardId" value={cardId} />
			<button
				className="card-menu"
				type="submit"
				aria-label={`Delete ${cardTitle}`}
				title={`Delete ${cardTitle}`}
			>
				<span className="trash-icon" aria-hidden="true" />
			</button>
		</form>
	);
}
