/*
  Warnings:

  - A unique constraint covering the columns `[activeSessionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "activeSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_activeSessionId_key" ON "User"("activeSessionId");
