CREATE TABLE "card_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"board_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"list_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "card_lists_board_position_idx" ON "card_lists" ("board_id","position");--> statement-breakpoint
CREATE INDEX "cards_list_position_idx" ON "cards" ("list_id","position");--> statement-breakpoint
ALTER TABLE "card_lists" ADD CONSTRAINT "card_lists_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_list_id_card_lists_id_fkey" FOREIGN KEY ("list_id") REFERENCES "card_lists"("id") ON DELETE CASCADE;