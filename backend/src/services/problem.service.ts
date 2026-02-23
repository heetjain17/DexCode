import { and, asc, desc, eq, ilike, inArray, sql } from 'drizzle-orm';
import { db } from '@/libs/db';
import {
  companies,
  constraints,
  codeTemplates,
  examples,
  hints,
  problems,
  problemCompanies,
  problemSolved,
  problemTags,
  submissions,
  tags,
  testCases,
} from '@/db/schema';
import { ApiError } from '@/utils/ApiError';
import { executeCodeAgainstTestcases } from '@/services/codeExecution.service';
import { getLanguageId } from '@/services/judge0.services';
import type {
  CreateProblemDTO,
  ProblemQueryDTO,
  UpdateProblemDTO,
} from '@/validators/problem.schema';
import type { ExecutionResult } from '@/validators/code.schema';

// Helpers

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function generateProblemSlug(title: string): Promise<string> {
  const base = toSlug(title);
  const existing = await db.query.problems.findFirst({
    where: eq(problems.slug, base),
    columns: { slug: true },
  });
  if (!existing) return base;

  let i = 2;
  while (true) {
    const candidate = `${base}-${i}`;
    const exists = await db.query.problems.findFirst({
      where: eq(problems.slug, candidate),
      columns: { slug: true },
    });
    if (!exists) return candidate;
    i++;
  }
}

async function upsertTags(names: string[]): Promise<string[]> {
  if (!names.length) return [];
  const values = names.map((name) => ({ name, slug: toSlug(name) }));
  await db.insert(tags).values(values).onConflictDoNothing();
  const rows = await db.query.tags.findMany({
    where: inArray(tags.name, names),
    columns: { id: true },
  });
  return rows.map((r) => r.id);
}

async function upsertCompanies(names: string[]): Promise<string[]> {
  if (!names.length) return [];
  const values = names.map((name) => ({ name, slug: toSlug(name) }));
  await db.insert(companies).values(values).onConflictDoNothing();
  const rows = await db.query.companies.findMany({
    where: inArray(companies.name, names),
    columns: { id: true },
  });
  return rows.map((r) => r.id);
}

// Create
export type CreateProblemResult =
  | { success: true; id: string; slug: string }
  | { success: false; reason: 'execution_failed'; details: ExecutionResult[] };

