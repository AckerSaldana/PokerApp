-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastLoginDate" TIMESTAMP(3),
ADD COLUMN     "lastSpinDate" TIMESTAMP(3),
ADD COLUMN     "loginStreak" INTEGER NOT NULL DEFAULT 0;
