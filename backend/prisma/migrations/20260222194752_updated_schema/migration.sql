/*
  Warnings:

  - You are about to drop the column `codeSnippets` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `companies` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `constraints` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `examples` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `hints` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `referenceSolutions` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `testcases` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `playListId` on the `ProblemInPlaylist` table. All the data in the column will be lost.
  - You are about to drop the column `compileOutput` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `memory` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `sourceCode` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `stderr` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `stdin` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `stdout` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `memory` on the `TestCaseResult` table. All the data in the column will be lost.
  - You are about to drop the column `stdout` on the `TestCaseResult` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `TestCaseResult` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,slug]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Problem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playlistId,problemId]` on the table `ProblemInPlaylist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Playlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `ProblemInPlaylist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playlistId` to the `ProblemInPlaylist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `language` on the `Submission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Submission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `TestCaseResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'INTERNAL_ERROR');

-- CreateEnum
CREATE TYPE "ProgrammingLanguage" AS ENUM ('JAVA', 'PYTHON', 'JAVASCRIPT', 'CPP');

-- CreateEnum
CREATE TYPE "TestCaseStatus" AS ENUM ('PASSED', 'FAILED', 'SKIPPED', 'ERROR');

-- DropForeignKey
ALTER TABLE "ProblemInPlaylist" DROP CONSTRAINT "ProblemInPlaylist_playListId_fkey";

-- DropIndex
DROP INDEX "Playlist_name_userId_key";

-- DropIndex
DROP INDEX "ProblemInPlaylist_playListId_problemId_key";

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "problemCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "codeSnippets",
DROP COLUMN "companies",
DROP COLUMN "constraints",
DROP COLUMN "examples",
DROP COLUMN "hints",
DROP COLUMN "referenceSolutions",
DROP COLUMN "tags",
DROP COLUMN "testcases",
ADD COLUMN     "acceptanceRate" DECIMAL(5,2),
ADD COLUMN     "dislikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "successfulSubmissions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSubmissions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProblemInPlaylist" DROP COLUMN "playListId",
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "playlistId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProblemSolved" ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "bestSubmissionId" TEXT,
ADD COLUMN     "solvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "compileOutput",
DROP COLUMN "memory",
DROP COLUMN "sourceCode",
DROP COLUMN "stderr",
DROP COLUMN "stdin",
DROP COLUMN "stdout",
DROP COLUMN "time",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "executionTime" INTEGER,
ADD COLUMN     "memoryUsed" INTEGER,
ADD COLUMN     "score" DECIMAL(5,2),
ADD COLUMN     "verdict" TEXT,
DROP COLUMN "language",
ADD COLUMN     "language" "ProgrammingLanguage" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SubmissionStatus" NOT NULL;

-- AlterTable
ALTER TABLE "TestCaseResult" DROP COLUMN "memory",
DROP COLUMN "stdout",
DROP COLUMN "time",
ADD COLUMN     "executionTime" INTEGER,
ADD COLUMN     "input" TEXT,
ADD COLUMN     "memoryUsed" INTEGER,
ADD COLUMN     "output" TEXT,
ADD COLUMN     "testCaseId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "TestCaseStatus" NOT NULL;

-- CreateTable
CREATE TABLE "TestCase" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeTemplate" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" "ProgrammingLanguage" NOT NULL,
    "template" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "solution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Constraint" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Constraint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hint" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemTag" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemCompany" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemTopic" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discussion" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionComment" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscussionComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionVote" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentVote" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemRating" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "difficulty" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestCase_problemId_idx" ON "TestCase"("problemId");

-- CreateIndex
CREATE INDEX "TestCase_problemId_order_idx" ON "TestCase"("problemId", "order");

-- CreateIndex
CREATE INDEX "CodeTemplate_problemId_idx" ON "CodeTemplate"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeTemplate_problemId_language_key" ON "CodeTemplate"("problemId", "language");

-- CreateIndex
CREATE INDEX "Example_problemId_idx" ON "Example"("problemId");

-- CreateIndex
CREATE INDEX "Example_problemId_order_idx" ON "Example"("problemId", "order");

-- CreateIndex
CREATE INDEX "Constraint_problemId_idx" ON "Constraint"("problemId");

-- CreateIndex
CREATE INDEX "Hint_problemId_idx" ON "Hint"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_slug_idx" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "ProblemTag_problemId_idx" ON "ProblemTag"("problemId");

-- CreateIndex
CREATE INDEX "ProblemTag_tagId_idx" ON "ProblemTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemTag_problemId_tagId_key" ON "ProblemTag"("problemId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "ProblemCompany_problemId_idx" ON "ProblemCompany"("problemId");

-- CreateIndex
CREATE INDEX "ProblemCompany_companyId_idx" ON "ProblemCompany"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemCompany_problemId_companyId_key" ON "ProblemCompany"("problemId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_key" ON "Topic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_slug_idx" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "ProblemTopic_problemId_idx" ON "ProblemTopic"("problemId");

-- CreateIndex
CREATE INDEX "ProblemTopic_topicId_idx" ON "ProblemTopic"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemTopic_problemId_topicId_key" ON "ProblemTopic"("problemId", "topicId");

-- CreateIndex
CREATE INDEX "Discussion_problemId_idx" ON "Discussion"("problemId");

-- CreateIndex
CREATE INDEX "Discussion_userId_idx" ON "Discussion"("userId");

-- CreateIndex
CREATE INDEX "Discussion_createdAt_idx" ON "Discussion"("createdAt");

-- CreateIndex
CREATE INDEX "DiscussionComment_discussionId_idx" ON "DiscussionComment"("discussionId");

-- CreateIndex
CREATE INDEX "DiscussionComment_userId_idx" ON "DiscussionComment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscussionVote_discussionId_userId_key" ON "DiscussionVote"("discussionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentVote_commentId_userId_key" ON "CommentVote"("commentId", "userId");

-- CreateIndex
CREATE INDEX "ProblemRating_problemId_idx" ON "ProblemRating"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemRating_problemId_userId_key" ON "ProblemRating"("problemId", "userId");

-- CreateIndex
CREATE INDEX "Playlist_userId_idx" ON "Playlist"("userId");

-- CreateIndex
CREATE INDEX "Playlist_isPublic_idx" ON "Playlist"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_userId_slug_key" ON "Playlist"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");

-- CreateIndex
CREATE INDEX "Problem_difficulty_idx" ON "Problem"("difficulty");

-- CreateIndex
CREATE INDEX "Problem_userId_idx" ON "Problem"("userId");

-- CreateIndex
CREATE INDEX "Problem_isPublished_idx" ON "Problem"("isPublished");

-- CreateIndex
CREATE INDEX "Problem_createdAt_idx" ON "Problem"("createdAt");

-- CreateIndex
CREATE INDEX "ProblemInPlaylist_playlistId_order_idx" ON "ProblemInPlaylist"("playlistId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemInPlaylist_playlistId_problemId_key" ON "ProblemInPlaylist"("playlistId", "problemId");

-- CreateIndex
CREATE INDEX "ProblemSolved_userId_idx" ON "ProblemSolved"("userId");

-- CreateIndex
CREATE INDEX "ProblemSolved_problemId_idx" ON "ProblemSolved"("problemId");

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE INDEX "Submission_problemId_idx" ON "Submission"("problemId");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_userId_problemId_idx" ON "Submission"("userId", "problemId");

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeTemplate" ADD CONSTRAINT "CodeTemplate_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Example" ADD CONSTRAINT "Example_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Constraint" ADD CONSTRAINT "Constraint_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hint" ADD CONSTRAINT "Hint_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTag" ADD CONSTRAINT "ProblemTag_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTag" ADD CONSTRAINT "ProblemTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemCompany" ADD CONSTRAINT "ProblemCompany_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemCompany" ADD CONSTRAINT "ProblemCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTopic" ADD CONSTRAINT "ProblemTopic_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTopic" ADD CONSTRAINT "ProblemTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemInPlaylist" ADD CONSTRAINT "ProblemInPlaylist_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionComment" ADD CONSTRAINT "DiscussionComment_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionComment" ADD CONSTRAINT "DiscussionComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionVote" ADD CONSTRAINT "DiscussionVote_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionVote" ADD CONSTRAINT "DiscussionVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "DiscussionComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemRating" ADD CONSTRAINT "ProblemRating_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemRating" ADD CONSTRAINT "ProblemRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
