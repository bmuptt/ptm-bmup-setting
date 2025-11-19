/*
  Warnings:

  - You are about to alter the column `name` on the `cores` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `logo` on the `cores` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `maps` on the `cores` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `primary_color` on the `cores` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `secondary_color` on the `cores` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "cores" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "logo" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "maps" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "primary_color" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "secondary_color" SET DATA TYPE VARCHAR(255);
