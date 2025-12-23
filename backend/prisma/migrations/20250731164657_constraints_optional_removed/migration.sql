/*
  Warnings:

  - Made the column `constraints` on table `Problem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Problem" ALTER COLUMN "constraints" SET NOT NULL;
