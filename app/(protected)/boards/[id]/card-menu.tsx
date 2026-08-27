'use client';

import { useEffect, useRef } from 'react';
import { deleteCard } from '../actions';
import { useUiStore } from '@/lib/stores/ui-store';

export function CardMenu({ cardId, cardTitle }: { cardId: string; cardTitle: string }) {
	const menuRef = useRef<HTMLDivElement>(null);
	const menuId = `card:${cardId}`;
	const open = useUiStore((state) => state.openMenuId === menuId);
	const toggleMenu = useUiStore((state) => state.toggleMenu);
	const closeMenu = useUiStore((state) => state.closeMenu);

	useEffect(() => {
		function closeOnOutsideClick(event: PointerEvent) {
			if (!menuRef.current?.contains(event.target as Node)) closeMenu();
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === 'Escape') closeMenu();
		}

		document.addEventListener('pointerdown', closeOnOutsideClick);
		document.addEventListener('keydown', closeOnEscape);
		return () => {
			document.removeEventListener('pointerdown', closeOnOutsideClick);
			document.removeEventListener('keydown', closeOnEscape);
		};
	}, [closeMenu]);

	return (
		<div className="card-menu-wrapper" ref={menuRef}>
			<button
				className="card-menu"
				type="button"
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label={`More options for ${cardTitle}`}
				title={`More options for ${cardTitle}`}
				onClick={() => toggleMenu(menuId)}
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
