/*
  Warnings:

  - You are about to drop the column `iid` on the `Approval` table. All the data in the column will be lost.
  - Added the required column `iidNumber` to the `Approval` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Approval" DROP COLUMN "iid",
ADD COLUMN     "iidNumber" TEXT NOT NULL;
