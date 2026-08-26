CREATE TYPE "board_invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "board_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TABLE "board_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"board_id" uuid NOT NULL,
	"email" text NOT NULL,
	"invited_by" text NOT NULL,
	"role" "board_role" DEFAULT 'member'::"board_role" NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"status" "board_invitation_status" DEFAULT 'pending'::"board_invitation_status" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "board_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"board_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "board_role" DEFAULT 'member'::"board_role" NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "board_members_board_user_unique" UNIQUE("board_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "boards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "board_invitations_board_status_idx" ON "board_invitations" ("board_id","status");--> statement-breakpoint
CREATE INDEX "board_invitations_email_status_idx" ON "board_invitations" ("email","status");--> statement-breakpoint
CREATE INDEX "board_members_user_id_idx" ON "board_members" ("user_id");--> statement-breakpoint
CREATE INDEX "boards_owner_id_idx" ON "boards" ("owner_id");--> statement-breakpoint
ALTER TABLE "board_invitations" ADD CONSTRAINT "board_invitations_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_board_id_boards_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE;