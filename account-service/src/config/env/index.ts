import * as Joi from '@hapi/joi';
import * as dotenv from 'dotenv';
dotenv.config();

interface IConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGO_HOST: string;
  BCRYPT_SALT_ROUNDS: number;
  EMAIL: string;
  EMAIL_PASSWORD: string;
  EMAIL_TOKEN_SECRET: string;
  EMAIL_TOKEN_EXPIRE: string;
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRE: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRE: string;
  FORGET_PASSWORD_TOKEN_SECRET: string;
  FORGET_PASSWORD_TOKEN_EXPIRE: string;
  CLIENT_URL: string;
  COOKIE_MAX_AGE: number;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_BUCKET_REGION: string;
  AWS_BUCKET_NAME: string;
}

let config: IConfig = {
  NODE_ENV: 'development',
  PORT: 3001,
  MONGO_HOST: '',
  BCRYPT_SALT_ROUNDS: 10,
  EMAIL: '',
  EMAIL_PASSWORD: '',
  EMAIL_TOKEN_SECRET: '',
  EMAIL_TOKEN_EXPIRE: '',
  ACCESS_TOKEN_SECRET: '',
  ACCESS_TOKEN_EXPIRE: '',
  REFRESH_TOKEN_SECRET: '',
  REFRESH_TOKEN_EXPIRE: '',
  FORGET_PASSWORD_TOKEN_SECRET: '',
  FORGET_PASSWORD_TOKEN_EXPIRE: '',
  CLIENT_URL: '',
  COOKIE_MAX_AGE: 0,
  AWS_ACCESS_KEY: '',
  AWS_SECRET_KEY: '',
  AWS_BUCKET_REGION: '',
  AWS_BUCKET_NAME: '',
};

// Joi validation options
const _validationOptions = {
  abortEarly: false, // abort after the last validation error
  allowUnknown: true, // allow unknown keys that will be ignored
  stripUnknown: true, // remove unknown keys from the validated data
};

let path: string = '';

switch (process.env.NODE_ENV) {
  case 'production':
    path = `${__dirname}/../../../.env.production`;
    break;
  case 'development':
    path = `${__dirname}/../../../.env.development`;
    break;
  case 'test':
    path = `${__dirname}/../../../.env.test`;
    break;
  default:
    console.error({
      message: 'Please fill up your .env',
      name: 'ValidationError',
      details: [
        {
          message: '"NODE_ENV" must be one of [development, production, test]',
          type: 'any.allowOnly',
        },
      ],
    });
    process.exit(1);
}

config = { ...config, NODE_ENV: process.env.NODE_ENV };

dotenv.config({ path: path });

// define validation for all the env vars
const envSchema = Joi.object().keys({
  NODE_ENV: Joi.string().valid(['development', 'production', 'test']).required(),
  PORT: Joi.number().valid([4040, 4044, 4048]).required(),
  MONGO_HOST: Joi.string().required(),
  BCRYPT_SALT_ROUNDS: Joi.number().required(),
  EMAIL: Joi.string().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  EMAIL_TOKEN_SECRET: Joi.string().required(),
  EMAIL_TOKEN_EXPIRE: Joi.string().required(),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRE: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRE: Joi.string().required(),
  FORGET_PASSWORD_TOKEN_SECRET: Joi.string().required(),
  FORGET_PASSWORD_TOKEN_EXPIRE: Joi.string().required(),
  CLIENT_URL: Joi.string().required(),
  COOKIE_MAX_AGE: Joi.number().required(),
  AWS_ACCESS_KEY: Joi.string().required(),
  AWS_SECRET_KEY: Joi.string().required(),
  AWS_BUCKET_REGION: Joi.string().required(),
  AWS_BUCKET_NAME: Joi.string().required(),
});

const { error, value } = envSchema.validate(process.env, _validationOptions);

if (error as Joi.ValidationError) {
  console.error({
    message: `Please fill up your .env.${config.NODE_ENV}`,
    name: error?.name,
    details: error?.details,
  });
  process.exit(1);
} else {
  config = {
    ...config,
    PORT: parseInt(value.PORT),
    MONGO_HOST: value.MONGO_HOST,
    BCRYPT_SALT_ROUNDS: parseInt(value.BCRYPT_SALT_ROUNDS),
    EMAIL: value.EMAIL,
    EMAIL_PASSWORD: value.EMAIL_PASSWORD,
    EMAIL_TOKEN_SECRET: value.EMAIL_TOKEN_SECRET,
    EMAIL_TOKEN_EXPIRE: value.EMAIL_TOKEN_EXPIRE,
    ACCESS_TOKEN_SECRET: value.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRE: value.ACCESS_TOKEN_EXPIRE,
    REFRESH_TOKEN_SECRET: value.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRE: value.REFRESH_TOKEN_EXPIRE,
    FORGET_PASSWORD_TOKEN_SECRET: value.FORGET_PASSWORD_TOKEN_SECRET,
    FORGET_PASSWORD_TOKEN_EXPIRE: value.FORGET_PASSWORD_TOKEN_EXPIRE,
    CLIENT_URL: value.CLIENT_URL,
    COOKIE_MAX_AGE: parseInt(value.COOKIE_MAX_AGE),
    AWS_ACCESS_KEY: value.AWS_ACCESS_KEY,
    AWS_SECRET_KEY: value.AWS_SECRET_KEY,
    AWS_BUCKET_REGION: value.AWS_BUCKET_REGION,
    AWS_BUCKET_NAME: value.AWS_BUCKET_NAME,
  };
}

export = config;
