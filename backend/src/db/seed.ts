import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs';
import * as schema from './schema';
import {
  users,
  profiles,
  problems,
  testCases,
  codeTemplates,
  examples,
  constraints,
  hints,
  tags,
  problemTags,
  companies,
  problemCompanies,
  topics,
  problemTopics,
  submissions,
  testCaseResults,
  problemSolved,
  playlists,
  problemInPlaylist,
  discussions,
  discussionComments,
  discussionVotes,
  commentVotes,
  problemRatings,
} from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

// ============================================
// PARSERS (unchanged from old seed)
// ============================================

function parsePgArray(str: string): string[] {
  if (!str || str === '\\N') return [];
  const core = str.replace(/^\{/, '').replace(/\}$/, '');
  if (!core) return [];
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < core.length; i++) {
    const char = core[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function unescapePgStr(str: string): string {
  if (!str || str === '\\N') return '';
  return str.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
}

function parseJsonField(str: string): any {
  if (!str || str === '\\N') return null;
  const cleaned = str.replace(/\\\\/g, '\\');
  try {
    return JSON.parse(cleaned);
  } catch {
    console.warn('Failed to parse JSON:', cleaned.substring(0, 50));
    return null;
  }
}

// ============================================
// SEED
// ============================================

async function main() {
  console.log('Clearing database...');
  await db.delete(testCaseResults);
  await db.delete(submissions);
  await db.delete(problemCompanies);
  await db.delete(problemTags);
  await db.delete(problemTopics);
  await db.delete(commentVotes);
  await db.delete(discussionVotes);
  await db.delete(discussionComments);
  await db.delete(discussions);
  await db.delete(problemInPlaylist);
  await db.delete(playlists);
  await db.delete(problemSolved);
  await db.delete(problemRatings);
  await db.delete(testCases);
  await db.delete(codeTemplates);
  await db.delete(examples);
  await db.delete(constraints);
  await db.delete(hints);
  await db.delete(problems);
  await db.delete(tags);
  await db.delete(companies);
  await db.delete(topics);
  await db.delete(profiles);
  await db.delete(users);
  console.log('Database cleared.');

  // ── Users ──────────────────────────────────────────────────────────────────
  console.log('Seeding users...');

  const [admin] = await db
    .insert(users)
    .values({
      name: 'Admin User',
      email: 'admin@dexcode.com',
      role: 'ADMIN',
      password: 'hashed_password_placeholder',
      isEmailVerified: true,
    })
    .returning();

  await db.insert(profiles).values({
    userId: admin.id,
    username: 'admin',
    displayName: 'Admin Master',
    bio: 'Platform Administrator',
  });

  const [coder] = await db
    .insert(users)
    .values({
      name: 'Test Coder',
      email: 'coder@dexcode.com',
      role: 'USER',
      password: 'hashed_password_placeholder',
      isEmailVerified: true,
    })
    .returning();

  await db.insert(profiles).values({
    userId: coder.id,
    username: 'testcoder',
    displayName: 'Test Coder',
    bio: 'I love solving problems!',
    problemsSolved: 0,
  });

  // ── Read postgres.sql ──────────────────────────────────────────────────────
  console.log('Reading postgres.sql...');
  const sqlPath = '/home/anton/coding/DEXCODE/postgres.sql';
  if (!fs.existsSync(sqlPath)) {
    console.error(`ERROR: ${sqlPath} not found!`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  const lines = sqlContent.split('\n');

  let isProblemCopy = false;
  const problemsData: string[] = [];

  for (const line of lines) {
    if (line.startsWith('COPY public."Problem"')) {
      isProblemCopy = true;
      continue;
    }
    if (isProblemCopy) {
      if (line === '\\.') break;
      problemsData.push(line);
    }
  }

  // ── Topic ──────────────────────────────────────────────────────────────────
  const [algoTopic] = await db
    .insert(topics)
    .values({ name: 'Algorithms', slug: 'algorithms', description: 'Core algorithmic problems' })
    .returning();

  console.log(`Loading ${problemsData.length} problems...`);

  const tagCache = new Map<string, string>();
  const companyCache = new Map<string, string>();
  const createdProblemIds: string[] = [];

  for (const line of problemsData) {
    const fields = line.split('\t');
    if (fields.length < 16) continue;

    const [
      _id, title, description, difficultyStr, tagsStr, _userIdStr, examplesStr, editorialStr,
      testcasesStr, codeSnippetsStr, referenceSolutionsStr, _createdAt, _updatedAt,
      constraintsStr, companiesStr, hintsStr,
    ] = fields;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const diff =
      difficultyStr === 'HARD' ? 'HARD' : difficultyStr === 'EASY' ? 'EASY' : 'MEDIUM';

    // ── Problem ──────────────────────────────────────────────────────────────
    const [problem] = await db
      .insert(problems)
      .values({
        slug,
        title,
        description: unescapePgStr(description),
        difficulty: diff as 'EASY' | 'MEDIUM' | 'HARD',
        userId: admin.id,
        isPublished: true,
        editorial: editorialStr === '\\N' ? null : unescapePgStr(editorialStr),
      })
      .returning();

    const problemId = problem.id;
    createdProblemIds.push(problemId);

    // ── Tags ──────────────────────────────────────────────────────────────────
    const tagNames = parsePgArray(tagsStr);
    for (const tName of tagNames) {
      if (!tName) continue;
      const tSlug = tName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let tagId = tagCache.get(tSlug);
      if (!tagId) {
        const [tag] = await db
          .insert(tags)
          .values({ name: tName, slug: tSlug })
          .onConflictDoUpdate({ target: tags.slug, set: { name: tName } })
          .returning();
        tagId = tag.id;
        tagCache.set(tSlug, tagId);
      }
      await db.insert(problemTags).values({ problemId, tagId });
    }

    // ── Companies ─────────────────────────────────────────────────────────────
    const companyNames = parsePgArray(companiesStr);
    for (const cName of companyNames) {
      if (!cName) continue;
      const cSlug = cName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let compId = companyCache.get(cSlug);
      if (!compId) {
        const [comp] = await db
          .insert(companies)
          .values({ name: cName, slug: cSlug })
          .onConflictDoUpdate({ target: companies.slug, set: { name: cName } })
          .returning();
        compId = comp.id;
        companyCache.set(cSlug, compId);
      }
      await db.insert(problemCompanies).values({ problemId, companyId: compId });
    }

    // ── Topic link ────────────────────────────────────────────────────────────
    await db.insert(problemTopics).values({ problemId, topicId: algoTopic.id });

    // ── Hints ─────────────────────────────────────────────────────────────────
    const hintList = parsePgArray(hintsStr);
    for (let i = 0; i < hintList.length; i++) {
      if (!hintList[i]) continue;
      await db.insert(hints).values({ problemId, content: hintList[i], order: i + 1 });
    }

    // ── Constraints ───────────────────────────────────────────────────────────
    const constraintsJson = parseJsonField(constraintsStr);
    if (constraintsJson && Array.isArray(constraintsJson)) {
      for (let i = 0; i < constraintsJson.length; i++) {
        await db
          .insert(constraints)
          .values({ problemId, description: constraintsJson[i], order: i + 1 });
      }
    }

    // ── Examples ──────────────────────────────────────────────────────────────
    const examplesJson = parseJsonField(examplesStr);
    if (examplesJson && Array.isArray(examplesJson)) {
      for (let i = 0; i < examplesJson.length; i++) {
        const ex = examplesJson[i];
        const input = ex.display?.input ?? ex.input ?? '';
        const output = ex.display?.output ?? ex.output ?? '';
        await db.insert(examples).values({
          problemId,
          input: String(input),
          output: String(output),
          explanation: ex.explanation ?? null,
          order: i + 1,
        });
      }
    }

    // ── Test Cases ────────────────────────────────────────────────────────────
    const testcasesJson = parseJsonField(testcasesStr);
    if (testcasesJson && Array.isArray(testcasesJson)) {
      for (let i = 0; i < testcasesJson.length; i++) {
        const tc = testcasesJson[i];
        await db.insert(testCases).values({
          problemId,
          input: String(tc.input ?? ''),
          output: String(tc.output ?? ''),
          order: i + 1,
          isHidden: i >= 2,
        });
      }
    }

    // ── Code Templates ────────────────────────────────────────────────────────
    const codeSnippets = parseJsonField(codeSnippetsStr);
    const refSolutions = parseJsonField(referenceSolutionsStr);

    if (codeSnippets) {
      const langMap: Record<string, 'PYTHON' | 'JAVA' | 'JAVASCRIPT' | 'CPP'> = {
        PYTHON: 'PYTHON',
        JAVA: 'JAVA',
        JAVASCRIPT: 'JAVASCRIPT',
        CPP: 'CPP',
      };
      for (const [lang, snippet] of Object.entries(codeSnippets)) {
        const progLang = langMap[lang];
        if (!progLang) continue;
        const snip = snippet as any;
        const refSol = refSolutions ? refSolutions[lang] : null;
        await db.insert(codeTemplates).values({
          problemId,
          language: progLang,
          template: snip.template ?? '',
          userCode: snip.userCode ?? '',
          solution: refSol ?? null,
        });
      }
    }
  }

  // ── Sample submissions for testcoder ──────────────────────────────────────
  console.log('Seeding sample submissions...');
  if (createdProblemIds.length > 0) {
    const [sub] = await db
      .insert(submissions)
      .values({
        userId: coder.id,
        problemId: createdProblemIds[0],
        code: 'def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i',
        language: 'PYTHON',
        status: 'ACCEPTED',
        verdict: 'All test cases passed',
        executionTime: 42,
        memoryUsed: 14300,
      })
      .returning();

    await db.insert(testCaseResults).values([
      {
        submissionId: sub.id,
        testCase: 1,
        status: 'PASSED',
        passed: true,
        input: '[2,7,11,15]\n9',
        output: '[0,1]',
        expected: '[0,1]',
        executionTime: 12,
        memoryUsed: 14100,
      },
      {
        submissionId: sub.id,
        testCase: 2,
        status: 'PASSED',
        passed: true,
        input: '[3,2,4]\n6',
        output: '[1,2]',
        expected: '[1,2]',
        executionTime: 15,
        memoryUsed: 14200,
      },
    ]);

    await db
      .insert(problemSolved)
      .values({
        userId: coder.id,
        problemId: createdProblemIds[0],
        bestSubmissionId: sub.id,
        attemptCount: 1,
      })
      .onConflictDoUpdate({
        target: [problemSolved.userId, problemSolved.problemId],
        set: { attemptCount: 1, bestSubmissionId: sub.id },
      });

    // ── Sample discussion + comment + votes ──────────────────────────────────
    console.log('Seeding sample discussion...');
    const [disc] = await db
      .insert(discussions)
      .values({
        problemId: createdProblemIds[0],
        userId: coder.id,
        title: 'How to approach this problem efficiently?',
        content:
          'I used a hash map to get O(n) time. The key insight is storing the complement. What approaches did others use?',
      })
      .returning();

    const [comment] = await db
      .insert(discussionComments)
      .values({
        discussionId: disc.id,
        userId: admin.id,
        content: 'Great approach! The hash map solution is optimal here.',
        upvotes: 3,
      })
      .returning();

    await db.insert(discussionVotes).values({
      discussionId: disc.id,
      userId: admin.id,
      value: 1,
    });

    await db.insert(commentVotes).values({
      commentId: comment.id,
      userId: coder.id,
      value: 1,
    });

    // ── Sample rating ────────────────────────────────────────────────────────
    await db.insert(problemRatings).values({
      problemId: createdProblemIds[0],
      userId: coder.id,
      rating: 5,
      difficulty: 2,
      comment: 'Classic problem, great for learning hash maps.',
    });
  }

  // ── Playlist ──────────────────────────────────────────────────────────────
  console.log('Creating default playlist...');
  const [playlist] = await db
    .insert(playlists)
    .values({
      name: 'All Problems',
      slug: 'all-problems',
      description: 'All available problems on DexCode',
      userId: admin.id,
      isPublic: true,
      problemCount: createdProblemIds.length,
    })
    .returning();

  if (createdProblemIds.length > 0) {
    const playlistEntries = createdProblemIds.map((problemId, i) => ({
      playlistId: playlist.id,
      problemId,
      order: i + 1,
    }));
    // Insert in batches of 100 to avoid statement size limits
    for (let i = 0; i < playlistEntries.length; i += 100) {
      await db.insert(problemInPlaylist).values(playlistEntries.slice(i, i + 100));
    }
  }

  console.log(`\nSeeding complete!`);
  console.log(`  Users:     2`);
  console.log(`  Problems:  ${createdProblemIds.length}`);
  console.log(`  Topics:    1`);
  console.log(`  Tags:      ${tagCache.size}`);
  console.log(`  Companies: ${companyCache.size}`);
  console.log(`  Playlist:  1 (${createdProblemIds.length} problems)`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
