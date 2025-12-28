import { asyncHandler } from '../utils/asyncHandler';
import { apiSuccess } from '../utils/ApiError';
import { registerUser, verifyUser } from '../services/auth.service';
import { VerifyEmailDTO } from '@/validators/auth.schema';

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);
  res.status(201).json(apiSuccess(201, 'User registered successfully', user));
});

export const verify = asyncHandler(async (req, res) => {
  const { emailVerificationToken } = req.validated!.params as VerifyEmailDTO;

  await verifyUser({ emailVerificationToken });
  res.status(200).json(apiSuccess(200, 'Email verified successfully'));
});
