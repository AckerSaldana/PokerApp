-- AlterTable
ALTER TABLE "User" ADD COLUMN     "consecutiveWins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastGameId" TEXT,
ADD COLUMN     "maxWinStreak" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "User_consecutiveWins_idx" ON "User"("consecutiveWins");
