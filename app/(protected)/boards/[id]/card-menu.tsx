'use client';

import { useEffect, useRef, useState } from 'react';
import { deleteCard } from '../actions';

export function CardMenu({ cardId, cardTitle }: { cardId: string; cardTitle: string }) {
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
		<div className="card-menu-wrapper" ref={menuRef}>
			<button
				className="card-menu"
				type="button"
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label={`More options for ${cardTitle}`}
				title={`More options for ${cardTitle}`}
				onClick={() => setOpen((isOpen) => !isOpen)}
			>
				•••
			</button>
			{open && (
				<div className="card-menu-content" role="menu">
					<form action={deleteCard}>
						<input type="hidden" name="cardId" value={cardId} />
						<button className="delete-card-button" type="submit" role="menuitem">Delete Card</button>
					</form>
				</div>
			)}
		</div>
	);
}
