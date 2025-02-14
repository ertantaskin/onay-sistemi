/*
  Warnings:

  - You are about to drop the column `confirmationNumber` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `iidNumber` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `maxUses` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `minAmount` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `usedCount` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `creditAmount` on the `CouponUsage` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `CreditTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `closedAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `isStaff` on the `TicketMessage` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.
  - Added the required column `code` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iid` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usedAmount` to the `CouponUsage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_userId_fkey";

-- DropIndex
DROP INDEX "Approval_userId_idx";

-- DropIndex
DROP INDEX "CouponUsage_couponId_idx";

-- DropIndex
DROP INDEX "CouponUsage_userId_idx";

-- DropIndex
DROP INDEX "CreditPackage_paymentMethodId_idx";

-- DropIndex
DROP INDEX "CreditTransaction_couponId_idx";

-- DropIndex
DROP INDEX "CreditTransaction_userId_idx";

-- DropIndex
DROP INDEX "Ticket_categoryId_idx";

-- DropIndex
DROP INDEX "Ticket_userId_idx";

-- DropIndex
DROP INDEX "TicketMessage_ticketId_idx";

-- DropIndex
DROP INDEX "TicketMessage_userId_idx";

-- DropIndex
DROP INDEX "Transaction_userId_idx";

-- AlterTable
ALTER TABLE "Approval" DROP COLUMN "confirmationNumber",
DROP COLUMN "iidNumber",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "iid" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "isActive",
DROP COLUMN "maxUses",
DROP COLUMN "minAmount",
DROP COLUMN "usedCount",
DROP COLUMN "value",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "usedAt" TIMESTAMP(3),
ADD COLUMN     "usedById" TEXT;

-- AlterTable
ALTER TABLE "CouponUsage" DROP COLUMN "creditAmount",
ADD COLUMN     "usedAmount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CreditPackage" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "CreditTransaction" DROP COLUMN "note",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "closedAt",
DROP COLUMN "priority";

-- AlterTable
ALTER TABLE "TicketMessage" DROP COLUMN "isStaff";

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin",
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CreditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetId" TEXT,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLog" ADD CONSTRAINT "CreditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
