/*
  Warnings:

  - You are about to drop the column `nome` on the `User` table. All the data in the column will be lost.
  - Added the required column `duratio` to the `Postagem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Postagem" ADD COLUMN     "duratio" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "nome",
ALTER COLUMN "foto" DROP NOT NULL;
