-- CreateEnum
CREATE TYPE "FrameRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "TitleRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "UnlockType" AS ENUM ('DEFAULT', 'ACHIEVEMENT', 'MILESTONE', 'SPECIAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "equippedFrameId" TEXT,
ADD COLUMN     "equippedTitleId" TEXT;

-- CreateTable
CREATE TABLE "AvatarFrame" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" "FrameRarity" NOT NULL,
    "cssClass" TEXT NOT NULL,
    "unlockType" "UnlockType" NOT NULL,
    "requirement" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "AvatarFrame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileTitle" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rarity" "TitleRarity" NOT NULL,
    "color" TEXT NOT NULL,
    "unlockType" "UnlockType" NOT NULL,
    "requirement" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ProfileTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAvatarFrame" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "frameId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAvatarFrame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfileTitle" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "titleId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProfileTitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvatarFrame_key_key" ON "AvatarFrame"("key");

-- CreateIndex
CREATE INDEX "AvatarFrame_rarity_idx" ON "AvatarFrame"("rarity");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileTitle_key_key" ON "ProfileTitle"("key");

-- CreateIndex
CREATE INDEX "ProfileTitle_rarity_idx" ON "ProfileTitle"("rarity");

-- CreateIndex
CREATE INDEX "UserAvatarFrame_userId_idx" ON "UserAvatarFrame"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAvatarFrame_userId_frameId_key" ON "UserAvatarFrame"("userId", "frameId");

-- CreateIndex
CREATE INDEX "UserProfileTitle_userId_idx" ON "UserProfileTitle"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfileTitle_userId_titleId_key" ON "UserProfileTitle"("userId", "titleId");

-- AddForeignKey
ALTER TABLE "UserAvatarFrame" ADD CONSTRAINT "UserAvatarFrame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAvatarFrame" ADD CONSTRAINT "UserAvatarFrame_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "AvatarFrame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfileTitle" ADD CONSTRAINT "UserProfileTitle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfileTitle" ADD CONSTRAINT "UserProfileTitle_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "ProfileTitle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
