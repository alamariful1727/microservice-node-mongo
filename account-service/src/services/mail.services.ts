import nodemailer from 'nodemailer';
import config from '../config/env';
import { IAccount } from '../models/account.model';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL,
    pass: config.EMAIL_PASSWORD,
  },
});

export const sendAccountConfirmationMail = (user: IAccount, token: string) => {
  const link = `${config.CLIENT_URL}/confirmation/${token}`;
  const mailOptions = {
    to: user.email,
    subject: 'Ayojon - Confirmation Mail',
    html: `
      <h1> Hi ${user.name}, </h1>
      <h2> Please Click on the link to verify your email <a href="${link}"> click here to verify </a> </h2>
    `,
  };

  transporter.sendMail(mailOptions, function (error, res) {
    if (error) {
      console.log(`Failed to send confirmation mail to ${user.email}.`, error);
    } else {
      console.log(`Successfully send confirmation mail to ${user.email}.`);
    }
  });
};

export const sendForgetPasswordMail = (user: IAccount, token: string) => {
  const link = `${config.CLIENT_URL}/reset-password/${token}`;
  const mailOptions = {
    to: user.email,
    subject: 'Ayojon - Forget Password Mail',
    html: `
      <h1> Hi ${user.name}, </h1>
      <h2> Please Click on the link to reset your password <a href="${link}"> reset password </a> </h2>
    `,
  };

  transporter.sendMail(mailOptions, function (error, res) {
    if (error) {
      console.log(`Failed to send forget password mail to ${user.email}.`, error);
    } else {
      console.log(`Successfully send forget password mail to ${user.email}.`);
    }
  });
};