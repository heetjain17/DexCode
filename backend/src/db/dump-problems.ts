/**
 * Dump all problem data from the database into new_problem.json
 *
 * Usage: npx tsx src/db/dump-problems.ts
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { asc, eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import * as schema from './schema';
import {
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
} from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

async function main() {
  console.log('📦 Fetching all problems from database...\n');

  const allProblems = await db.query.problems.findMany({
    orderBy: asc(problems.createdAt),
    with: {
      testCases: { orderBy: asc(testCases.order) },
      codeTemplates: true,
      examples: { orderBy: asc(examples.order) },
      constraints: { orderBy: asc(constraints.order) },
      hints: { orderBy: asc(hints.order) },
      tags: { with: { tag: true } },
      companies: { with: { company: true } },
      topics: { with: { topic: true } },
    },
  });

  console.log(`  Found ${allProblems.length} problems\n`);

  const dump = allProblems.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    difficulty: p.difficulty,
    isPublished: p.isPublished,
    editorial: p.editorial,
    stats: {
      totalSubmissions: p.totalSubmissions,
      successfulSubmissions: p.successfulSubmissions,
      acceptanceRate: p.acceptanceRate,
      likes: p.likes,
      dislikes: p.dislikes,
    },
    tags: p.tags.map((pt) => ({
      name: pt.tag.name,
      slug: pt.tag.slug,
    })),
    companies: p.companies.map((pc) => ({
      name: pc.company.name,
      slug: pc.company.slug,
    })),
    topics: p.topics.map((pt) => ({
      name: pt.topic.name,
      slug: pt.topic.slug,
    })),
    examples: p.examples.map((e) => ({
      input: e.input,
      output: e.output,
      explanation: e.explanation,
      order: e.order,
    })),
    constraints: p.constraints.map((c) => ({
      description: c.description,
      order: c.order,
    })),
    hints: p.hints.map((h) => ({
      content: h.content,
      order: h.order,
    })),
    testCases: p.testCases.map((tc) => ({
      input: tc.input,
      output: tc.output,
      isHidden: tc.isHidden,
      order: tc.order,
    })),
    codeSnippets: Object.fromEntries(
      p.codeTemplates.map((ct) => [
        ct.language,
        {
          template: ct.template,
          userCode: ct.userCode,
        },
      ])
    ),
    referenceSolutions: Object.fromEntries(
      p.codeTemplates
        .filter((ct) => ct.solution)
        .map((ct) => [ct.language, ct.solution])
    ),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  const outPath = path.resolve(new URL('.', import.meta.url).pathname, '../../problems/new_problem.json');
  fs.writeFileSync(outPath, JSON.stringify(dump, null, 2), 'utf-8');

  console.log(`✅ Dumped ${dump.length} problems to: ${outPath}`);
}

main()
  .catch((e) => {
    console.error('❌ Dump failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
