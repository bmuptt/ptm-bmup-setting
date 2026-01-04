/*
  Warnings:

  - The primary key for the `blog_posts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `blog_posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "ix_blog_posts_status_published_at" ON "blog_posts"("status", "published_at" DESC, "id" DESC);
