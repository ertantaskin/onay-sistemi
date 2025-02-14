/*
  Warnings:

  - You are about to drop the column `code` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `usedAt` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `usedById` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `usedAmount` on the `CouponUsage` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `CreditPackage` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `CreditTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AdminLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreditLog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `confirmationNumber` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxUses` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creditAmount` to the `CouponUsage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AdminLog" DROP CONSTRAINT "AdminLog_adminId_fkey";

-- DropForeignKey
ALTER TABLE "AdminLog" DROP CONSTRAINT "AdminLog_targetId_fkey";

-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_usedById_fkey";

-- DropForeignKey
ALTER TABLE "CreditLog" DROP CONSTRAINT "CreditLog_userId_fkey";

-- AlterTable
ALTER TABLE "Approval" DROP COLUMN "code",
ADD COLUMN     "confirmationNumber" TEXT NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "amount",
DROP COLUMN "isUsed",
DROP COLUMN "usedAt",
DROP COLUMN "usedById",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxUses" INTEGER NOT NULL,
ADD COLUMN     "minAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "value" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CouponUsage" DROP COLUMN "usedAmount",
ADD COLUMN     "creditAmount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CreditPackage" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "CreditTransaction" DROP COLUMN "status",
ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'normal';

-- AlterTable
ALTER TABLE "TicketMessage" ADD COLUMN     "isStaff" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isBlocked",
DROP COLUMN "lastLoginAt",
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "AdminLog";

-- DropTable
DROP TABLE "CreditLog";

-- CreateIndex
CREATE INDEX "Approval_userId_idx" ON "Approval"("userId");

-- CreateIndex
CREATE INDEX "CouponUsage_couponId_idx" ON "CouponUsage"("couponId");

-- CreateIndex
CREATE INDEX "CouponUsage_userId_idx" ON "CouponUsage"("userId");

-- CreateIndex
CREATE INDEX "CreditPackage_paymentMethodId_idx" ON "CreditPackage"("paymentMethodId");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "CreditTransaction_couponId_idx" ON "CreditTransaction"("couponId");

-- CreateIndex
CREATE INDEX "Ticket_userId_idx" ON "Ticket"("userId");

-- CreateIndex
CREATE INDEX "Ticket_categoryId_idx" ON "Ticket"("categoryId");

-- CreateIndex
CREATE INDEX "TicketMessage_ticketId_idx" ON "TicketMessage"("ticketId");

-- CreateIndex
CREATE INDEX "TicketMessage_userId_idx" ON "TicketMessage"("userId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
