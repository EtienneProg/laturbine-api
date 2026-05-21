-- CreateTable
CREATE TABLE "DiscordMessage" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "refId" INTEGER NOT NULL,
    "messageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscordMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordMessage_type_refId_key" ON "DiscordMessage"("type", "refId");