export async function createProblemService(
  data: CreateProblemDTO,
  userId: string
): Promise<CreateProblemResult> {
  const {
    title,
    description,
    difficulty,
    editorial,
    tags: tagNames,
    companies: companyNames,
    hints: hintTexts,
    examples: exampleItems,
    constraints: constraintItems,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = data;

  // 1. Validate reference solution against all test cases
  const refSolution = referenceSolutions[0];
  const languageId = getLanguageId(refSolution.language);
  const testcaseIO = testcases.map((tc) => ({ input: tc.input, output: tc.output }));

  const { allPassed, detailedResults } = await executeCodeAgainstTestcases(
    refSolution.solution,
    languageId,
    testcaseIO
  );

  if (!allPassed) {
    return { success: false, reason: 'execution_failed', details: detailedResults };
  }

  // 2. Generate slug
  const slug = await generateProblemSlug(title);

  // 3. Persist everything in a transaction
  const [problem] = await db.transaction(async (tx) => {
    const [p] = await tx
      .insert(problems)
      .values({ slug, title, description, difficulty, userId, editorial })
      .returning({ id: problems.id, slug: problems.slug });

    const problemId = p.id;

    await tx
      .insert(testCases)
      .values(
        testcases.map((tc) => ({
          problemId,
          input: tc.input,
          output: tc.output,
          isHidden: tc.isHidden,
          order: tc.order,
        }))
      );

    if (exampleItems.length) {
      await tx
        .insert(examples)
        .values(
          exampleItems.map((e) => ({
            problemId,
            input: e.input,
            output: e.output,
            explanation: e.explanation,
            order: e.order,
          }))
        );
    }

    if (constraintItems.length) {
      await tx
        .insert(constraints)
        .values(
          constraintItems.map((c) => ({ problemId, description: c.description, order: c.order }))
        );
    }

    if (hintTexts.length) {
      await tx
        .insert(hints)
        .values(hintTexts.map((content, i) => ({ problemId, content, order: i })));
    }

    // Tags
    const tagIds = await upsertTags(tagNames);
    if (tagIds.length) {
      await tx
        .insert(problemTags)
        .values(tagIds.map((tagId) => ({ problemId, tagId })))
        .onConflictDoNothing();
    }

    // Companies
    const companyIds = await upsertCompanies(companyNames);
    if (companyIds.length) {
      await tx
        .insert(problemCompanies)
        .values(companyIds.map((companyId) => ({ problemId, companyId })))
        .onConflictDoNothing();
    }

    // Code templates (merge snippets + solutions by language)
    const solutionMap = new Map(referenceSolutions.map((rs) => [rs.language, rs.solution]));
    await tx.insert(codeTemplates).values(
      codeSnippets.map((cs) => ({
        problemId,
        language: cs.language,
        template: cs.template,
        userCode: cs.userCode,
        solution: solutionMap.get(cs.language) ?? null,
      }))
    );

    return [p];
  });

  return { success: true, id: problem.id, slug: problem.slug };
}

// Get All (list)
export async function getAllProblemsService(userId: string | undefined, filters: ProblemQueryDTO) {
  const { difficulty, tag, search, page, limit } = filters;
  const offset = (page - 1) * limit;

  const conditions = [eq(problems.isPublished, true)];
  if (difficulty) conditions.push(eq(problems.difficulty, difficulty));
  if (search) conditions.push(ilike(problems.title, `%${search}%`));
  if (tag) {
    const tagSubquery = db
      .select({ problemId: problemTags.problemId })
      .from(problemTags)
      .innerJoin(tags, eq(tags.id, problemTags.tagId))
      .where(eq(tags.slug, tag));
    conditions.push(inArray(problems.id, tagSubquery));
  }

  const where = and(...conditions);

  const [rows, [{ total }], solvedSet] = await Promise.all([
    db.query.problems.findMany({
      where,
      columns: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        acceptanceRate: true,
        totalSubmissions: true,
      },
      with: { tags: { with: { tag: { columns: { id: true, name: true, slug: true } } } } },
      orderBy: desc(problems.createdAt),
      limit,
      offset,
    }),
    db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(problems)
      .where(where),
    userId
      ? db
          .select({ problemId: problemSolved.problemId })
          .from(problemSolved)
          .where(eq(problemSolved.userId, userId))
      : Promise.resolve([]),
  ]);

  const solvedIds = new Set((solvedSet as { problemId: string }[]).map((r) => r.problemId));

  return {
    problems: rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      difficulty: p.difficulty,
      acceptanceRate: p.acceptanceRate,
      totalSubmissions: p.totalSubmissions,
      tags: p.tags.map((pt) => pt.tag),
      isSolved: solvedIds.has(p.id),
    })),
    pagination: { page, limit, total },
  };
}

// Get by ID (full detail)
export async function getProblemService(id: string, userId?: string) {
  const [problem, userSubmissionCount] = await Promise.all([
    db.query.problems.findFirst({
      where: eq(problems.id, id),
      with: {
        examples: { orderBy: asc(examples.order) },
        constraints: { orderBy: asc(constraints.order) },
        hints: { orderBy: asc(hints.order) },
        tags: { with: { tag: { columns: { id: true, name: true, slug: true } } } },
        companies: { with: { company: { columns: { id: true, name: true, slug: true } } } },
        codeTemplates: true,
      },
    }),
    userId
      ? db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(submissions)
          .where(and(eq(submissions.problemId, id), eq(submissions.userId, userId)))
          .then(([r]) => r.count)
      : Promise.resolve(0),
  ]);

  if (!problem) throw new ApiError(404, 'Problem not found');

  const isSolved = userId
    ? !!(await db.query.problemSolved.findFirst({
        where: and(eq(problemSolved.problemId, id), eq(problemSolved.userId, userId)),
        columns: { id: true },
      }))
    : false;

  const templatesMap = problem.codeTemplates.reduce(
    (acc, t) => {
      acc[t.language] = { template: t.template, userCode: t.userCode };
      return acc;
    },
    {} as Record<string, { template: string; userCode: string }>
  );

  return {
    id: problem.id,
    slug: problem.slug,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    editorial: problem.editorial,
    isPublished: problem.isPublished,
    stats: {
      totalSubmissions: problem.totalSubmissions,
      successfulSubmissions: problem.successfulSubmissions,
      acceptanceRate: problem.acceptanceRate,
      likes: problem.likes,
      dislikes: problem.dislikes,
    },
    examples: problem.examples.map((e) => ({
      input: e.input,
      output: e.output,
      explanation: e.explanation,
      order: e.order,
    })),
    constraints: problem.constraints.map((c) => ({ description: c.description, order: c.order })),
    hints: problem.hints.map((h) => ({ content: h.content, order: h.order })),
    tags: problem.tags.map((pt) => pt.tag),
    companies: problem.companies.map((pc) => pc.company),
    codeTemplates: templatesMap,
    isSolved,
    userSubmissionCount,
  };
}

