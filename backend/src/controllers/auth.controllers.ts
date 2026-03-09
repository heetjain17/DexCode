import type { CookieOptions } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError, apiSuccess } from '../utils/ApiError';
import {
  generateAccessandRefreshTokenService,
  githubOAuthCallbackService,
  googleOAuthCallbackService,
  loginService,
  logoutService,
  refreshAccessTokenService,
  registerService,
  resendEmailVerificationService,
  verifyService,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService,
} from '../services/auth.service';
import {
  LoginSchemaDTO,
  oAuthSchemaDTO,
  RegisterDto,
  ResendEmailVerficationDTO,
  VerifyEmailDTO,
  ForgotPasswordDTO,
  ResetPasswordParamDTO,
  ResetPasswordDTO,
  ChangePasswordDTO,
} from '@/validators/auth.schema';
import { getEnv } from '@/utils/env';

const isProd = process.env.NODE_ENV === 'production';

const accessTokenOptions: CookieOptions = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'strict',
  secure: isProd,
  maxAge: 15 * 60 * 1000,
};
const refreshTokenOptions: CookieOptions = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'strict',
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const data = req.validated!.body as RegisterDto;
  const user = await registerService(data);
  res
    .status(201)
    .json(apiSuccess(201, 'User registered successfully, Verify your email first', user));
});

export const verify = asyncHandler(async (req, res) => {
  const { emailVerificationToken } = req.validated!.params as VerifyEmailDTO;

  await verifyService({ emailVerificationToken });
  res.status(200).json(apiSuccess(200, 'Email verified successfully'));
});

export const resendEmail = asyncHandler(async (req, res) => {
  const data = req.validated!.body as ResendEmailVerficationDTO;
  await resendEmailVerificationService(data);
  res.status(200).json(apiSuccess(200, 'Verification email sent again'));
});

export const login = asyncHandler(async (req, res) => {
  const data = req.validated!.body as LoginSchemaDTO;
  const user = await loginService(data);
  const { accessToken, refreshToken } = await generateAccessandRefreshTokenService(user.id);
  res
    .cookie('accessToken', accessToken, accessTokenOptions)
    .cookie('refreshToken', refreshToken, refreshTokenOptions)
    .status(200)
    .json(
      apiSuccess(200, 'User Logged in successfully', {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      })
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefToken = req.cookies?.refreshToken;
  if (!incomingRefToken) {
    throw new ApiError(401, 'Refresh token missing');
  }
  const { accessToken, refreshToken } = await refreshAccessTokenService(incomingRefToken);
  res
    .cookie('accessToken', accessToken, accessTokenOptions)
    .cookie('refreshToken', refreshToken, refreshTokenOptions)
    .status(200)
    .json(apiSuccess(200, 'Session refreshed'));
});

export const logout = asyncHandler(async (req, res) => {
  await logoutService(req.user!.id);

  res
    .clearCookie('accessToken', accessTokenOptions)
    .clearCookie('refreshToken', refreshTokenOptions)
    .status(200)
    .json(apiSuccess(200, 'Logged out successfully'));
});

export const googleOAuthRedirect = asyncHandler(async (req, res) => {
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${getEnv('GOOGLE_CLIENT_ID')}&redirect_uri=${getEnv('GOOGLE_REDIRECT_URI')}&response_type=code&scope=openid%20email%20profile`;

  res.redirect(redirectUrl);
});

export const googleOAuthCallback = asyncHandler(async (req, res) => {
  const { code } = req.validated!.query as oAuthSchemaDTO;
  const user = await googleOAuthCallbackService({ code });

  const { accessToken, refreshToken } = await generateAccessandRefreshTokenService(user.id);
  res
    .cookie('accessToken', accessToken, accessTokenOptions)
    .cookie('refreshToken', refreshToken, refreshTokenOptions);

  res.redirect(`${getEnv('CLIENT_URL')}/auth/callback`);
});

export const githubOAuthRedirect = asyncHandler(async (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${getEnv('GITHUB_CLIENT_ID')}&redirect_uri=${getEnv('GITHUB_REDIRECT_URI')}&scope=user:email`;

  res.redirect(redirectUrl);
});
export const githubOAuthCallback = asyncHandler(async (req, res) => {
  const { code } = req.validated!.query as oAuthSchemaDTO;
  const user = await githubOAuthCallbackService({ code });

  const { accessToken, refreshToken } = await generateAccessandRefreshTokenService(user.id);
  res
    .cookie('accessToken', accessToken, accessTokenOptions)
    .cookie('refreshToken', refreshToken, refreshTokenOptions);

  res.redirect(`${getEnv('CLIENT_URL')}/auth/callback`);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const data = req.validated!.body as ForgotPasswordDTO;
  await forgotPasswordService(data);
  res.status(200).json(apiSuccess(200, 'If that email exists, a reset link has been sent'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const params = req.validated!.params as ResetPasswordParamDTO;
  const body = req.validated!.body as ResetPasswordDTO;
  await resetPasswordService(params, body);
  res.status(200).json(apiSuccess(200, 'Password reset successfully'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const data = req.validated!.body as ChangePasswordDTO;
  await changePasswordService(req.user!.id, data);
  res
    .clearCookie('accessToken', accessTokenOptions)
    .clearCookie('refreshToken', refreshTokenOptions)
    .status(200)
    .json(apiSuccess(200, 'Password changed successfully. Please log in again'));
});
