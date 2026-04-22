/*
  Warnings:

  - You are about to drop the column `duratio` on the `Postagem` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Postagem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Postagem" DROP COLUMN "duratio",
ADD COLUMN     "duration" TEXT NOT NULL;
