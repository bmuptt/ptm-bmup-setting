/*
  Warnings:

  - You are about to drop the column `email` on the `members` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `members` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."members_email_key";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "email",
ADD COLUMN     "username" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "members_username_key" ON "members"("username");
