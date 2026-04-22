-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_cargo_id_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "cargo_id" DROP NOT NULL;
