-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "created_by" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "updated_by" BIGINT NOT NULL DEFAULT 0;
