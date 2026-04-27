/*
  Warnings:

  - A unique constraint covering the columns `[comentarioId,userId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_postId_fkey";

-- DropIndex
DROP INDEX "Like_postId_userId_key";

-- AlterTable
ALTER TABLE "Comentario" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "Like" ALTER COLUMN "postId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "senha_hash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Like_comentarioId_userId_key" ON "Like"("comentarioId", "userId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Postagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comentario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
