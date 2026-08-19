CREATE TYPE "CommercePaymentEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED');

ALTER TYPE "CommerceOrderStatus" ADD VALUE 'REFUND_PENDING' AFTER 'FULFILLED';

ALTER TABLE "CommerceOrder"
  ADD COLUMN "gatewayPaymentId" TEXT,
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "refundedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "CommerceOrder_gatewayPaymentId_key" ON "CommerceOrder"("gatewayPaymentId");

CREATE TABLE "CommercePaymentEvent" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" "CommercePaymentEventStatus" NOT NULL DEFAULT 'RECEIVED',
  "institutionId" TEXT,
  "orderId" TEXT,
  "providerPaymentId" TEXT,
  "providerRefundId" TEXT,
  "amountMinor" BIGINT,
  "currency" TEXT,
  "payloadHash" TEXT NOT NULL,
  "failureCode" TEXT,
  "metadata" JSONB,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  CONSTRAINT "CommercePaymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommercePaymentEvent_provider_providerEventId_key" ON "CommercePaymentEvent"("provider", "providerEventId");
CREATE INDEX "CommercePaymentEvent_status_receivedAt_idx" ON "CommercePaymentEvent"("status", "receivedAt");
CREATE INDEX "CommercePaymentEvent_institutionId_receivedAt_idx" ON "CommercePaymentEvent"("institutionId", "receivedAt");
CREATE INDEX "CommercePaymentEvent_orderId_receivedAt_idx" ON "CommercePaymentEvent"("orderId", "receivedAt");

CREATE TABLE "CommerceCreditNote" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT,
  "orderId" TEXT NOT NULL,
  "invoiceId" TEXT,
  "creditNoteNumber" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerRefundId" TEXT NOT NULL,
  "amount" DECIMAL(65,30) NOT NULL,
  "currency" TEXT NOT NULL,
  "reason" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommerceCreditNote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommerceCreditNote_creditNoteNumber_key" ON "CommerceCreditNote"("creditNoteNumber");
CREATE UNIQUE INDEX "CommerceCreditNote_providerRefundId_key" ON "CommerceCreditNote"("providerRefundId");
CREATE INDEX "CommerceCreditNote_institutionId_createdAt_idx" ON "CommerceCreditNote"("institutionId", "createdAt");
CREATE INDEX "CommerceCreditNote_orderId_createdAt_idx" ON "CommerceCreditNote"("orderId", "createdAt");

ALTER TABLE "CommercePaymentEvent" ADD CONSTRAINT "CommercePaymentEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommercePaymentEvent" ADD CONSTRAINT "CommercePaymentEvent_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommerceCreditNote" ADD CONSTRAINT "CommerceCreditNote_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommerceCreditNote" ADD CONSTRAINT "CommerceCreditNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CommerceCreditNote" ADD CONSTRAINT "CommerceCreditNote_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "CommerceInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
