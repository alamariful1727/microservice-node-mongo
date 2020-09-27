import { sign } from 'jsonwebtoken';
import config from '../config/env';
import { Response } from 'express';
import { ITokenPayload } from './types';
import * as Crypto from 'crypto';
import { IAccount } from '../models/account.model';

export const createEmailConfirmationToken = (user: IAccount) => {
  let payload: ITokenPayload = { _id: user._id, email: user.email };
  return sign(payload, config.EMAIL_TOKEN_SECRET, {
    expiresIn: config.EMAIL_TOKEN_EXPIRE,
  });
};

export const createForgetPasswordToken = (user: IAccount) => {
  let payload: ITokenPayload = { _id: user._id, email: user.email };
  return sign(payload, config.FORGET_PASSWORD_TOKEN_SECRET, {
    expiresIn: config.FORGET_PASSWORD_TOKEN_EXPIRE,
  });
};

export const createAccessToken = (user: IAccount) => {
  let payload: ITokenPayload = { _id: user._id, email: user.email };
  return sign(payload, config.ACCESS_TOKEN_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRE,
  });
};

export const createRefreshToken = (user: IAccount) => {
  let payload: ITokenPayload = { _id: user._id, email: user.email };
  return sign(payload, config.REFRESH_TOKEN_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRE,
  });
};

export const sendRefreshToken = (res: Response, token: string) => {
  res.cookie('aid', token, {
    maxAge: config.COOKIE_MAX_AGE,
    httpOnly: true,
    path: '/api/v1/accounts/refresh-token',
  });
};

export const createRandomCode = (size: number) => {
  return Crypto.randomBytes(size).toString('hex').slice(0, size);
};
