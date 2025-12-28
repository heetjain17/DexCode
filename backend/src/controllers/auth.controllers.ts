import { asyncHandler } from '../utils/asyncHandler';
import { apiSuccess } from '../utils/ApiError';
import { registerUser } from '../services/auth.service';

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  res.status(201).json(apiSuccess(201, 'User registered successfully', user));
});
