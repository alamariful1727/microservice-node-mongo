import { Request, Response, NextFunction } from 'express';
import slug from 'slug';
import { verify } from 'jsonwebtoken';
import * as HttpStatus from 'http-status-codes';
import { AccountModel, IAccount } from '../models/account.model';
import config from '../config/env';
import {
  IAccountSignup,
  IAccountEmailCheck,
  IAccountChangePassword,
  IAccountResetPassword,
  IAccountBasicInfoUpdate,
} from '../types/account.dto';
import { sendAccountConfirmationMail, sendForgetPasswordMail } from '../services/mail.services';
import {
  createAccessToken,
  sendRefreshToken,
  createRefreshToken,
  createEmailConfirmationToken,
  createForgetPasswordToken,
} from '../utils/token';
import { RequestCustom, ITokenPayload } from '../utils/types';
import { sendErrorResponse } from '../utils/responseFormat';
import { checkMimetype, s3, sizeLimit } from '../services/file.services';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { extname } from 'path';
import { FileModel } from '../models/file.model';

export const getUniqueName = async (firstName: string, lastName: string) => {
  const count = await AccountModel.countDocuments({
    firstName,
    lastName,
  }).exec();

  let _firstName = slug(firstName, {
    replacement: '-',
    symbols: true,
    remove: /[.]/g,
    lower: false,
    charmap: slug.charmap,
    multicharmap: slug.multicharmap,
  });

  let _lastName = slug(lastName, {
    replacement: '-',
    symbols: true,
    remove: /[.]/g,
    lower: false,
    charmap: slug.charmap,
    multicharmap: slug.multicharmap,
  });

  return _firstName + '-' + _lastName + '-' + (count + 1);
};

