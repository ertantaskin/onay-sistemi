/*
  Warnings:

  - You are about to drop the column `lastActive` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `activeSessionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "lastActive",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "activeSessionId",
DROP COLUMN "sessionToken",
ADD COLUMN     "lastSessionToken" TEXT;
