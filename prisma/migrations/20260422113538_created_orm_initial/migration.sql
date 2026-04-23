/*
  Warnings:

  - You are about to drop the column `cargo_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `data_admissao` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `data_exclusao_programada` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `data_nascimento` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email_recuperacao` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `foto_url` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `primeiro_acesso` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `senha_hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobTitle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromotionHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `countComments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `countLikes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `countviews` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `admissao` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aniversario` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cargo` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foto` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('SYSTEM_ADM', 'ADMIN', 'POSTADOR', 'COMMON');

-- CreateEnum
CREATE TYPE "post" AS ENUM ('ANIVERSARIO', 'PROMOÇÃO', 'TEMPODECASA');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_autor_id_fkey";

-- DropForeignKey
ALTER TABLE "PostView" DROP CONSTRAINT "PostView_post_id_fkey";

-- DropForeignKey
ALTER TABLE "PostView" DROP CONSTRAINT "PostView_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "PromotionHistory" DROP CONSTRAINT "PromotionHistory_cargo_anterior_id_fkey";

-- DropForeignKey
ALTER TABLE "PromotionHistory" DROP CONSTRAINT "PromotionHistory_novo_cargo_id_fkey";

-- DropForeignKey
ALTER TABLE "PromotionHistory" DROP CONSTRAINT "PromotionHistory_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_role_id_fkey";

-- DropForeignKey
ALTER TABLE "countComments" DROP CONSTRAINT "countComments_post_id_fkey";

-- DropForeignKey
ALTER TABLE "countLikes" DROP CONSTRAINT "countLikes_post_id_fkey";

-- DropForeignKey
ALTER TABLE "countviews" DROP CONSTRAINT "countviews_post_id_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cargo_id",
DROP COLUMN "createdAt",
DROP COLUMN "data_admissao",
DROP COLUMN "data_exclusao_programada",
DROP COLUMN "data_nascimento",
DROP COLUMN "email_recuperacao",
DROP COLUMN "foto_url",
DROP COLUMN "primeiro_acesso",
DROP COLUMN "role_id",
DROP COLUMN "senha_hash",
DROP COLUMN "status",
DROP COLUMN "telefone",
DROP COLUMN "updatedAt",
ADD COLUMN     "admissao" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "aniversario" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "cargo" TEXT NOT NULL,
ADD COLUMN     "foto" TEXT NOT NULL,
ADD COLUMN     "role" "Roles" NOT NULL DEFAULT 'COMMON',
ADD COLUMN     "username" TEXT NOT NULL;

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "JobTitle";

-- DropTable
DROP TABLE "Like";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "PostView";

-- DropTable
DROP TABLE "PromotionHistory";

-- DropTable
DROP TABLE "Reaction";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "countComments";

-- DropTable
DROP TABLE "countLikes";

-- DropTable
DROP TABLE "countviews";

-- DropEnum
DROP TYPE "PostStatus";

-- DropEnum
DROP TYPE "PostType";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "Postagem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "image" TEXT,
    "video" TEXT,

    CONSTRAINT "Postagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autoPost" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "author" TEXT,
    "type" "post" NOT NULL,
    "mensagem" TEXT NOT NULL,
    "imagem" TEXT,
    "video" TEXT,

    CONSTRAINT "autoPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Postagem" ADD CONSTRAINT "Postagem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
