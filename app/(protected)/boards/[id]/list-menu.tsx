'use client';

import { useEffect, useRef, useState } from 'react';
import { deleteCardList } from '../actions';

export function ListMenu({ listId, listName }: { listId: string; listName: string }) {
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function closeOnOutsideClick(event: PointerEvent) {
			if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') setOpen(false);
		}

		document.addEventListener('pointerdown', closeOnOutsideClick);
		document.addEventListener('keydown', closeOnEscape);
		return () => {
			document.removeEventListener('pointerdown', closeOnOutsideClick);
			document.removeEventListener('keydown', closeOnEscape);
		};
	}, []);

	return (
		<div className="list-menu" ref={menuRef}>
			<button
				className="more-button"
				type="button"
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label={`More options for ${listName}`}
				title={`More options for ${listName}`}
				onClick={() => setOpen((isOpen) => !isOpen)}
			>
				•••
			</button>
			{open && (
				<div className="list-menu-content" role="menu">
					<form action={deleteCardList}>
						<input type="hidden" name="listId" value={listId} />
						<button className="delete-list-button" type="submit" role="menuitem">Delete list</button>
					</form>
				</div>
			)}
		</div>
	);
}
