import { deleteCardList } from './actions';

export function ListMenu({ listId, listName }: { listId: string; listName: string }) {
	return (
		<form action={deleteCardList} className="list-menu">
			<input type="hidden" name="listId" value={listId} />
			<button
				className="more-button"
				type="submit"
				aria-label={`Delete ${listName} list`}
				title={`Delete ${listName} list`}
			>
				<span className="trash-icon" aria-hidden="true" />
			</button>
		</form>
	);
}
