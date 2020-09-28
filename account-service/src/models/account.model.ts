import { Document, Schema, Model, model, HookNextFunction } from 'mongoose';
import { hash, compare } from 'bcrypt';
import config from '../config/env';

interface IAccountBase {
  email: string;
  password: string;
  name: string;
  contactNo: string;
  type: 'admin' | 'user';
  avatar?: string;
  isVerified: boolean;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema: Schema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 32,
      required: true,
    },
    contactNo: {
      type: String,
      trim: true,
      required: true,
    },
    type: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true,
    },
    address: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 350,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      trim: true,
    },
    // services: [
    //   {
    //     ref: 'Service',
    //     type: Schema.Types.ObjectId,
    //   },
    // ],
    // bookings: [
    //   {
    //     ref: 'Booking',
    //     type: Schema.Types.ObjectId,
    //   },
    // ],
  },
  {
    timestamps: true,
  },
);

interface IAccountSchema extends IAccountBase, Document {}

// write methods here

accountSchema.pre<IAccountSchema>('save', async function (next: HookNextFunction) {
  let account = this;

  // only hash the password if it has been modified (or is new)
  if (account.isModified('password')) {
    account.password = await hash(account.password, config.BCRYPT_SALT_ROUNDS);
  }

  next();
});

accountSchema.methods.verifyPassword = async function (password: IAccountSchema['password']) {
  return await compare(password, this.password);
};

export interface IAccount extends IAccountSchema {
  _doc: IAccountSchema;
  verifyPassword(password: string): boolean;
}
// Omit = removing property from interface
// export interface IAccountPopulated extends Omit<IAccount, 'services' | 'bookings'> {
//   services?: IService[];
//   bookings: IBooking[];
// }

export const AccountModel: Model<IAccount> = model<IAccount>('Account', accountSchema);
