import { body } from 'express-validator';

const registerUserValidator = () => {
  return [
    body('email')
      .normalizeEmail()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .isLength({ max: 255 })
      .withMessage('Email must be less than 255 characters'),
    body('name')
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters')
      .isLength({ max: 30 })
      .withMessage('Username must be less than 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        'Username can only contain letters, numbers, and underscores'
      ),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .isLength({ max: 128 })
      .withMessage('Password must be less than 128 characters')
      .matches(/[a-z]/)
      .withMessage('Password must contain atleast one lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain atleast one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain atleast one number')
      .matches(/[^a-zA-Z0-9]/)
      .withMessage('Password must contain atleast one special character'),
  ];
};

const updateProfileValidator = () => {
  return [
    body('name')
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters')
      .isLength({ max: 30 })
      .withMessage('Username must be less than 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        'Username can only contain letters, numbers, and underscores'
      ),
  ];
};

const forgotPasswordValidator = () => {
  return [
    body('newPassword')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .isLength({ max: 128 })
      .withMessage('Password must be less than 128 characters')
      .matches(/[a-z]/)
      .withMessage('Password must contain atleast one lowercase letter')
      .matches(/[A-Z]/)
      .withMessage('Password must contain atleast one uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain atleast one number')
      .matches(/[^a-zA-Z0-9]/)
      .withMessage('Password must contain atleast one special character'),
  ];
};

export {
  registerUserValidator,
  forgotPasswordValidator,
  updateProfileValidator,
};
