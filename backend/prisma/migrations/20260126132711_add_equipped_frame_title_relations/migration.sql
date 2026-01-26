-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_equippedFrameId_fkey" FOREIGN KEY ("equippedFrameId") REFERENCES "AvatarFrame"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_equippedTitleId_fkey" FOREIGN KEY ("equippedTitleId") REFERENCES "ProfileTitle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
