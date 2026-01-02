-- CreateTable
CREATE TABLE "training_schedules" (
    "id" BIGSERIAL NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "member_id" BIGINT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by" BIGINT NOT NULL DEFAULT 0,
    "updated_by" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "training_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_schedules_is_published_day_of_week_start_time_disp_idx" ON "training_schedules"("is_published", "day_of_week", "start_time", "display_order");

-- CreateIndex
CREATE INDEX "training_schedules_member_id_idx" ON "training_schedules"("member_id");
