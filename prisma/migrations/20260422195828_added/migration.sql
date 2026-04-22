/*
  Warnings:

  - Added the required column `postador` to the `Postagem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Postagem" ADD COLUMN     "postador" TEXT NOT NULL;
