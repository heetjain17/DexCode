import { db } from '../libs/db.js';
import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from '../libs/judge0.lib.js';
import { ApiError, ApiSuccess } from '../utils/apiError.js';

const executeAndVerify = async (source_code, language_id, testcases) => {
  // Handles cases where testcases might be null or not an array
  if (!Array.isArray(testcases) || testcases.length === 0) {
    throw new ApiError(400, 'Invalid or empty testcases provided.');
  }

  if (!language_id) {
    throw new ApiError(400, 'Language ID is missing.');
  }

  const stdin = testcases.map((tc) => tc.input);
  const expected_outputs = testcases.map((tc) => tc.output);

  const submissions = stdin.map((input) => ({
    source_code,
    language_id: language_id,
    stdin: input,
  }));

  const submitResponse = await submitBatch(submissions);
  const tokens = submitResponse.map((res) => res.token);
  const results = await pollBatchResults(tokens);

  let allPassed = true;
  const detailedResults = results.map((result, i) => {
    const stdout = result.stdout?.trim();
    const expected_output = expected_outputs[i]?.trim();
    const passed = stdout === expected_output;
    if (!passed) {
      allPassed = false;
    }

    return {
      testCase: i + 1,
      passed,
      stdout,
      expected: expected_output,
      status: result.status.description,
      memory: result.memory ? `${result.memory} KB` : undefined,
      time: result.time ? `${result.time} s` : null,
      stderr: result.stderr || null,
      compile_output: result.compile_output,
    };
  });

  return { detailedResults, allPassed };
};

const runCode = async (req, res, next) => {
  const { source_code, language_id, problemId } = req.body;

  try {
    const problem = await db.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return next(new ApiError(404, 'Problem not found'));
    }

    // Use the 'examples' field from the problem for the run action
    const { detailedResults, allPassed } = await executeAndVerify(
      source_code,
      language_id,
      problem.examples
    );

    // Return the preview results without saving anything
    return res.status(200).json(
      new ApiSuccess(200, 'Code Executed for Preview', {
        detailedResults,
        allPassed,
      })
    );
  } catch (error) {
    console.log('Error running code: ', error);
    next(new ApiError(500, 'Error running code', error));
  }
};

const submitCode = async (req, res, next) => {
  const { source_code, language_id, problemId } = req.body;
  const userId = req.user.id;

  try {
    const problem = await db.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return next(new ApiError(404, 'Problem not found'));
    }

    // Use the 'testcases' field from the problem for the final submission
    const { detailedResults, allPassed } = await executeAndVerify(
      source_code,
      language_id,
      problem.testcases
    );

    // --- Database Operations ---
    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: source_code,
        language: getLanguageName(language_id),
        status: allPassed ? 'Accepted' : 'Wrong Answer',
        // Storing aggregate results as JSON strings
        memory: JSON.stringify(detailedResults.map((r) => r.memory)),
        time: JSON.stringify(detailedResults.map((r) => r.time)),
      },
    });

    if (allPassed) {
      await db.problemSolved.upsert({
        where: { userId_problemId: { userId, problemId } },
        update: {},
        create: { userId, problemId },
      });
    }

    const testCaseResultsData = detailedResults.map((result) => ({
      submissionId: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

    await db.testCaseResult.createMany({
      data: testCaseResultsData,
    });

    const submissionWithTestCases = await db.submission.findUnique({
      where: { id: submission.id },
      include: { testCases: true },
    });

    return res
      .status(200)
      .json(
        new ApiSuccess(
          200,
          'Code Submitted Successfully',
          submissionWithTestCases
        )
      );
  } catch (error) {
    console.log('Error submitting problem: ', error);
    next(new ApiError(500, 'Error submitting problem', error));
  }
};

export { runCode, submitCode };
