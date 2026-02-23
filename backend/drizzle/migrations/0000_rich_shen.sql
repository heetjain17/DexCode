CREATE TYPE "public"."Difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "public"."ProgrammingLanguage" AS ENUM('JAVA', 'PYTHON', 'JAVASCRIPT', 'CPP');--> statement-breakpoint
CREATE TYPE "public"."SubmissionStatus" AS ENUM('PENDING', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR', 'INTERNAL_ERROR');--> statement-breakpoint
CREATE TYPE "public"."TestCaseStatus" AS ENUM('PASSED', 'FAILED', 'SKIPPED', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "CodeTemplate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problemId" uuid NOT NULL,
	"language" "ProgrammingLanguage" NOT NULL,
	"template" text NOT NULL,
	"userCode" text NOT NULL,
	"solution" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "CommentVote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commentId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"value" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"website" text,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Company_name_unique" UNIQUE("name"),
	CONSTRAINT "Company_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Constraint" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problemId" uuid NOT NULL,
	"description" text NOT NULL,
	"order" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "DiscussionComment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discussionId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"content" text NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "DiscussionVote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"discussionId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"value" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Discussion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problemId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL,
	"isLocked" boolean DEFAULT false NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Example" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problemId" uuid NOT NULL,
	"input" text NOT NULL,
	"output" text NOT NULL,
	"explanation" text,
	"order" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Hint" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problemId" uuid NOT NULL,
	"content" text NOT NULL,
	"order" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Playlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"userId" uuid NOT NULL,
	"isPublic" boolean DEFAULT false NOT NULL,
	"problemCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProblemCompany" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problemId" uuid NOT NULL,
	"companyId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProblemInPlaylist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playlistId" uuid NOT NULL,
	"problemId" uuid NOT NULL,
	"order" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProblemRating" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problemId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"rating" integer NOT NULL,
	"difficulty" integer,
	"comment" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProblemSolved" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"problemId" uuid NOT NULL,
	"solvedAt" timestamp DEFAULT now() NOT NULL,
	"attemptCount" integer DEFAULT 1 NOT NULL,
	"bestSubmissionId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProblemTag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problemId" uuid NOT NULL,
	"tagId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ProblemTopic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problemId" uuid NOT NULL,
	"topicId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Problem" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" "Difficulty" NOT NULL,
	"userId" uuid NOT NULL,
	"editorial" text,
	"isPublished" boolean DEFAULT false NOT NULL,
	"totalSubmissions" integer DEFAULT 0 NOT NULL,
	"successfulSubmissions" integer DEFAULT 0 NOT NULL,
	"acceptanceRate" numeric(5, 2),
	"likes" integer DEFAULT 0 NOT NULL,
	"dislikes" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Problem_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "Profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"username" text NOT NULL,
	"name" text,
	"avatarUrl" text,
	"bio" text,
	"location" text,
	"website" text,
	"socialLinks" json,
	"problemsSolved" integer DEFAULT 0,
	"easySolved" integer DEFAULT 0,
	"mediumSolved" integer DEFAULT 0,
	"hardSolved" integer DEFAULT 0,
	"currentStreak" integer DEFAULT 0,
	"longestStreak" integer DEFAULT 0,
	"lastSolvedAt" timestamp,
	"totalSubmissions" integer DEFAULT 0,
	"acceptedSubmissions" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "Profile_userId_unique" UNIQUE("userId"),
	CONSTRAINT "Profile_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "Submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"problemId" uuid NOT NULL,
	"code" text NOT NULL,
	"language" "ProgrammingLanguage" NOT NULL,
	"status" "SubmissionStatus" NOT NULL,
	"verdict" text,
	"score" numeric(5, 2),
	"executionTime" integer,
	"memoryUsed" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Tag_name_unique" UNIQUE("name"),
	CONSTRAINT "Tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "TestCaseResult" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submissionId" uuid NOT NULL,
	"testCaseId" uuid,
	"testCase" integer NOT NULL,
	"status" "TestCaseStatus" NOT NULL,
	"passed" boolean NOT NULL,
	"input" text,
	"output" text,
	"expected" text NOT NULL,
	"stderr" text,
	"compileOutput" text,
	"executionTime" integer,
	"memoryUsed" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TestCase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problemId" uuid NOT NULL,
	"input" text NOT NULL,
	"output" text NOT NULL,
	"isHidden" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Topic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Topic_name_unique" UNIQUE("name"),
	CONSTRAINT "Topic_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "UserRole" DEFAULT 'USER' NOT NULL,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"emailVerificationExpiry" timestamp,
	"emailVerificationToken" text,
	"forgotPasswordExpiry" timestamp,
	"forgotPasswordToken" text,
	"isEmailVerified" boolean DEFAULT false NOT NULL,
	"refreshToken" text,
	"provider" text DEFAULT 'CREDENTAILS' NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "CodeTemplate" ADD CONSTRAINT "CodeTemplate_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_commentId_DiscussionComment_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."DiscussionComment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Constraint" ADD CONSTRAINT "Constraint_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DiscussionComment" ADD CONSTRAINT "DiscussionComment_discussionId_Discussion_id_fk" FOREIGN KEY ("discussionId") REFERENCES "public"."Discussion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DiscussionComment" ADD CONSTRAINT "DiscussionComment_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DiscussionVote" ADD CONSTRAINT "DiscussionVote_discussionId_Discussion_id_fk" FOREIGN KEY ("discussionId") REFERENCES "public"."Discussion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "DiscussionVote" ADD CONSTRAINT "DiscussionVote_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Example" ADD CONSTRAINT "Example_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Hint" ADD CONSTRAINT "Hint_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemCompany" ADD CONSTRAINT "ProblemCompany_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemCompany" ADD CONSTRAINT "ProblemCompany_companyId_Company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemInPlaylist" ADD CONSTRAINT "ProblemInPlaylist_playlistId_Playlist_id_fk" FOREIGN KEY ("playlistId") REFERENCES "public"."Playlist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemInPlaylist" ADD CONSTRAINT "ProblemInPlaylist_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemRating" ADD CONSTRAINT "ProblemRating_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemRating" ADD CONSTRAINT "ProblemRating_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemSolved" ADD CONSTRAINT "ProblemSolved_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemSolved" ADD CONSTRAINT "ProblemSolved_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemTag" ADD CONSTRAINT "ProblemTag_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemTag" ADD CONSTRAINT "ProblemTag_tagId_Tag_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemTopic" ADD CONSTRAINT "ProblemTopic_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ProblemTopic" ADD CONSTRAINT "ProblemTopic_topicId_Topic_id_fk" FOREIGN KEY ("topicId") REFERENCES "public"."Topic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_submissionId_Submission_id_fk" FOREIGN KEY ("submissionId") REFERENCES "public"."Submission"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_problemId_Problem_id_fk" FOREIGN KEY ("problemId") REFERENCES "public"."Problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "codetemplate_problemId_language_idx" ON "CodeTemplate" USING btree ("problemId","language");--> statement-breakpoint
CREATE INDEX "codetemplate_problemId_idx" ON "CodeTemplate" USING btree ("problemId");--> statement-breakpoint
CREATE UNIQUE INDEX "commentvote_commentId_userId_idx" ON "CommentVote" USING btree ("commentId","userId");--> statement-breakpoint
CREATE INDEX "company_slug_idx" ON "Company" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "constraint_problemId_idx" ON "Constraint" USING btree ("problemId");--> statement-breakpoint
CREATE INDEX "discussioncomment_discussionId_idx" ON "DiscussionComment" USING btree ("discussionId");--> statement-breakpoint
CREATE INDEX "discussioncomment_userId_idx" ON "DiscussionComment" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "discussionvote_discussionId_userId_idx" ON "DiscussionVote" USING btree ("discussionId","userId");--> statement-breakpoint
CREATE INDEX "discussion_problemId_idx" ON "Discussion" USING btree ("problemId");--> statement-breakpoint
CREATE INDEX "discussion_userId_idx" ON "Discussion" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "discussion_createdAt_idx" ON "Discussion" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "example_problemId_idx" ON "Example" USING btree ("problemId");--> statement-breakpoint
CREATE INDEX "example_problemId_order_idx" ON "Example" USING btree ("problemId","order");--> statement-breakpoint
CREATE INDEX "hint_problemId_idx" ON "Hint" USING btree ("problemId");--> statement-breakpoint
CREATE UNIQUE INDEX "playlist_userId_slug_idx" ON "Playlist" USING btree ("userId","slug");--> statement-breakpoint
CREATE INDEX "playlist_userId_idx" ON "Playlist" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "playlist_isPublic_idx" ON "Playlist" USING btree ("isPublic");--> statement-breakpoint
CREATE UNIQUE INDEX "problemcompany_problemId_companyId_idx" ON "ProblemCompany" USING btree ("problemId","companyId");--> statement-breakpoint
CREATE INDEX "problemcompany_problemId_idx" ON "ProblemCompany" USING btree ("problemId");--> statement-breakpoint
CREATE INDEX "problemcompany_companyId_idx" ON "ProblemCompany" USING btree ("companyId");--> statement-breakpoint
CREATE UNIQUE INDEX "probleminplaylist_playlistId_problemId_idx" ON "ProblemInPlaylist" USING btree ("playlistId","problemId");--> statement-breakpoint
CREATE INDEX "probleminplaylist_playlistId_order_idx" ON "ProblemInPlaylist" USING btree ("playlistId","order");--> statement-breakpoint
CREATE UNIQUE INDEX "problemrating_problemId_userId_idx" ON "ProblemRating" USING btree ("problemId","userId");--> statement-breakpoint
CREATE INDEX "problemrating_problemId_idx" ON "ProblemRating" USING btree ("problemId");--> statement-breakpoint
CREATE UNIQUE INDEX "problemsolved_userId_problemId_idx" ON "ProblemSolved" USING btree ("userId","problemId");--> statement-breakpoint
CREATE INDEX "problemsolved_userId_idx" ON "ProblemSolved" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "problemsolved_problemId_idx" ON "ProblemSolved" USING btree ("problemId");--> statement-breakpoint
CREATE UNIQUE INDEX "problemtag_problemId_tagId_idx" ON "ProblemTag" USING btree ("problemId","tagId");--> statement-breakpoint
CREATE INDEX "problemtag_problemId_idx" ON "ProblemTag" USING btree ("problemId");--> statement-breakpoint
CREATE INDEX "problemtag_tagId_idx" ON "ProblemTag" USING btree ("tagId");--> statement-breakpoint
CREATE UNIQUE INDEX "problemtopic_problemId_topicId_idx" ON "ProblemTopic" USING btree ("problemId","topicId");--> statement-breakpoint
CREATE INDEX "problemtopic_problemId_idx" ON "ProblemTopic" USING btree ("problemId");--> statement-breakpoint
CREATE INDEX "problemtopic_topicId_idx" ON "ProblemTopic" USING btree ("topicId");--> statement-breakpoint
CREATE INDEX "problem_difficulty_idx" ON "Problem" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "problem_userId_idx" ON "Problem" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "problem_isPublished_idx" ON "Problem" USING btree ("isPublished");--> statement-breakpoint
CREATE INDEX "problem_createdAt_idx" ON "Problem" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "submission_userId_idx" ON "Submission" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "submission_problemId_idx" ON "Submission" USING btree ("problemId");--> statement-breakpoint
CREATE INDEX "submission_status_idx" ON "Submission" USING btree ("status");--> statement-breakpoint
CREATE INDEX "submission_userId_problemId_idx" ON "Submission" USING btree ("userId","problemId");--> statement-breakpoint
CREATE INDEX "tag_slug_idx" ON "Tag" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "testcaseresult_submissionId_idx" ON "TestCaseResult" USING btree ("submissionId");--> statement-breakpoint
CREATE INDEX "testcase_problemId_idx" ON "TestCase" USING btree ("problemId");--> statement-breakpoint
CREATE INDEX "testcase_problemId_order_idx" ON "TestCase" USING btree ("problemId","order");--> statement-breakpoint
CREATE INDEX "topic_slug_idx" ON "Topic" USING btree ("slug");