/*
  Warnings:

  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `icon` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `repeat` on the `Task` table. All the data in the column will be lost.
  - Made the column `color` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `end` on table `Task` required. This step will fail if there are existing NULL values in that column.
  - Made the column `start` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Task" DROP CONSTRAINT "Task_pkey",
DROP COLUMN "icon",
DROP COLUMN "repeat",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "color" SET NOT NULL,
ALTER COLUMN "alert" DROP DEFAULT,
ALTER COLUMN "end" SET NOT NULL,
ALTER COLUMN "end" SET DATA TYPE TEXT,
ALTER COLUMN "start" SET NOT NULL,
ALTER COLUMN "start" SET DATA TYPE TEXT,
ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Task_id_seq";
