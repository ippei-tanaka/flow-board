'use client';

import { useActionState } from 'react';
import { createBoard } from './actions';

export default function CreateBoardForm() {
	const [state, formAction, isPending] = useActionState(createBoard, null);

	return (
		<form action={formAction} className="create-board-form">
			<label htmlFor="board-name">Create a board</label>
			<div className="create-board-row">
				<input id="board-name" name="name" placeholder="e.g. Product launch" required maxLength={80} />
				<button className="primary-button" type="submit" disabled={isPending}>
					<span aria-hidden="true">＋</span>{isPending ? 'Creating...' : 'New board'}
				</button>
			</div>
			{state?.error && <p className="form-error" role="alert">{state.error}</p>}
		</form>
	);
}