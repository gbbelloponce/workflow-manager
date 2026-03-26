/*
  Warnings:

  - You are about to drop the `Workflow` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('THRESHOLD', 'VARIANCE');

-- CreateEnum
CREATE TYPE "Operator" AS ENUM ('GT', 'LT', 'GTE', 'LTE', 'EQ');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL');

-- DropTable
DROP TABLE "Workflow";

-- CreateTable
CREATE TABLE "recipient" (
    "id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "target" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "message" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threshold-config" (
    "id" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "operator" "Operator" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "threshold-config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variance-config" (
    "id" TEXT NOT NULL,
    "baseValue" DOUBLE PRECISION NOT NULL,
    "deviationPercent" DOUBLE PRECISION NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "variance-config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "threshold-config_workflowId_key" ON "threshold-config"("workflowId");

-- CreateIndex
CREATE UNIQUE INDEX "variance-config_workflowId_key" ON "variance-config"("workflowId");

-- AddForeignKey
ALTER TABLE "recipient" ADD CONSTRAINT "recipient_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threshold-config" ADD CONSTRAINT "threshold-config_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variance-config" ADD CONSTRAINT "variance-config_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