export const uniqueAccountEmailCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data: IAccountEmailCheck = req.body;
    const count = await AccountModel.countDocuments({ email: data.email }).exec();
    if (count) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'email already exists',
        fieldName: 'email',
        value: data.email,
      });
    }
    return res.status(HttpStatus.OK).json({
      message: 'unique email',
      fieldName: 'email',
      value: data.email,
    });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let data: IAccountSignup = req.body;

    let newAccount: IAccount = new AccountModel({
      name: data.name,
      email: data.email,
      password: data.password,
      contactNo: data.contactNo,
    });

    let account = await newAccount.save();

    // remove password and __v from account object
    let formattedAccount = { ...account._doc };
    delete formattedAccount.password;
    delete formattedAccount.__v;

    // send confirmation mail
    sendAccountConfirmationMail(account, createEmailConfirmationToken(account));

    // send refresh and access token
    let refreshToken = createRefreshToken(account);
    let accessToken = createAccessToken(account);

    return res.status(HttpStatus.CREATED).json({
      account: formattedAccount,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const AccountVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.params.token;
    let payload = verify(token, config.EMAIL_TOKEN_SECRET) as ITokenPayload;

    // let account = await AccountModel.findByIdAndUpdate(payload.accountId, { isVerified: true });
    let account = await AccountModel.findById(payload._id).select('-__v -password');

    if (!account) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'No user found.',
      });
    }

    if (account.isVerified) {
      return res.status(HttpStatus.CONFLICT).json({
        message: 'Account is already verified.',
      });
    }

    account.isVerified = true;
    await account.save();

    return res.status(HttpStatus.OK).json({
      message: 'Account verification successful.',
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req: Request, res: Response) => {
  let account = req.user as IAccount;
  let formattedAccount = { ...account._doc };
  delete formattedAccount.password;

  let refreshToken = createRefreshToken(account);
  let accessToken = createAccessToken(account);

  return res.status(HttpStatus.OK).json({
    account: formattedAccount,
    accessToken,
    refreshToken,
  });
};

export const refreshToken = async (req: RequestCustom, res: Response, next: NextFunction) => {
  let payload: ITokenPayload;

  // const refreshToken = req.cookies.aid;
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return sendErrorResponse(
      res,
      HttpStatus.BAD_REQUEST,
      {
        message: 'Refresh token required',
      },
      'AuthError',
    );
  }

  // check refresh token
  try {
    payload = verify(refreshToken, config.REFRESH_TOKEN_SECRET) as ITokenPayload;
  } catch (err) {
    return sendErrorResponse(
      res,
      HttpStatus.FORBIDDEN,
      {
        message: 'Invalid refresh token',
      },
      'AuthError',
    );
  }

  // refresh token is valid and we can send back an access token
  try {
    const account = await AccountModel.findById(payload._id).select('-__v -password');

    if (!account) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'No user found.',
      });
    }
    // if (account.tokenVersion !== payload.tokenVersion) {
    //   return res.send({ ok: false, accessToken: "" });
    // }

    let refreshToken = createRefreshToken(account);
    let accessToken = createAccessToken(account);

    return res.status(HttpStatus.OK).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const getAccount = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    let account = await AccountModel.findById(req.payload!._id).select('-__v -password -services');
    // .populate([
    //   {
    //     path: 'services',
    //     select: 'name logo type isVerified',
    //   },
    // ]);

    if (!account) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'No user found.',
      });
    }

    return res.status(HttpStatus.OK).json({
      account,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let accounts = await AccountModel.find().select('-__v');
    if (!accounts) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'No users found.',
      });
    }

    return res.status(HttpStatus.OK).json({
      accounts,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    let data: IAccountChangePassword = req.body;
    let account = await AccountModel.findById(req.payload!._id);

    if (!account) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'No user found.',
      });
    }

    let isMatch = await account.verifyPassword(data.oldPassword);
    if (!isMatch) {
      return sendErrorResponse(res, HttpStatus.BAD_REQUEST, {
        message: 'Incorrect password',
        fieldName: 'oldPassword',
      });
    }

    account.password = data.newPassword;
    await account.save();

    return res.status(HttpStatus.OK).json({
      message: 'Password has changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    let data: { email: IAccount['email'] } = req.body;
    let account = await AccountModel.findOne(data);

    if (!account) {
      return sendErrorResponse(res, HttpStatus.NOT_FOUND, {
        message: 'Sorry, this email is not associated with us.',
        fieldName: 'email',
      });
    }

    sendForgetPasswordMail(account, createForgetPasswordToken(account));

    return res.status(HttpStatus.OK).json({
      message: 'Please check your mail to reset password.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    let data: IAccountResetPassword = req.body;
    let token = req.params.token;
    let payload = verify(token, config.FORGET_PASSWORD_TOKEN_SECRET) as ITokenPayload;

    let account = await AccountModel.findById(payload._id);

    if (!account) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'No user found.',
      });
    }

    account.password = data.newPassword;
    await account.save();

    return res.status(HttpStatus.OK).json({
      message: 'Password has reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: RequestCustom, res: Response, next: NextFunction) => {
  sendRefreshToken(res, '');

  return res.status(HttpStatus.OK).json({
    message: 'User logout successfully',
  });
};

export const avatarUpload = async (req: RequestCustom, res: Response, next: NextFunction) => {
  const file = req.file;

  if (!file) {
    return sendErrorResponse(res, 400, {
      message: 'Image is required in FormData',
    });
  } else if (!checkMimetype.includes(file.mimetype)) {
    return sendErrorResponse(res, 400, {
      message: 'This image format is not supported',
      fieldName: 'file',
    });
  } else if (file.size / 1024 / 1024 > sizeLimit['account-avatar']) {
    return sendErrorResponse(res, 400, {
      message: `Image should be less then ${sizeLimit['account-avatar']} MB`,
      fieldName: 'file',
    });
  }

  const params = {
    Bucket: config.AWS_BUCKET_NAME,
    Key: `avatar/${req.payload!._id}/${Date.now()}${extname(file.originalname)}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  try {
    let data: ManagedUpload.SendData = await s3.upload(params).promise();
    const newFile = new FileModel({
      url: data.Location,
      s3Key: data.Key,
      mimetype: file.mimetype,
      type: 'account-avatar',
      account: req.payload!._id,
    });
    await newFile.save();
    let account = await AccountModel.findByIdAndUpdate(
      req.payload!._id,
      { avatar: data.Location },
      { new: true },
    ).select('-__v -password');

    if (!account) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'No user found.',
      });
    }

    return res.status(HttpStatus.OK).json({
      avatar: account.avatar,
    });
  } catch (error) {
    return res.status(HttpStatus.OK).json({
      error,
    });
  }
};

export const updateAccountBasicInfo = async (req: RequestCustom, res: Response, next: NextFunction) => {
  try {
    let data: IAccountBasicInfoUpdate = req.body;
    let account = await AccountModel.findByIdAndUpdate(req.payload!._id, data, { new: true }).select('-__v -password');

    if (!account) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'No user found.',
      });
    }

    return res.status(HttpStatus.OK).json({
      message: 'Basic information updated.',
    });
  } catch (error) {
    next(error);
  }
};
