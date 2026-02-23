import { 
  Difficulty, 
  UserRole, 
  ProgrammingLanguage, 
  PrismaClient 
} from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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
  // postgres escapes \ as \\ in text representation. We unescape it for JSON.parse
  let cleaned = str.replace(/\\\\/g, '\\');
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn('Failed to parse JSON:', cleaned.substring(0, 50));
    return null;
  }
}

async function main() {
  console.log('Clearing database...');
  await prisma.testCaseResult.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.problemCompany.deleteMany();
  await prisma.problemTag.deleteMany();
  await prisma.problemTopic.deleteMany();
  await prisma.commentVote.deleteMany();
  await prisma.discussionVote.deleteMany();
  await prisma.discussionComment.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.problemInPlaylist.deleteMany();
  await prisma.playlist.deleteMany();
  await prisma.problemSolved.deleteMany();
  await prisma.problemRating.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.codeTemplate.deleteMany();
  await prisma.example.deleteMany();
  await prisma.constraint.deleteMany();
  await prisma.hint.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.company.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  console.log('Database cleared.');

  console.log('Seeding users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@dexcode.com',
      role: UserRole.ADMIN,
      password: 'hashed_password_placeholder',
      isEmailVerified: true,
      profile: {
        create: {
          username: 'admin',
          displayName: 'Admin Master',
          bio: 'Platform Administrator',
        },
      },
    },
    include: { profile: true }
  });

  await prisma.user.create({
    data: {
      name: 'Test Coder',
      email: 'coder@dexcode.com',
      role: UserRole.USER,
      password: 'hashed_password_placeholder',
      isEmailVerified: true,
      profile: {
        create: {
          username: 'testcoder',
          displayName: 'Test Coder',
          bio: 'I love solving problems!',
          problemsSolved: 0,
        },
      },
    },
    include: { profile: true }
  });

  console.log('Reading postgres.sql...');
  
  // Resolve path to the sql file
  const sqlPath = '/home/anton/coding/DEXCODE/postgres.sql';
  if (!fs.existsSync(sqlPath)) {
    console.error(`ERROR: ${sqlPath} not found!`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  const lines = sqlContent.split('\n');
  
  let isProblemCopy = false;
  const problemsData = [];
  
  for (const line of lines) {
    if (line.startsWith('COPY public."Problem"')) {
      isProblemCopy = true;
      continue;
    }
    if (isProblemCopy) {
      if (line === '\\.') {
        break; // End of COPY
      }
      problemsData.push(line);
    }
  }

  const tagCache = new Map<string, string>();
  const companyCache = new Map<string, string>();
  
  const algoTopic = await prisma.topic.create({
    data: { name: 'Algorithms', slug: 'algorithms', description: 'Core algorithmic problems' },
  });

  console.log(`Loading ${problemsData.length} problems...`);

  const createdProblemIds: string[] = [];

  for (const line of problemsData) {
    const fields = line.split('\t');
    if (fields.length < 16) continue;

    const [
      id, title, description, difficultyStr, tagsStr, userIdStr, examplesStr, editorialStr,
      testcasesStr, codeSnippetsStr, referenceSolutionsStr, createdAt, updatedAt, constraintsStr,
      companiesStr, hintsStr
    ] = fields;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let diff: Difficulty = Difficulty.MEDIUM;
    if (difficultyStr === 'HARD') diff = Difficulty.HARD;
    if (difficultyStr === 'EASY') diff = Difficulty.EASY;
    
    // Create problem
    const problem = await prisma.problem.create({
      data: {
        slug,
        title,
        description: unescapePgStr(description),
        difficulty: diff,
        userId: admin.id,
        isPublished: true,
        editorial: editorialStr === '\\N' ? null : unescapePgStr(editorialStr),
      }
    });

    const problemId = problem.id;
    createdProblemIds.push(problemId);

    // Tags
    const tags = parsePgArray(tagsStr);
    for (const tName of tags) {
      if (!tName) continue;
      const tSlug = tName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let tagId = tagCache.get(tSlug);
      if (!tagId) {
        const tag = await prisma.tag.upsert({
          where: { slug: tSlug },
          update: {},
          create: { name: tName, slug: tSlug },
        });
        tagId = tag.id;
        tagCache.set(tSlug, tag.id);
      }
      await prisma.problemTag.create({ data: { problemId, tagId: tagId }});
    }

    // Companies
    const companies = parsePgArray(companiesStr);
    for (const cName of companies) {
      if (!cName) continue;
      const cSlug = cName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let compId = companyCache.get(cSlug);
      if (!compId) {
        const comp = await prisma.company.upsert({
          where: { slug: cSlug },
          update: {},
          create: { name: cName, slug: cSlug },
        });
        compId = comp.id;
        companyCache.set(cSlug, comp.id);
      }
      await prisma.problemCompany.create({ data: { problemId, companyId: compId }});
    }

    // Topic
    await prisma.problemTopic.create({ data: { problemId, topicId: algoTopic.id }});

    // Hints
    const hints = parsePgArray(hintsStr);
    for (let i = 0; i < hints.length; i++) {
        if (!hints[i]) continue;
        await prisma.hint.create({ data: { problemId, content: hints[i], order: i + 1 }});
    }

    // Constraints
    const constraintsJson = parseJsonField(constraintsStr);
    if (constraintsJson && Array.isArray(constraintsJson)) {
      for (let i = 0; i < constraintsJson.length; i++) {
          await prisma.constraint.create({ data: { problemId, description: constraintsJson[i], order: i + 1 }});
      }
    }

    // Examples
    const examplesJson = parseJsonField(examplesStr);
    if (examplesJson && Array.isArray(examplesJson)) {
      for (let i = 0; i < examplesJson.length; i++) {
        const ex = examplesJson[i];
        const input = ex.display?.input || ex.input || '';
        const output = ex.display?.output || ex.output || '';
        await prisma.example.create({
          data: {
            problemId,
            input: String(input),
            output: String(output),
            explanation: ex.explanation || null,
            order: i + 1
          }
        });
      }
    }

    // Testcases
    const testcasesJson = parseJsonField(testcasesStr);
    if (testcasesJson && Array.isArray(testcasesJson)) {
      for (let i = 0; i < testcasesJson.length; i++) {
        const tc = testcasesJson[i];
        await prisma.testCase.create({
          data: {
            problemId,
            input: String(tc.input || ''),
            output: String(tc.output || ''),
            order: i + 1,
            isHidden: i >= 2
          }
        });
      }
    }

    // Code Templates & Reference solutions
    const codeSnippets = parseJsonField(codeSnippetsStr);
    const refSolutions = parseJsonField(referenceSolutionsStr);

    if (codeSnippets) {
      for (const [lang, snippet] of Object.entries(codeSnippets)) {
        let progLang: ProgrammingLanguage | null = null;
        if (lang === 'PYTHON') progLang = ProgrammingLanguage.PYTHON;
        else if (lang === 'JAVA') progLang = ProgrammingLanguage.JAVA;
        else if (lang === 'JAVASCRIPT') progLang = ProgrammingLanguage.JAVASCRIPT;
        else if (lang === 'CPP') progLang = ProgrammingLanguage.CPP;

        if (progLang) {
          const snip = snippet as any;
          const refSol = refSolutions ? refSolutions[lang] : null;
          await prisma.codeTemplate.create({
            data: {
              problemId,
              language: progLang,
              template: snip.template || '',
              userCode: snip.userCode || '',
              solution: refSol
            }
          });
        }
      }
    }
  }

  console.log('Creating a default playlist...');
  const playlist = await prisma.playlist.create({
    data: {
      name: 'All Old Problems',
      slug: 'all-old-problems',
      description: 'Migrated from postgres.sql',
      userId: admin.id,
      isPublic: true,
      problemCount: createdProblemIds.length
    }
  });

  for (let i = 0; i < createdProblemIds.length; i++) {
    await prisma.problemInPlaylist.create({
      data: {
        playlistId: playlist.id,
        problemId: createdProblemIds[i],
        order: i + 1
      }
    });
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
