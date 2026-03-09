import { eq } from 'drizzle-orm';
import { executeCodeAgainstTestcases } from '@/services/codeExecution.service';
import { saveSubmission } from '@/services/submission.service';
import { ApiError, apiSuccess } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { db } from '@/libs/db';
import { problems } from '@/db/schema';
import { RunCodeDTO } from '@/validators/code.schema';
import { getLanguageId } from '@/services/judge0.services';

export const runCodePreview = asyncHandler(async (req, res) => {
  const body = req.validated!.body as RunCodeDTO;

  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, body.problemId),
    with: { examples: true, codeTemplates: true },
  });

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  if (!problem.examples?.length) {
    throw new ApiError(500, 'Problem examples not configured');
  }

  const exampleTestcases = problem.examples
    .sort((a, b) => a.order - b.order)
    .map((ex) => ({ input: ex.input, output: ex.output }));

  const template = problem.codeTemplates?.find((t) => t.language === body.language)?.template;
  if (!template) {
    throw new ApiError(500, `No code template configured for language ${body.language}`);
  }

  const result = await executeCodeAgainstTestcases(
    body.source_code,
    getLanguageId(body.language),
    exampleTestcases,
    template
  );

  res.status(200).json(apiSuccess(200, 'Code executed', result));
});

export const submitCode = asyncHandler(async (req, res) => {
  const { source_code, language, problemId } = req.validated!.body as RunCodeDTO;

  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, problemId),
    with: { testCases: true, codeTemplates: true },
  });

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  if (!problem.testCases?.length) {
    throw new ApiError(500, 'Problem test cases not configured');
  }

  const testcases = problem.testCases
    .sort((a, b) => a.order - b.order)
    .map((tc) => ({ input: tc.input, output: tc.output }));

  const template = problem.codeTemplates?.find((t) => t.language === language)?.template;
  if (!template) {
    throw new ApiError(500, `No code template configured for language ${language}`);
  }

  const executionResults = await executeCodeAgainstTestcases(
    source_code,
    getLanguageId(language),
    testcases,
    template
  );

  const analysis = await saveSubmission({
    userId: req.user!.id,
    problemId,
    source_code,
    language,
    testcases,
    executionResults,
    problem: { id: problem.id, title: problem.title, difficulty: problem.difficulty },
  });

  res.status(200).json(apiSuccess(200, 'Code submitted', analysis));
});
