-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "image" TEXT;

-- CreateTable
CREATE TABLE "CommentHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "commentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "CommentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReaction" (
    "commentId" TEXT NOT NULL,
    "reacterId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("reacterId","commentId")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "postId" TEXT NOT NULL,
    "likerId" TEXT NOT NULL,

    CONSTRAINT "PostLike_pkey" PRIMARY KEY ("likerId","postId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentHistory_commentId_createdAt_key" ON "CommentHistory"("commentId", "createdAt");

-- AddForeignKey
ALTER TABLE "CommentHistory" ADD CONSTRAINT "CommentHistory_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_reacterId_fkey" FOREIGN KEY ("reacterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_likerId_fkey" FOREIGN KEY ("likerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
