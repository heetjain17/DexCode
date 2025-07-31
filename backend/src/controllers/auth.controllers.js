import bcrypt from 'bcryptjs';
import { db } from '../libs/db.js';
import { UserRole } from '../generated/prisma/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';
import { ApiError, ApiSuccess } from '../utils/apiError.js';
import {
  sendMail,
  emailVerificationContent,
  forgotPasswordContent,
} from '../utils/mail.js';

dotenv.config();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV !== 'development',
};
//tested
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );

    await db.user.update({
      where: { id: userId },
      data: { refreshToken: refreshToken },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while generating referesh and access token'
    );
  }
};
// tested
const registerUser = async (req, res, next) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return next(new ApiError(400, 'User already exists'));
    }

    // const token =
    const hashedPassword = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await db.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: name,
        emailVerificationToken: token,
        emailVerificationExpiry: tokenExpiry,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerificationToken: true,
        emailVerificationExpiry: true,
      },
    });

    if (newUser.provider === 'CREDENTIALS' && !newUser.password) {
      throw new ApiError(500, 'User account is invalid — missing password');
    }

    if (!newUser) {
      return next(new ApiError(400, 'User not created'));
    }

    const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify/${newUser.emailVerificationToken}`;

    //sending mail
    await sendMail({
      email: newUser.email,
      subject: 'Email verification',
      mailGenContent: emailVerificationContent(newUser.name, verificationUrl),
    });

    return res
      .status(201)
      .json(
        new ApiSuccess(
          201,
          'User created successfully \n Verify your email please',
          newUser
        )
      );
  } catch (error) {
    console.error('Error creating user:', error);
    next(new ApiError(500, 'Error creating user', error));
  }
};
// tested
const verifyUser = async (req, res, next) => {
  const { token } = req.params;
  try {
    if (!token) {
      return next(new ApiError(404, 'User not found'));
    }

    const user = await db.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (user.emailVerificationExpiry < new Date(Date.now())) {
      return next(new ApiError(401, 'Request email verification again'));
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return res
      .status(200)
      .json(new ApiSuccess(200, 'Email verified successfully'));
  } catch (error) {
    console.error('Error verifying user:', error);
    next(new ApiError(500, 'Error verifying user', error));
  }
};
// tested
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (!user.isEmailVerified) {
      return next(new ApiError(401, 'Verify your email first'));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new ApiError(400, 'Invalid credentials'));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user.id
    );

    return res
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', refreshToken, cookieOptions)
      .status(200)
      .json(
        new ApiSuccess(200, 'User Logged in successfully', {
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          id: user.id,
        })
      );
  } catch (error) {
    console.error('Error logging in user:', error);
    next(new ApiError(500, 'Error logging in user', error));
  }
};
//tested
const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefToken = req.cookies.refreshToken;

    if (!incomingRefToken) {
      throw new ApiError(500, 'Error fetching refresh token', error);
    }

    const decodedToken = jwt.verify(
      incomingRefToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await db.user.findUnique({
      where: {
        id: decodedToken?.id,
      },
    });

    if (!user) {
      return next(new ApiError(404, 'Invalid refresh token'));
    }

    if (incomingRefToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user.id
    );

    return res
      .status(200)
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', refreshToken, cookieOptions)
      .json(
        new ApiSuccess(200, 'refresh access token', {
          email: user.email,
          name: user.name,
          id: user.id,
          refreshToken: user.refreshToken,
        })
      );
  } catch (error) {
    console.error('Error refershing access token:', error);
    next(new ApiError(500, 'Error refershing access token', error));
  }
};
// tested
const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const user = await db.user.updateMany({
      where: {
        refreshToken: refreshToken,
      },
      data: {
        refreshToken: null,
      },
    });

    if (!user) {
      return next(new ApiError(404, 'Invalid refresh token'));
    }

    res
      .status(200)
      .clearCookie('accessToken', cookieOptions)
      .clearCookie('refreshToken', cookieOptions)
      .json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Error logging out user:', error);
    next(new ApiError(500, 'Error logging out user', error));
  }
};
// tested
const checkUser = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User authenticated successfully',
      user: req.user,
    });
  } catch (error) {
    console.error('Error checking user:', error);
    next(new ApiError(500, 'Error checking user', error));
  }
};
// tested
const resendEmailVerification = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (user.isEmailVerified) {
      return next(new ApiError(400, 'Email is already verified'));
    }

    if (
      user.emailVerificationExpiry &&
      user.emailVerificationExpiry > new Date()
    ) {
      return next(
        new ApiError(400, 'Email already sent. Please wait or check spam')
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 10 * 60 * 60 * 1000);

    const newUser = await db.user.update({
      where: {
        email: email,
      },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiry: tokenExpiry,
      },
    });

    const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify/${token}`;

    await sendMail({
      email: newUser.email,
      subject: 'Email verifcation',
      mailGenContent: emailVerificationContent(newUser.name, verificationUrl),
    });

    return res
      .status(200)
      .json(new ApiSuccess(200, 'Verification Email sent again'));
  } catch (error) {
    console.error('Resend email verification failed:', error);
    next(new ApiError(500, 'Resend email verification failed:', error));
  }
};
// tested
const googleOAuthRedirect = async (req, res, next) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      return res
        .status(500)
        .json({ error: 'Missing Google OAuth env variables' });
    }
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth redirect failed: ', error);
    next(new ApiError(500, 'Google OAuth redirect failed: ', error));
  }
};
// tested
const googleOAuthCallback = async (req, res, next) => {
  const code = req.query.code;

  if (!code) {
    return next(new ApiError(400, 'No code found in callback'));
  }

  try {
    const tokenRes = await axios.post(
      `https://oauth2.googleapis.com/token`,
      null,
      {
        params: {
          code,
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const googleAccessToken = tokenRes.data.access_token;

    const userInfoRes = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      }
    );

    const userInfo = userInfoRes.data;

    let user = await db.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          image: userInfo.picture,
          isEmailVerified: true,
          provider: 'GOOGLE',
        },
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user.id
    );

    // res
    //   .cookie('accessToken', accessToken, cookieOptions)
    //   .cookie('refreshToken', refreshToken, cookieOptions)
    //   .status(200)
    //   .json(
    //     new ApiSuccess(200, 'User Logged in successfully', {
    //       email: user.email,
    //       name: user.name,
    //       role: user.role,
    //       id: user.id,
    //       provider: user.provider,
    //     })
    //   );

    res
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', refreshToken, cookieOptions);

    res.redirect('http://localhost:5173/auth/callback');
  } catch (error) {
    console.error('Google OAuth callback failed: ', error);
    res.redirect('http://localhost:5173/login?error=oauth_failed');
    next(new ApiError(500, 'Google OAuth callback failed: ', error));
  }
};
// tested
const githubOAuthRedirect = async (req, res, next) => {
  try {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_REDIRECT_URI) {
      return res
        .status(500)
        .json({ error: 'Missing Github OAuth env variables' });
    }
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user:email`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Github OAuth redirect failed: ', error);
    next(new ApiError(500, 'Github OAuth redirect failed: ', error));
  }
};
// tested
const githubOAuthCallback = async (req, res, next) => {
  const code = req.query.code;

  if (!code) {
    return next(new ApiError(400, 'No code found in callback'));
  }

  try {
    const tokenRes = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const githubAccessToken = tokenRes.data.access_token;

    const userInfo = await axios.get(`https://api.github.com/user`, {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
      },
    });

    const emailRes = await axios.get(`https://api.github.com/user/emails`, {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
      },
    });

    const emailObj = emailRes.data.find((e) => e.primary && e.verified);
    const email = emailObj?.email;

    if (!email) {
      return next(new ApiError(400, 'GitHub email not found or verified'));
    }

    let user = await db.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: email,
          name: userInfo.data.name || userInfo.data.login,
          image: userInfo.data.avatar_url,
          isEmailVerified: true,
          provider: 'GITHUB',
        },
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user.id
    );

    // res
    //   .cookie('accessToken', accessToken, cookieOptions)
    //   .cookie('refreshToken', refreshToken, cookieOptions)
    //   .status(200)
    //   .json(
    //     new ApiSuccess(200, 'User Logged in successfully', {
    //       email: user.email,
    //       name: user.name,
    //       role: user.role,
    //       id: user.id,
    //       provider: user.provider,
    //     })
    //   );

    res
      .cookie('accessToken', accessToken, cookieOptions)
      .cookie('refreshToken', refreshToken, cookieOptions);

    res.redirect('http://localhost:5173/auth/callback');
  } catch (error) {
    console.error('Github OAuth callback failed: ', error);
    res.redirect('http://localhost:5173/login?error=oauth_failed');
    next(new ApiError(500, 'Github OAuth callback failed: ', error));
  }
};
// tested
const forgotPasswordRequest = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (
      user.forgotPasswordExpiry &&
      user.forgotPasswordExpiry > new Date(Date.now())
    ) {
      return next(
        new ApiError(401, 'Email already sent. Please wait or check spam')
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours

    await db.user.update({
      where: {
        email: email,
      },
      data: {
        forgotPasswordToken: token,
        forgotPasswordExpiry: tokenExpiry,
      },
    });

    const resetPasswordUrl = `${process.env.BASE_URL}/api/v1/auth/resetPassword/${token}`;

    await sendMail({
      email: user.email,
      subject: 'Reset password',
      mailGenContent: forgotPasswordContent(user.name, resetPasswordUrl),
    });
    return res
      .status(200)
      .json(new ApiSuccess(200, 'Forgot password request initiated'));
  } catch (error) {
    console.error('Forgot password request failed:', error);
    next(new ApiError(500, 'Forgot password request failed:', error));
  }
};
// tested
const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  try {
    const user = await db.user.findFirst({
      where: {
        forgotPasswordToken: token,
      },
    });

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (user.forgotPasswordExpiry < new Date(Date.now())) {
      return next(new ApiError(401, 'Request again link expired'));
    }

    const isMatch = await bcrypt.compare(newPassword, user.password);

    if (isMatch) {
      return next(new ApiError(400, 'Your new password cannot be same as old'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        forgotPasswordToken: null,
        forgotPasswordExpiry: null,
      },
    });

    return res
      .status(200)
      .json(new ApiSuccess(200, 'reset password successful'));
  } catch (error) {
    console.error('reset password failed:', error);
    next(new ApiError(500, 'reset password failed:', error));
  }
};
// tested
const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await db.user.findUnique({
      where: {
        id: req.user.id,
      },
    });

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return next(new ApiError(400, 'Invalid credentials'));
    }

    if (oldPassword === newPassword) {
      return next(new ApiError(400, 'Your new password cannot be same as old'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return res
      .status(200)
      .json(new ApiSuccess(200, 'Password changed successfully'));
  } catch (error) {
    console.error('passowrd change failed:', error);
    next(new ApiError(500, 'passowrd change failed:', error));
  }
};
// tested
const updateProfile = async (req, res, next) => {
  const user = req.user;
  const { name } = req.body;
  try {
    await db.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
      },
    });

    return res
      .status(200)
      .json(new ApiSuccess(200, 'Profile updated successfully'));
  } catch (error) {
    console.error('Update profile failed:', error);
    next(new ApiError(500, 'Update profile failed:', error));
  }
};

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  checkUser,
  verifyUser,
  resendEmailVerification,
  forgotPasswordRequest,
  resetPassword,
  changePassword,
  googleOAuthRedirect,
  googleOAuthCallback,
  githubOAuthRedirect,
  githubOAuthCallback,
  updateProfile,
};
