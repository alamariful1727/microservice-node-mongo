import { IAccount } from '../models/account.model';

export interface IAccountEmailCheck {
  email: IAccount['email'];
}

export interface IAccountSignup {
  name: IAccount['name'];
  email: IAccount['email'];
  password: IAccount['password'];
  confirmPassword: IAccount['password'];
  contactNo: IAccount['contactNo'];
}

export interface IAccountChangePassword {
  oldPassword: IAccount['password'];
  newPassword: IAccount['password'];
  confirmPassword: IAccount['password'];
}

export interface IAccountResetPassword {
  newPassword: IAccount['password'];
  confirmPassword: IAccount['password'];
}

export interface IAccountBasicInfoUpdate {
  name: IAccount['name'];
  address: IAccount['address'];
  contactNo: IAccount['contactNo'];
}
