import {
	index,
	pgEnum,
	pgTable,
	timestamp,
	unique,
	uuid,
	text,
	integer,
} from "drizzle-orm/pg-core";

export const boardRole = pgEnum("board_role", ["admin", "member"]);
export const boardInvitationStatus = pgEnum("board_invitation_status", [
	"pending",
	"accepted",
	"revoked",
	"expired",
]);

export const boards = pgTable("boards", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	ownerId: text("owner_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
}, (table) => [
	index("boards_owner_id_idx").on(table.ownerId),
]);

export const cardLists = pgTable("card_lists", {
	id: uuid("id").defaultRandom().primaryKey(),
	boardId: uuid("board_id")
		.notNull()
		.references(() => boards.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	position: integer("position").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
}, (table) => [
	index("card_lists_board_position_idx").on(table.boardId, table.position),
]);

export const cards = pgTable("cards", {
	id: uuid("id").defaultRandom().primaryKey(),
	listId: uuid("list_id")
		.notNull()
		.references(() => cardLists.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	description: text("description"),
	position: integer("position").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
}, (table) => [
	index("cards_list_position_idx").on(table.listId, table.position),
]);

export const boardMembers = pgTable("board_members", {
	id: uuid("id").defaultRandom().primaryKey(),
	boardId: uuid("board_id")
		.notNull()
		.references(() => boards.id, { onDelete: "cascade" }),
	userId: text("user_id").notNull(),
	role: boardRole("role").notNull().default("member"),
	joinedAt: timestamp("joined_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
}, (table) => [
	unique("board_members_board_user_unique").on(table.boardId, table.userId),
	index("board_members_user_id_idx").on(table.userId),
]);

export const boardInvitations = pgTable("board_invitations", {
	id: uuid("id").defaultRandom().primaryKey(),
	boardId: uuid("board_id")
		.notNull()
		.references(() => boards.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	invitedBy: text("invited_by").notNull(),
	role: boardRole("role").notNull().default("member"),
	tokenHash: text("token_hash").notNull().unique(),
	status: boardInvitationStatus("status").notNull().default("pending"),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	acceptedAt: timestamp("accepted_at", { withTimezone: true }),
	revokedAt: timestamp("revoked_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
}, (table) => [
	index("board_invitations_board_status_idx").on(table.boardId, table.status),
	index("board_invitations_email_status_idx").on(table.email, table.status),
]);
