import { S3 } from 'aws-sdk';
import multer from 'multer';
import { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_BUCKET_REGION } from './../config/env';

export const checkMimetype = ['image/png', 'image/gif', 'image/jpeg', 'image/jpg'];
export const sizeLimit = {
  'account-avatar': 1,
  'service-logo': 1,
  'service-images': 1,
};

export const s3 = new S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_BUCKET_REGION,
});

export const uploadFile = multer({
  storage: multer.memoryStorage(),
});
