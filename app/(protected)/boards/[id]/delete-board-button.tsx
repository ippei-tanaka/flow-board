'use client';

import { deleteBoard } from './actions';

export function DeleteBoardButton({ boardId }: { boardId: string }) {
	return (
		<form action={deleteBoard} onSubmit={(event) => {
			if (!window.confirm('Delete this board and all of its lists and cards?')) {
				event.preventDefault();
			}
		}}>
			<input type="hidden" name="boardId" value={boardId} />
			<button className="delete-board-button" type="submit">Delete board</button>
		</form>
	);
}