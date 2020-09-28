import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import * as HttpStatus from 'http-status-codes';
import { verify } from 'jsonwebtoken';
import config from '../config/env';
import { RequestCustom, ITokenPayload } from '../utils/types';
import { sendErrorResponse } from '../utils/responseFormat';
import { IAccount, AccountModel } from '../models/account.model';

export let passportAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, function (
    error,
    user: IAccount | undefined | false,
    info:
      | {
          message: 'password' | 'email';
        }
      | undefined,
  ) {
    if (error) {
      next(error);
    }

    if (!user && info?.message) {
      return sendErrorResponse(res, HttpStatus.UNAUTHORIZED, {
        message: info?.message === 'password' ? 'Incorrect password' : 'No email found',
        fieldName: info?.message,
      });
    }
    // TODO it will need later.
    // if (!user.isVerified) {
    //   return res.status(HttpStatus.UNAUTHORIZED).json({
    //     message: 'Your account is not verified yet',
    //   });
    // }

    req.user = user;
    next();
  })(req, res, next);
};

export const isAuth = async (req: RequestCustom, res: Response, next: NextFunction) => {
  const authorization = req.headers['authorization'];

  if (!authorization) {
    return sendErrorResponse(
      res,
      HttpStatus.BAD_REQUEST,
      {
        message: 'Bearer token required in header',
      },
      'AuthError',
    );
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, config.ACCESS_TOKEN_SECRET) as ITokenPayload;

    const user = await AccountModel.findById(payload._id);

    if (!user) {
      return sendErrorResponse(
        res,
        HttpStatus.FORBIDDEN,
        {
          message: 'Invalid access token with Wrong account credentials',
        },
        'AuthError',
      );
    }

    req.payload = user;
    next();
  } catch (err) {
    return sendErrorResponse(
      res,
      HttpStatus.FORBIDDEN,
      {
        message: 'Invalid access token',
      },
      'AuthError',
    );
  }
};

// TODO: Check service owner middleware
