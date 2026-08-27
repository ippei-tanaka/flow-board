'use client';

import { useEffect, useRef } from 'react';
import { deleteCardList } from './actions';
import { useUiStore } from '@/lib/stores/ui-store';

export function ListMenu({ listId, listName }: { listId: string; listName: string }) {
	const menuRef = useRef<HTMLDivElement>(null);
	const menuId = `list:${listId}`;
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
		<div className="list-menu" ref={menuRef}>
			<button
				className="more-button"
				type="button"
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label={`More options for ${listName}`}
				title={`More options for ${listName}`}
				onClick={() => toggleMenu(menuId)}
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
