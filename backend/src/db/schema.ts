import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  decimal,
  json,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum('UserRole', ['USER', 'ADMIN']);

export const difficultyEnum = pgEnum('Difficulty', ['EASY', 'MEDIUM', 'HARD']);

export const submissionStatusEnum = pgEnum('SubmissionStatus', [
  'PENDING',
  'RUNNING',
  'ACCEPTED',
  'WRONG_ANSWER',
  'TIME_LIMIT_EXCEEDED',
  'MEMORY_LIMIT_EXCEEDED',
  'RUNTIME_ERROR',
  'COMPILATION_ERROR',
  'INTERNAL_ERROR',
]);

export const programmingLanguageEnum = pgEnum('ProgrammingLanguage', [
  'JAVA',
  'PYTHON',
  'JAVASCRIPT',
  'CPP',
]);

export const testCaseStatusEnum = pgEnum('TestCaseStatus', [
  'PASSED',
  'FAILED',
  'SKIPPED',
  'ERROR',
]);

// ============================================
// USER & PROFILE
// ============================================

export const users = pgTable('User', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  role: userRoleEnum('role').default('USER').notNull(),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
  emailVerificationExpiry: timestamp('emailVerificationExpiry'),
  emailVerificationToken: text('emailVerificationToken'),
  forgotPasswordExpiry: timestamp('forgotPasswordExpiry'),
  forgotPasswordToken: text('forgotPasswordToken'),
  isEmailVerified: boolean('isEmailVerified').default(false).notNull(),
  refreshToken: text('refreshToken'),
  provider: text('provider').default('CREDENTAILS').notNull(),
});

export const profiles = pgTable('Profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .unique()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  username: text('username').unique().notNull(),
  name: text('name'),
  avatarUrl: text('avatarUrl'),
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  socialLinks: json('socialLinks'),
  problemsSolved: integer('problemsSolved').default(0),
  easySolved: integer('easySolved').default(0),
  mediumSolved: integer('mediumSolved').default(0),
  hardSolved: integer('hardSolved').default(0),
  currentStreak: integer('currentStreak').default(0),
  longestStreak: integer('longestStreak').default(0),
  lastSolvedAt: timestamp('lastSolvedAt'),
  totalSubmissions: integer('totalSubmissions').default(0),
  acceptedSubmissions: integer('acceptedSubmissions').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

// ============================================
// PROBLEM
// ============================================

export const problems = pgTable(
  'Problem',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique().notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    difficulty: difficultyEnum('difficulty').notNull(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    editorial: text('editorial'),
    isPublished: boolean('isPublished').default(false).notNull(),
    totalSubmissions: integer('totalSubmissions').default(0).notNull(),
    successfulSubmissions: integer('successfulSubmissions').default(0).notNull(),
    acceptanceRate: decimal('acceptanceRate', { precision: 5, scale: 2 }),
    likes: integer('likes').default(0).notNull(),
    dislikes: integer('dislikes').default(0).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index('problem_difficulty_idx').on(t.difficulty),
    index('problem_userId_idx').on(t.userId),
    index('problem_isPublished_idx').on(t.isPublished),
    index('problem_createdAt_idx').on(t.createdAt),
  ]
);

// ============================================
// PROBLEM SUPPORTING MODELS
// ============================================

export const testCases = pgTable(
  'TestCase',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    input: text('input').notNull(),
    output: text('output').notNull(),
    isHidden: boolean('isHidden').default(false).notNull(),
    order: integer('order').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index('testcase_problemId_idx').on(t.problemId),
    index('testcase_problemId_order_idx').on(t.problemId, t.order),
  ]
);

export const codeTemplates = pgTable(
  'CodeTemplate',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    language: programmingLanguageEnum('language').notNull(),
    template: text('template').notNull(),
    userCode: text('userCode').notNull(),
    solution: text('solution'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('codetemplate_problemId_language_idx').on(t.problemId, t.language),
    index('codetemplate_problemId_idx').on(t.problemId),
  ]
);

