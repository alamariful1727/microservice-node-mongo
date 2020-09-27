import { Request } from 'express';
import { IAccount } from '../models/account.model';

export interface ITokenPayload {
  _id: string;
  email: string;
}

export interface RequestCustom extends Request {
  payload?: IAccount;
}
