-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "comentarioId" TEXT;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_comentarioId_fkey" FOREIGN KEY ("comentarioId") REFERENCES "Comentario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