export const examples = pgTable(
  'Example',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    input: text('input').notNull(),
    output: text('output').notNull(),
    explanation: text('explanation'),
    order: integer('order').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index('example_problemId_idx').on(t.problemId),
    index('example_problemId_order_idx').on(t.problemId, t.order),
  ]
);

export const constraints = pgTable(
  'Constraint',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    order: integer('order').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [index('constraint_problemId_idx').on(t.problemId)]
);

export const hints = pgTable(
  'Hint',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    order: integer('order').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [index('hint_problemId_idx').on(t.problemId)]
);

// ============================================
// TAG SYSTEM
// ============================================

export const tags = pgTable(
  'Tag',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').unique().notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [index('tag_slug_idx').on(t.slug)]
);

export const problemTags = pgTable(
  'ProblemTag',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    tagId: uuid('tagId')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('problemtag_problemId_tagId_idx').on(t.problemId, t.tagId),
    index('problemtag_problemId_idx').on(t.problemId),
    index('problemtag_tagId_idx').on(t.tagId),
  ]
);

// ============================================
// COMPANY SYSTEM
// ============================================

export const companies = pgTable(
  'Company',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').unique().notNull(),
    slug: text('slug').unique().notNull(),
    logo: text('logo'),
    website: text('website'),
    description: text('description'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [index('company_slug_idx').on(t.slug)]
);

export const problemCompanies = pgTable(
  'ProblemCompany',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    companyId: uuid('companyId')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('problemcompany_problemId_companyId_idx').on(t.problemId, t.companyId),
    index('problemcompany_problemId_idx').on(t.problemId),
    index('problemcompany_companyId_idx').on(t.companyId),
  ]
);

// ============================================
// TOPIC SYSTEM
// ============================================

export const topics = pgTable(
  'Topic',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').unique().notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    icon: text('icon'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [index('topic_slug_idx').on(t.slug)]
);

export const problemTopics = pgTable(
  'ProblemTopic',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    topicId: uuid('topicId')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('problemtopic_problemId_topicId_idx').on(t.problemId, t.topicId),
    index('problemtopic_problemId_idx').on(t.problemId),
    index('problemtopic_topicId_idx').on(t.topicId),
  ]
);

// ============================================
// SUBMISSION MODELS
// ============================================

export const submissions = pgTable(
  'Submission',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    language: programmingLanguageEnum('language').notNull(),
    status: submissionStatusEnum('status').notNull(),
    verdict: text('verdict'),
    score: decimal('score', { precision: 5, scale: 2 }),
    executionTime: integer('executionTime'),
    memoryUsed: integer('memoryUsed'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index('submission_userId_idx').on(t.userId),
    index('submission_problemId_idx').on(t.problemId),
    index('submission_status_idx').on(t.status),
    index('submission_userId_problemId_idx').on(t.userId, t.problemId),
  ]
);

export const testCaseResults = pgTable(
  'TestCaseResult',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    submissionId: uuid('submissionId')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    testCaseId: uuid('testCaseId'),
    testCase: integer('testCase').notNull(),
    status: testCaseStatusEnum('status').notNull(),
    passed: boolean('passed').notNull(),
    input: text('input'),
    output: text('output'),
    expected: text('expected').notNull(),
    stderr: text('stderr'),
    compileOutput: text('compileOutput'),
    executionTime: integer('executionTime'),
    memoryUsed: integer('memoryUsed'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [index('testcaseresult_submissionId_idx').on(t.submissionId)]
);

// ============================================
// PROBLEM SOLVED
// ============================================

export const problemSolved = pgTable(
  'ProblemSolved',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    solvedAt: timestamp('solvedAt').defaultNow().notNull(),
    attemptCount: integer('attemptCount').default(1).notNull(),
    bestSubmissionId: uuid('bestSubmissionId'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('problemsolved_userId_problemId_idx').on(t.userId, t.problemId),
    index('problemsolved_userId_idx').on(t.userId),
    index('problemsolved_problemId_idx').on(t.problemId),
  ]
);

// ============================================
// PLAYLIST MODELS
// ============================================

export const playlists = pgTable(
  'Playlist',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isPublic: boolean('isPublic').default(false).notNull(),
    problemCount: integer('problemCount').default(0).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('playlist_userId_slug_idx').on(t.userId, t.slug),
    index('playlist_userId_idx').on(t.userId),
    index('playlist_isPublic_idx').on(t.isPublic),
  ]
);

