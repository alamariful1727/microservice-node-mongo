import * as Joi from '@hapi/joi';
import { emailRegex, contactNoRegex, passwordRegex, IDRegex } from '../utils/regex';

export const getOneJoiObjectSchema = (
  key: string,
  type: 'id' | 'string',
  required: boolean = true,
): Joi.ObjectSchema<any> => {
  let object: any = {};
  let rules: Joi.StringSchema = Joi.string().trim();

  if (type === 'id') {
    rules = rules.regex(IDRegex);
  }

  if (required) {
    object[key] = rules.required();
  }

  return Joi.object().keys(object);
};

// joi schema
const schema = {
  email: Joi.string().trim().lowercase().regex(emailRegex),
  password: Joi.string().trim().regex(passwordRegex).min(8),
  confirmPassword: Joi.string().trim().valid(Joi.ref('password')),
  name: Joi.string().trim().min(2).max(32),
  contactNo: Joi.string().trim().regex(contactNoRegex),
  type: Joi.string().trim().valid(['admin', 'user']),
  address: Joi.string().trim().min(2).max(350),
  location: Joi.string().trim(),
};

export const changePasswordValidation = Joi.object().keys({
  body: Joi.object().keys({
    oldPassword: schema.password.required(),
    newPassword: schema.password
      .invalid(Joi.ref('oldPassword'))
      .required()
      .error(() => 'New password should not match with old password'),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .error(() => 'Confirm password should match with new password'),
  }),
});

export const resetPasswordValidation = Joi.object().keys({
  params: getOneJoiObjectSchema('token', 'string'),
  body: Joi.object().keys({
    newPassword: schema.password.required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .error(() => 'Confirm password should match with new password'),
  }),
});

export const forgotPasswordValidation = Joi.object().keys({
  body: Joi.object().keys({
    email: schema.email.required(),
  }),
});

export const uniqueAccountEmailCheckValidation = Joi.object().keys({
  body: Joi.object().keys({
    email: schema.email.required(),
  }),
});

export const signupValidation = Joi.object().keys({
  body: Joi.object().keys({
    name: schema.name.required(),
    email: schema.email.required(),
    password: schema.password.required(),
    confirmPassword: schema.confirmPassword.required().error(() => 'Confirm password should match with password'),
    contactNo: schema.contactNo.required(),
  }),
});

export const signinValidation = Joi.object().keys({
  body: Joi.object().keys({
    email: schema.email.required(),
    password: schema.password.required(),
  }),
});

export const AccountVerificationValidation = Joi.object().keys({
  params: getOneJoiObjectSchema('token', 'string'),
});

export const getAccountValidation = Joi.object().keys({
  params: getOneJoiObjectSchema('accountId', 'id'),
});

export const updateAccountBasicInfoValidation = Joi.object().keys({
  body: Joi.object().keys({
    name: schema.name.required(),
    contactNo: schema.contactNo.required(),
    address: schema.address.required(),
  }),
});

export const deleteAccountValidation = Joi.object().keys({
  params: getOneJoiObjectSchema('accountId', 'id'),
});

export const searchAccountValidation = Joi.object().keys({
  query: getOneJoiObjectSchema('key', 'string'),
});
