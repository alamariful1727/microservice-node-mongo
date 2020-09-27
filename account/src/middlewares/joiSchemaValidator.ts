import { Response, NextFunction, Request } from 'express';
import Joi from '@hapi/joi';
import * as HttpStatus from 'http-status-codes';

export const joiSchemaValidator = (_schema: Joi.ObjectSchema<any>, useJoiError: boolean = true) => {
  // Joi validation options
  const _validationOptions = {
    abortEarly: false, // abort after the last validation error
    allowUnknown: true, // allow unknown keys that will be ignored
    stripUnknown: true, // remove unknown keys from the validated data
  };

  // return the validation middleware
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = _schema.validate(req, _validationOptions);

    if (error) {
      const JoiError = {
        type: 'JoiValidationError',
        status: 400,
        errors: error.details.map((e: any) => {
          return {
            message: `${e.message.replace(/['"]/g, '')}`,
            fieldName: e.path[1],
            path: e.path[0],
          };
        }),
      };
      const customError = {
        error: 'Invalid request data. Please review your request and try again.',
      };
      return res.status(HttpStatus.BAD_REQUEST).json(useJoiError ? JoiError : customError);
    }

    req.body = value.body;
    req.query = value.query;
    req.params = value.params;

    next();
    return null;
  };
};