// Update
export async function updateProblemService(id: string, data: UpdateProblemDTO) {
  const existing = await db.query.problems.findFirst({
    where: eq(problems.id, id),
    columns: { id: true, title: true, slug: true },
  });
  if (!existing) throw new ApiError(404, 'Problem not found');

  await db.transaction(async (tx) => {
    // Scalar fields
    const scalarUpdate: Record<string, unknown> = {};
    if (data.title !== undefined) {
      scalarUpdate.title = data.title;
      if (data.title !== existing.title) {
        scalarUpdate.slug = await generateProblemSlug(data.title);
      }
    }
    if (data.description !== undefined) scalarUpdate.description = data.description;
    if (data.difficulty !== undefined) scalarUpdate.difficulty = data.difficulty;
    if (data.editorial !== undefined) scalarUpdate.editorial = data.editorial;
    if (data.isPublished !== undefined) scalarUpdate.isPublished = data.isPublished;

    if (Object.keys(scalarUpdate).length) {
      await tx.update(problems).set(scalarUpdate).where(eq(problems.id, id));
    }

    // Arrays — delete + reinsert
    if (data.testcases) {
      await tx.delete(testCases).where(eq(testCases.problemId, id));
      await tx
        .insert(testCases)
        .values(
          data.testcases.map((tc) => ({
            problemId: id,
            input: tc.input,
            output: tc.output,
            isHidden: tc.isHidden,
            order: tc.order,
          }))
        );
    }

    if (data.examples) {
      await tx.delete(examples).where(eq(examples.problemId, id));
      await tx
        .insert(examples)
        .values(
          data.examples.map((e) => ({
            problemId: id,
            input: e.input,
            output: e.output,
            explanation: e.explanation,
            order: e.order,
          }))
        );
    }

    if (data.constraints) {
      await tx.delete(constraints).where(eq(constraints.problemId, id));
      await tx
        .insert(constraints)
        .values(
          data.constraints.map((c) => ({
            problemId: id,
            description: c.description,
            order: c.order,
          }))
        );
    }

    if (data.hints) {
      await tx.delete(hints).where(eq(hints.problemId, id));
      await tx
        .insert(hints)
        .values(data.hints.map((content, i) => ({ problemId: id, content, order: i })));
    }

    if (data.tags) {
      const tagIds = await upsertTags(data.tags);
      await tx.delete(problemTags).where(eq(problemTags.problemId, id));
      if (tagIds.length) {
        await tx
          .insert(problemTags)
          .values(tagIds.map((tagId) => ({ problemId: id, tagId })))
          .onConflictDoNothing();
      }
    }

    if (data.companies) {
      const companyIds = await upsertCompanies(data.companies);
      await tx.delete(problemCompanies).where(eq(problemCompanies.problemId, id));
      if (companyIds.length) {
        await tx
          .insert(problemCompanies)
          .values(companyIds.map((companyId) => ({ problemId: id, companyId })))
          .onConflictDoNothing();
      }
    }

    if (data.codeSnippets) {
      await tx.delete(codeTemplates).where(eq(codeTemplates.problemId, id));
      const solutionMap = new Map(
        (data.referenceSolutions ?? []).map((rs) => [rs.language, rs.solution])
      );
      await tx.insert(codeTemplates).values(
        data.codeSnippets.map((cs) => ({
          problemId: id,
          language: cs.language,
          template: cs.template,
          userCode: cs.userCode,
          solution: solutionMap.get(cs.language) ?? null,
        }))
      );
    }
  });

  const updated = await db.query.problems.findFirst({
    where: eq(problems.id, id),
    columns: { id: true, slug: true },
  });

  return { id: updated!.id, slug: updated!.slug };
}

// Delete
export async function deleteProblemService(id: string) {
  const existing = await db.query.problems.findFirst({
    where: eq(problems.id, id),
    columns: { id: true },
  });
  if (!existing) throw new ApiError(404, 'Problem not found');

  await db.delete(problems).where(eq(problems.id, id));
}
