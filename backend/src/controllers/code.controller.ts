import { executeCodeAgainstTestcases } from '@/services/codeExecution.service';
import { ApiError, apiSuccess } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { db } from '@/libs/db';
import {
  problemExamplesSchema,
  RunCodeDTO,
  Testcase,
  testcasesSchema,
} from '@/validators/code.schema';
import { getLanguageId, getLanguageName } from '@/libs/judge0.client';

export const runCodePreview = asyncHandler(async (req, res) => {
  const body = req.validated!.body as RunCodeDTO;

  const problem = await db.problem.findUnique({
    where: { id: body.problemId },
  });

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }
  if (!problem.examples) {
    throw new ApiError(500, 'Problem examples not configured');
  }

  const parsedExamples = problemExamplesSchema.parse(problem.examples);

  const examples = parsedExamples.map((ex) => ({
    input: ex.compiler?.input,
    output: ex.compiler?.output,
  }));

  const result = await executeCodeAgainstTestcases(
    body.source_code,
    getLanguageId(body.language),
    examples
  );

  res.status(200).json(apiSuccess(200, 'Code executed', result));
});

export const submitCode = asyncHandler(async (req, res) => {
  const { source_code, language, problemId } = req.validated!
    .body as RunCodeDTO;
  const userId = req.user!.id;

  const problem = await db.problem.findUnique({
    where: { id: problemId },
  });

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  const languageId = getLanguageId(language);

  const testcases: Testcase[] = testcasesSchema.parse(problem.testcases);

  const { detailedResults, allPassed } = await executeCodeAgainstTestcases(
    source_code,
    languageId,
    testcases
  );

  const submission = await db.submission.create({
    data: {
      userId,
      problemId,
      sourceCode: source_code,
      language: getLanguageName(languageId),
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      memory: JSON.stringify(detailedResults.map((r) => r.memory)),
      time: JSON.stringify(detailedResults.map((r) => r.time)),
    },
  });

  // Save testcase results
  await db.testCaseResult.createMany({
    data: detailedResults.map((r) => ({
      submissionId: submission.id,
      testCase: r.testCase,
      passed: r.passed,
      stdout: r.stdout,
      expected: r.expected,
      stderr: r.stderr,
      compileOutput: r.compileOutput,
      status: r.status,
      memory: r.memory,
      time: r.time,
    })),
  });

  // Mark solved
  if (allPassed) {
    await db.problemSolved.upsert({
      where: { userId_problemId: { userId, problemId } },
      update: {},
      create: { userId, problemId },
    });
  }

  res.status(200).json(
    apiSuccess(200, 'Code submitted', {
      submissionId: submission.id,
      status: submission.status,
    })
  );
});
