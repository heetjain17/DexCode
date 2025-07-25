import { validationResult } from 'express-validator';
// import { ApiError } from '../utils/apiError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  
  return next();
};

  // const arr = errors.array().map((err) => ({
  //     message: err.msg,
  // }))
  // console.log(arr);

  // return next(new ApiError({
  //     statusCode: 400,
  //     message: "Validation failed",
  //     errors: errors.array().map((err) => ({ message: err.msg }))
  // }))