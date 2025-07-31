import { db } from '../libs/db.js';
import { ApiError, ApiSuccess } from '../utils/apiError.js';

const getAllSubmissions = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const submissions = await db.submission.findMany({
      where: { userId },
    });

    res
      .status(200)
      .json(
        new ApiSuccess(200, 'Submissions fetched successfully', submissions)
      );
  } catch (error) {
    console.log('Error fetching submissions: ', error);
    next(new ApiError(500, 'Error fetching submissions', error));
  }
};

const getAllSubmissionForProblem = async (req, res, next) => {
  const userId = req.user.id;
  const problemId = req.params.problemId;

  try {
    const submission = await db.submission.findMany({
      where: {
        userId: userId,
        problemId: problemId,
      },
      orderBy: {
        createdAt: 'desc', // Sort by creation date, descending (latest first)
      },
    });

    res
      .status(200)
      .json(new ApiSuccess(200, 'Submissions fetched by id', submission));
  } catch (error) {
    console.log('Error fetching all submissions by id: ', error);
    next(new ApiError(500, 'Error fetching all submissions by id', error));
  }
};

const getAllTheSubmissionsForProblem = async (req, res, next) => {
  const userId = req.user.id;
  const problemId = req.params.problemId;
  try {
    const count = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });
    res
      .status(200)
      .json(new ApiSuccess(200, 'All Submission fetched by id', count));
  } catch (error) {
    console.log('Error fetching problem by id: ', error);
    next(new ApiError(500, 'Error fetching problem by id', error));
  }
};

export {
  getAllSubmissions,
  getAllSubmissionForProblem,
  getAllTheSubmissionsForProblem,
};
