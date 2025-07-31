import express from 'express';
import { isLoggedIn, checkAdmin } from '../middleware/auth.middleware.js';
import {
  createProblem,
  getAllProblems,
  getProblemsById,
  updateProblem,
  deleteProblem,
  getAllProblemsSolvedByUser,
} from '../controllers/problem.controllers.js';

const problemRoutes = express.Router();

problemRoutes
  .route('/create-problem')
  .post(isLoggedIn, checkAdmin, createProblem);

problemRoutes.route('/get-all-problems').get(getAllProblems);

problemRoutes.route('/get-problem/:id').get(getProblemsById);

problemRoutes
  .route('/update-problem/:id')
  .put(isLoggedIn, checkAdmin, updateProblem);

problemRoutes
  .route('/delete-problem/:id')
  .delete(isLoggedIn, checkAdmin, deleteProblem);

problemRoutes
  .route('/get-solved-problems')
  .get(isLoggedIn, getAllProblemsSolvedByUser);

export default problemRoutes;