export const problemInPlaylist = pgTable(
  'ProblemInPlaylist',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    playlistId: uuid('playlistId')
      .notNull()
      .references(() => playlists.id, { onDelete: 'cascade' }),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('probleminplaylist_playlistId_problemId_idx').on(t.playlistId, t.problemId),
    index('probleminplaylist_playlistId_order_idx').on(t.playlistId, t.order),
  ]
);

// ============================================
// DISCUSSION SYSTEM
// ============================================

export const discussions = pgTable(
  'Discussion',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    isPinned: boolean('isPinned').default(false).notNull(),
    isLocked: boolean('isLocked').default(false).notNull(),
    upvotes: integer('upvotes').default(0).notNull(),
    downvotes: integer('downvotes').default(0).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index('discussion_problemId_idx').on(t.problemId),
    index('discussion_userId_idx').on(t.userId),
    index('discussion_createdAt_idx').on(t.createdAt),
  ]
);

export const discussionComments = pgTable(
  'DiscussionComment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    discussionId: uuid('discussionId')
      .notNull()
      .references(() => discussions.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    upvotes: integer('upvotes').default(0).notNull(),
    downvotes: integer('downvotes').default(0).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index('discussioncomment_discussionId_idx').on(t.discussionId),
    index('discussioncomment_userId_idx').on(t.userId),
  ]
);

export const discussionVotes = pgTable(
  'DiscussionVote',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    discussionId: uuid('discussionId')
      .notNull()
      .references(() => discussions.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    value: integer('value').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('discussionvote_discussionId_userId_idx').on(t.discussionId, t.userId)]
);

export const commentVotes = pgTable(
  'CommentVote',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    commentId: uuid('commentId')
      .notNull()
      .references(() => discussionComments.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    value: integer('value').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('commentvote_commentId_userId_idx').on(t.commentId, t.userId)]
);

// ============================================
// RATING SYSTEM
// ============================================

