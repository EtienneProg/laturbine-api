/*
  Warnings:

  - You are about to drop the column `duelId` on the `EloHistory` table. All the data in the column will be lost.
  - The primary key for the `Registration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Registration` table. All the data in the column will be lost.
  - You are about to drop the column `duelId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the `Duel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `gameId` to the `EloHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameId` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('ONGOING', 'FINISHED');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('GRADE', 'DUEL', 'VAMPIRE', 'HUNGER_GAMES', 'SPECIAL');

-- DropForeignKey
ALTER TABLE "Duel" DROP CONSTRAINT "Duel_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "EloHistory" DROP CONSTRAINT "EloHistory_duelId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_duelId_fkey";

-- DropIndex
DROP INDEX "Registration_playerId_sessionId_key";

-- AlterTable
ALTER TABLE "EloHistory" DROP COLUMN "duelId",
ADD COLUMN     "gameId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Registration" DROP CONSTRAINT "Registration_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Registration_pkey" PRIMARY KEY ("playerId", "sessionId");

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "duelId",
DROP COLUMN "number",
ADD COLUMN     "gameId" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "Duel";

-- DropEnum
DROP TYPE "DuelStatus";

-- CreateTable
CREATE TABLE "GameMode" (
    "id" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "teamNames" TEXT[],
    "hasElo" BOOLEAN NOT NULL DEFAULT false,
    "hasTeams" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GameMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'ONGOING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "sessionId" INTEGER NOT NULL,
    "gameModeId" INTEGER NOT NULL,
    "winnerTeamId" INTEGER,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "threshold" INTEGER,
    "isAuto" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerAchievement" (
    "id" SERIAL NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3),
    "playerId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,

    CONSTRAINT "PlayerAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameMode_key_key" ON "GameMode"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_key_key" ON "Achievement"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAchievement_playerId_achievementId_key" ON "PlayerAchievement"("playerId", "achievementId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_gameModeId_fkey" FOREIGN KEY ("gameModeId") REFERENCES "GameMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EloHistory" ADD CONSTRAINT "EloHistory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
