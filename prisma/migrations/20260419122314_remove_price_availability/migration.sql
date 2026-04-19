/*
  Warnings:

  - You are about to drop the column `availability` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Activity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "availability",
DROP COLUMN "price";
