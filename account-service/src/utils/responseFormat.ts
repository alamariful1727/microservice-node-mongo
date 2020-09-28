import { Response } from 'express';

type JoiError = 'JoiValidationError';

type JwtError = 'JsonWebTokenError' | 'TokenExpiredError';

type MongoError = 'MongoError' | 'CastError' | 'ValidationError';

type CustomError = 'CustomError' | 'AuthError';

type ErrorType = JoiError | JwtError | MongoError | CustomError;

type PathType = 'header' | 'body' | 'params' | 'query';

interface ErrorContent {
  message: string;
  fieldName?: string;
  value?: string;
  path?: PathType;
}

export const sendErrorResponse = (
  res: Response,
  status: number,
  content: ErrorContent,
  type: ErrorType = 'CustomError',
) => {
  let errorResponse = {
    status,
    type: type,
    errors: [content],
  };

  return res.status(status).json(errorResponse);
};
