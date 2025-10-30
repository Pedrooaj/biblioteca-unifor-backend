/*
  Warnings:

  - You are about to drop the column `fotoUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `funcao` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookType" AS ENUM ('FISICO', 'DIGITAL');

-- CreateEnum
CREATE TYPE "CopyStatus" AS ENUM ('DISPONIVEL', 'ALUGADO', 'RESERVADO', 'INDISPONIVEL');

-- CreateEnum
CREATE TYPE "BookCondition" AS ENUM ('MUITO_BOA', 'BOA', 'CONSERVADO', 'RUIM', 'MUITO_RUIM');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ATIVO', 'DEVOLVIDO');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('ATIVA', 'CANCELADA', 'EXPIRADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "FolderRole" AS ENUM ('PROPRIETARIO', 'EDITOR', 'LEITOR');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fotoUrl",
DROP COLUMN "funcao",
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "coAutores" TEXT[],
    "edicao" TEXT NOT NULL,
    "anoEdicao" INTEGER NOT NULL,
    "idioma" TEXT NOT NULL,
    "publicacao" TEXT NOT NULL,
    "resumo" TEXT,
    "imageUrl" TEXT,
    "tipo" "BookType" NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookCopy" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "copyNumber" INTEGER NOT NULL,
    "status" "CopyStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "condition" "BookCondition" NOT NULL DEFAULT 'BOA',

    CONSTRAINT "BookCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "userMatricula" TEXT NOT NULL,
    "bookCopyId" TEXT NOT NULL,
    "dataEmprestimo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataLimite" TIMESTAMP(3) NOT NULL,
    "dataDevolucao" TIMESTAMP(3),
    "status" "LoanStatus" NOT NULL DEFAULT 'ATIVO',
    "renovacoes" INTEGER NOT NULL DEFAULT 0,
    "divida" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "userMatricula" TEXT NOT NULL,
    "bookCopyId" TEXT NOT NULL,
    "dataReserva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataLimite" TIMESTAMP(3) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'ATIVA',

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolderUser" (
    "folderId" TEXT NOT NULL,
    "userMatricula" TEXT NOT NULL,
    "role" "FolderRole" NOT NULL DEFAULT 'LEITOR',

    CONSTRAINT "FolderUser_pkey" PRIMARY KEY ("folderId","userMatricula")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "userMatricula" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("userMatricula","bookId")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userMatricula" TEXT NOT NULL,
    "senderRole" "Role" NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookFolders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookFolders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "BookCopy_bookId_copyNumber_key" ON "BookCopy"("bookId", "copyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_bookCopyId_key" ON "Reservation"("bookCopyId");

-- CreateIndex
CREATE INDEX "_BookFolders_B_index" ON "_BookFolders"("B");

-- AddForeignKey
ALTER TABLE "BookCopy" ADD CONSTRAINT "BookCopy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userMatricula_fkey" FOREIGN KEY ("userMatricula") REFERENCES "User"("matricula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_bookCopyId_fkey" FOREIGN KEY ("bookCopyId") REFERENCES "BookCopy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userMatricula_fkey" FOREIGN KEY ("userMatricula") REFERENCES "User"("matricula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_bookCopyId_fkey" FOREIGN KEY ("bookCopyId") REFERENCES "BookCopy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderUser" ADD CONSTRAINT "FolderUser_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderUser" ADD CONSTRAINT "FolderUser_userMatricula_fkey" FOREIGN KEY ("userMatricula") REFERENCES "User"("matricula") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userMatricula_fkey" FOREIGN KEY ("userMatricula") REFERENCES "User"("matricula") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userMatricula_fkey" FOREIGN KEY ("userMatricula") REFERENCES "User"("matricula") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookFolders" ADD CONSTRAINT "_BookFolders_A_fkey" FOREIGN KEY ("A") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookFolders" ADD CONSTRAINT "_BookFolders_B_fkey" FOREIGN KEY ("B") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
