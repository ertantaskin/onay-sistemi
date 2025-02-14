/*
  Warnings:

  - Added the required column `confirmationNumber` to the `Approval` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Approval" ADD COLUMN     "confirmationNumber" TEXT NOT NULL;
