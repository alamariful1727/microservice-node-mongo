import { Request, Response, NextFunction } from 'express';
import * as HttpStatus from 'http-status-codes';

export const mongoErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.errmsg;

  if (error.name === 'MongoError' && (err.code === 11000 || err.code === 11001)) {
    const pathRegex = err.message.split('index: ')[1].split('dup key')[0].split('_')[0];
    const keyRegex = err.message.match(/key:\s+{\s+:\s\"(.*)(?=\")/);
    const value = keyRegex ? keyRegex[1] : '';
    const output = {
      message: `${pathRegex} already exists`,
      fieldName: pathRegex,
      value,
    };
    return res.status(HttpStatus.CONFLICT).json(output);
  }

  // Mongoose bad objectID
  if (error.name === 'CastError') {
    const message = `Resource not found with ID of ${error.value}`;
    return res.status(HttpStatus.NOT_FOUND).json({
      message,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message);
    return res.status(HttpStatus.BAD_REQUEST).json({
      message,
    });
  }
  next(err);
};
