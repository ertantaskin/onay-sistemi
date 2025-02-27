-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethodId" TEXT;

-- AlterTable
ALTER TABLE "PaymentMethod" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'EXTERNAL';

-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "content" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_pageKey_key" ON "PageContent"("pageKey");

-- CreateIndex
CREATE INDEX "Order_paymentMethodId_idx" ON "Order"("paymentMethodId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE SET NULL ON UPDATE CASCADE;
