import express from 'express';
import { isLoggedIn } from '../middleware/auth.middleware.js';
import { runCode, submitCode } from '../controllers/executeCode.controllers.js';

const executionRoutes = express.Router();

executionRoutes.route('/run').post(isLoggedIn, runCode);
executionRoutes.route('/submit').post(isLoggedIn, submitCode);

export default executionRoutes;
