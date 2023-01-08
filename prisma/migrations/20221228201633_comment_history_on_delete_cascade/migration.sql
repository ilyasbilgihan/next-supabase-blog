-- DropForeignKey
ALTER TABLE "CommentHistory" DROP CONSTRAINT "CommentHistory_commentId_fkey";

-- AlterTable
ALTER TABLE "CommentHistory" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "CommentHistory" ADD CONSTRAINT "CommentHistory_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
