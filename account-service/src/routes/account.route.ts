import express, { Router } from 'express';
import { joiSchemaValidator } from '../middlewares/joiSchemaValidator';
import {
  signupValidation,
  signinValidation,
  uniqueAccountEmailCheckValidation,
  AccountVerificationValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateAccountBasicInfoValidation,
} from '../validations/validation';
import {
  signup,
  signin,
  getAccount,
  getAllAccounts,
  uniqueAccountEmailCheck,
  AccountVerification,
  refreshToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  avatarUpload,
  updateAccountBasicInfo,
} from '../controllers/account.controller';
import '../services/passport.services';

import { passportAuth, isAuth } from '../middlewares/auth';
import { uploadFile } from '../services/file.services';

const router: Router = express.Router();

router.route('/').get(isAuth, getAccount);

router.route('/unique-email').post(joiSchemaValidator(uniqueAccountEmailCheckValidation), uniqueAccountEmailCheck);

router.route('/refresh-token').post(refreshToken);

router.route('/signup').post(joiSchemaValidator(signupValidation), signup);

router.route('/signin').post(joiSchemaValidator(signinValidation), passportAuth, signin);

router.route('/avatar').put(isAuth, uploadFile.single('file'), avatarUpload);

router.route('/basic-info').put(isAuth, joiSchemaValidator(updateAccountBasicInfoValidation), updateAccountBasicInfo);

router.route('/logout').post(logout);

router.route('/change-password').post(isAuth, joiSchemaValidator(changePasswordValidation), changePassword);

router.route('/forget-password').post(joiSchemaValidator(forgotPasswordValidation), forgotPassword);

router.route('/reset-password/:token').post(joiSchemaValidator(resetPasswordValidation), resetPassword);

router.route('/all').get(isAuth, getAllAccounts);

router.route('/confirmation/:token').get(joiSchemaValidator(AccountVerificationValidation), AccountVerification);

export const accountRoutes = router;
