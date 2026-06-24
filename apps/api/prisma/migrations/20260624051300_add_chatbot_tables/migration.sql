-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "invoice_number" SET DEFAULT ('INV-' || to_char(CURRENT_DATE, 'YYYY'::text) || '-' || lpad(nextval('invoice_number_seq'::regclass)::text, 6, '0'::text));

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "order_number" SET DEFAULT ('ORD-' || to_char(CURRENT_DATE, 'YYYYMMDD'::text) || '-' || lpad(nextval('order_number_seq'::regclass)::text, 6, '0'::text));

-- AlterTable
ALTER TABLE "quotations" ALTER COLUMN "quotation_number" SET DEFAULT ('QTN-' || to_char(CURRENT_DATE, 'YYYYMMDD'::text) || '-' || lpad(nextval('quotation_number_seq'::regclass)::text, 6, '0'::text));

-- AlterTable
ALTER TABLE "refunds" ALTER COLUMN "refund_number" SET DEFAULT ('REF-' || to_char(CURRENT_DATE, 'YYYYMMDD'::text) || '-' || lpad(nextval('refund_number_seq'::regclass)::text, 6, '0'::text));

-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "ticket_number" SET DEFAULT ('TCK-' || to_char(CURRENT_DATE, 'YYYYMMDD'::text) || '-' || lpad(nextval('ticket_number_seq'::regclass)::text, 6, '0'::text));

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faqs_question_key" ON "faqs"("question");

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
