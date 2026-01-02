-- CreateTable
CREATE TABLE "about_team_members" (
    "id" BIGSERIAL NOT NULL,
    "member_id" BIGINT NOT NULL,
    "role" VARCHAR(120) NOT NULL,
    "display_order" INTEGER NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_by" BIGINT NOT NULL DEFAULT 0,
    "updated_by" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "about_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "about_team_members_member_id_idx" ON "about_team_members"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "about_team_members_member_id_role_key" ON "about_team_members"("member_id", "role");
