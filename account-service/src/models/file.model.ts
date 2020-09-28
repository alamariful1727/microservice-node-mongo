import { Document, Schema, Model, model } from 'mongoose';
import { IAccount } from './account.model';

export interface IFileBase {
  url: string;
  title?: string;
  description?: string;
  galleryPosition?: number;
  s3Key: string;
  mimetype: string;
  type: 'account-avatar' | 'service-logo' | 'service-images';
  account: IAccount['_id'];
  isRemoved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema: Schema = new Schema(
  {
    url: {
      type: String,
      trim: true,
      required: true,
    },
    title: {
      type: String,
      maxlength: 100,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      maxlength: 500,
      trim: true,
      default: '',
    },
    galleryPosition: {
      type: Number,
      min: 1,
      max: 5,
    },
    s3Key: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
      enum: [
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/x-zip-compressed',
        'application/pdf',
        'application/msword',
        'application/json',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain',
        'text/csv',
        'image/webp',
        'image/apng',
        'image/png',
        'image/gif',
        'image/jpeg',
        'image/jpg',
        'image/svg',
        'image/svg+xml',
        'image/bmp',
        'image/vnd.microsoft.icon',
      ],
    },
    type: {
      type: String,
      enum: ['account-avatar', 'service-logo', 'service-images'],
      required: true,
    },
    account: {
      ref: 'Account',
      type: Schema.Types.ObjectId,
      required: true,
    },
    service: {
      ref: 'Service',
      type: Schema.Types.ObjectId,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

interface IFileSchema extends IFileBase, Document { }

// write methods here

export interface IFile extends IFileSchema {
  _doc: IFileSchema;
}

export interface IFilePopulated extends Omit<IFile, 'account'> {
  account: IAccount;
}

export const FileModel: Model<IFile> = model<IFile>('File', FileSchema);