export const problemRatings = pgTable(
  'ProblemRating',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    problemId: uuid('problemId')
      .notNull()
      .references(() => problems.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    difficulty: integer('difficulty'),
    comment: text('comment'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex('problemrating_problemId_userId_idx').on(t.problemId, t.userId),
    index('problemrating_problemId_idx').on(t.problemId),
  ]
);

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  problems: many(problems),
  submissions: many(submissions),
  problemSolved: many(problemSolved),
  playlists: many(playlists),
  discussions: many(discussions),
  discussionComments: many(discussionComments),
  discussionVotes: many(discussionVotes),
  commentVotes: many(commentVotes),
  problemRatings: many(problemRatings),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const problemsRelations = relations(problems, ({ one, many }) => ({
  author: one(users, { fields: [problems.userId], references: [users.id] }),
  testCases: many(testCases),
  codeTemplates: many(codeTemplates),
  examples: many(examples),
  constraints: many(constraints),
  hints: many(hints),
  tags: many(problemTags),
  companies: many(problemCompanies),
  topics: many(problemTopics),
  submissions: many(submissions),
  solvedBy: many(problemSolved),
  playlists: many(problemInPlaylist),
  discussions: many(discussions),
  ratings: many(problemRatings),
}));

export const testCasesRelations = relations(testCases, ({ one }) => ({
  problem: one(problems, { fields: [testCases.problemId], references: [problems.id] }),
}));

export const codeTemplatesRelations = relations(codeTemplates, ({ one }) => ({
  problem: one(problems, { fields: [codeTemplates.problemId], references: [problems.id] }),
}));

export const examplesRelations = relations(examples, ({ one }) => ({
  problem: one(problems, { fields: [examples.problemId], references: [problems.id] }),
}));

export const constraintsRelations = relations(constraints, ({ one }) => ({
  problem: one(problems, { fields: [constraints.problemId], references: [problems.id] }),
}));

export const hintsRelations = relations(hints, ({ one }) => ({
  problem: one(problems, { fields: [hints.problemId], references: [problems.id] }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  problems: many(problemTags),
}));

export const problemTagsRelations = relations(problemTags, ({ one }) => ({
  problem: one(problems, { fields: [problemTags.problemId], references: [problems.id] }),
  tag: one(tags, { fields: [problemTags.tagId], references: [tags.id] }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  problems: many(problemCompanies),
}));

export const problemCompaniesRelations = relations(problemCompanies, ({ one }) => ({
  problem: one(problems, { fields: [problemCompanies.problemId], references: [problems.id] }),
  company: one(companies, { fields: [problemCompanies.companyId], references: [companies.id] }),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  problems: many(problemTopics),
}));

export const problemTopicsRelations = relations(problemTopics, ({ one }) => ({
  problem: one(problems, { fields: [problemTopics.problemId], references: [problems.id] }),
  topic: one(topics, { fields: [problemTopics.topicId], references: [topics.id] }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  user: one(users, { fields: [submissions.userId], references: [users.id] }),
  problem: one(problems, { fields: [submissions.problemId], references: [problems.id] }),
  testResults: many(testCaseResults),
}));

export const testCaseResultsRelations = relations(testCaseResults, ({ one }) => ({
  submission: one(submissions, {
    fields: [testCaseResults.submissionId],
    references: [submissions.id],
  }),
}));

export const problemSolvedRelations = relations(problemSolved, ({ one }) => ({
  user: one(users, { fields: [problemSolved.userId], references: [users.id] }),
  problem: one(problems, { fields: [problemSolved.problemId], references: [problems.id] }),
}));

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, { fields: [playlists.userId], references: [users.id] }),
  problems: many(problemInPlaylist),
}));

export const problemInPlaylistRelations = relations(problemInPlaylist, ({ one }) => ({
  playlist: one(playlists, { fields: [problemInPlaylist.playlistId], references: [playlists.id] }),
  problem: one(problems, { fields: [problemInPlaylist.problemId], references: [problems.id] }),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  problem: one(problems, { fields: [discussions.problemId], references: [problems.id] }),
  user: one(users, { fields: [discussions.userId], references: [users.id] }),
  comments: many(discussionComments),
  votes: many(discussionVotes),
}));

export const discussionCommentsRelations = relations(discussionComments, ({ one, many }) => ({
  discussion: one(discussions, {
    fields: [discussionComments.discussionId],
    references: [discussions.id],
  }),
  user: one(users, { fields: [discussionComments.userId], references: [users.id] }),
  votes: many(commentVotes),
}));

export const discussionVotesRelations = relations(discussionVotes, ({ one }) => ({
  discussion: one(discussions, {
    fields: [discussionVotes.discussionId],
    references: [discussions.id],
  }),
  user: one(users, { fields: [discussionVotes.userId], references: [users.id] }),
}));

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
  comment: one(discussionComments, {
    fields: [commentVotes.commentId],
    references: [discussionComments.id],
  }),
  user: one(users, { fields: [commentVotes.userId], references: [users.id] }),
}));

export const problemRatingsRelations = relations(problemRatings, ({ one }) => ({
  problem: one(problems, { fields: [problemRatings.problemId], references: [problems.id] }),
  user: one(users, { fields: [problemRatings.userId], references: [users.id] }),
}));
