-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'OPEN',
    "actualValue" DOUBLE PRECISION NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
