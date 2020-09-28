import passport from 'passport';
import { Strategy, IStrategyOptionsWithRequest } from 'passport-local';
import { Request } from 'express';
import { IAccount, AccountModel } from '../models/account.model';

// Setup options of local strategy
const localOptions: IStrategyOptionsWithRequest = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
};

// passport local strategy
passport.use(
  new Strategy(localOptions, async (req: Request, email: IAccount['email'], password: IAccount['password'], done) => {
    try {
      let user = await AccountModel.findOne({ email })
        .select('-__v')
        .populate([
          {
            path: 'services',
            select: 'name logo type isVerified',
          },
        ]);
      if (!user) {
        return done(null, false, {
          message: 'email',
        });
      }

      let isMatch = await user.verifyPassword(password);
      if (!isMatch) {
        return done(null, false, {
          message: 'password',
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});
