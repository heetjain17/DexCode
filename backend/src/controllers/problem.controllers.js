import express from 'express';
import { db } from '../libs/db.js';
import dotenv from 'dotenv';
import {
  getJudge0LanguageId,
  submitBatch,
  pollBatchResults,
} from '../libs/judge0.lib.js';
import { ApiError, ApiSuccess } from '../utils/apiError.js';
dotenv.config();

const createProblem = async (req, res, next) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return next(new ApiError(400, `Language ${language} no supported`));
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      // contains token for each set of {input, output}
      const submissionResults = await submitBatch(submissions);

      // extracting tokens from array of objects
      const tokens = submissionResults.map((res) => res.token);

      // gets the outputs using given tokens
      const results = await pollBatchResults(tokens);

      // checking whether each testcase is cleared
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return next(
            new ApiError(
              400,
              `Testcase ${i + 1} failed for language ${language}`
            )
          );
        }
      }

      const newProblem = await db.problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referenceSolutions,
          userId: req.user.id,
        },
      });

      return res
        .status(201)
        .json(new ApiSuccess(201, 'Problem created successfully', newProblem));
    }
  } catch (error) {
    console.error('Error creating problem:', error);
    next(new ApiError(500, 'Error creating problem', error));
  }
};

const getAllProblems = async (req, res, next) => {
  try {
    // const problems = await db.problem.findMany({
    //   include: {
    //     solvedBy:  {
    //       where: {
    //         userId: req.user.id
    //       }
    //     }
    //   }
    // });
    const problems = await db.problem.findMany();

    if (problems.length === 0) {
      return next(new ApiError(403, 'Problems not found'));
    }

    return res
      .status(200)
      .json(new ApiSuccess(200, 'All problems fetched successfully', problems));
  } catch (error) {
    console.error('Error while fetching problems: ', error);
    next(new ApiError(500, 'Error while fetching problems', error));
  }
};

const getProblemsById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return next(new ApiError(400, 'Problem not found', error));
    }

    return res
      .status(200)
      .json(new ApiSuccess(200, 'Problem fetched by id successfully', problem));
  } catch (error) {
    console.error('Error while fetching Problem by Id: ', error);
    next(new ApiError(500, 'Error while fetching Problem by Id', error));
  }
};

const updateProblem = async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
  } = req.body;

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);

      if (!languageId) {
        return next(new ApiError(400, `Language ${language} no supported`));
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);

      const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          next(
            new ApiError(
              400,
              `Testcase ${i + 1} failed for language ${language}`
            )
          );
        }
      }

      const updatedProblem = await db.problem.update({
        where: {
          id: id,
        },
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippets,
          referenceSolutions,
          userId: req.user.id,
        },
      });

      return res
        .status(201)
        .json(
          new ApiSuccess(201, 'Problem updated successfully', updatedProblem)
        );
    }
  } catch (error) {
    console.error('Error updating problem:', error);
    next(new ApiError(500, 'Error updating problem', error));
  }
};

const deleteProblem = async (req, res, next) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({ where: { id } });
    if (!problem) {
      return next(new ApiError(404, 'Problem not found'));
    }

    await db.problem.delete({ where: { id } });

    return res
      .status(200)
      .json(new ApiSuccess(200, 'Problem deleted successfully', problem));
  } catch (error) {
    console.error('Error deleting problem:', error);
    next(new ApiError(500, 'Error deleting problem', error));
  }
};

const getAllProblemsSolvedByUser = async (req, res, next) => {
  try {
    const problems = await db.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        solvedBy: {
          where: {
            userId: req.user.id,
          },
        },
      },
    });

    return res
      .status(200)
      .json(
        new ApiSuccess(200, 'Solved problems fetched successfully', problems)
      );
  } catch (error) {
    console.error('Error fetching solved problems:', error);
    next(new ApiError(500, 'Error fetching solved problems', error));
  }
};

export {
  createProblem,
  getAllProblems,
  getProblemsById,
  updateProblem,
  deleteProblem,
  getAllProblemsSolvedByUser,
};
