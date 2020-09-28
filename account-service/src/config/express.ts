import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import * as HttpStatus from 'http-status-codes';
import helmet from 'helmet';
import { rootRoute } from './index.route';
import config from './env/index';
import { MongoDB } from './db';
import { mongoErrorHandler } from '../middlewares/mongooseErrorFormat';
import passport from 'passport';
import { sendErrorResponse } from '../utils/responseFormat';

class App {
  public _express: Application;
  public _mongo: MongoDB;

  constructor() {
    this._express = express();
    // connect mongoDB
    this._mongo = new MongoDB();
    this.middleware();
    this.routes();
    this.errorHandlers();
  }

  // Configure Express middleware.
  private middleware(): void {
    // enable CORS - Cross Origin Resource Sharing
    this._express.use(cors());
    this._express.use(helmet());
    // TODO study about this options of helmet
    this._express.use(helmet.xssFilter());
    this._express.use(helmet.frameguard());
    this._express.use(helmet.noSniff());
    this._express.use(morgan(config.NODE_ENV == 'production' ? 'prod' : 'dev'));
    this._express.use(bodyParser.json());
    this._express.use(bodyParser.urlencoded({ extended: true }));
    this._express.use(cookieParser());
    this._express.use(passport.initialize());
    this._express.use(passport.session());
    this._express.use(compression());
  }

  private routes(): void {
    // home route
    this._express.get('/', (req: Request, res: Response, next: NextFunction) => {
      res.status(HttpStatus.OK).send('Ayojon server works!!');
    });

    // application routes
    this._express.use('/api/v1', rootRoute);

    // API not found
    this._express.use((req: Request, res: Response, next: NextFunction) => {
      return sendErrorResponse(res, HttpStatus.NOT_FOUND, {
        message: 'API not found',
      });
    });
  }

  private errorHandlers(): void {
    // jwt error handler
    this._express.use((err: any, req: Request, res: Response, next: NextFunction) => {
      if (err.name === 'JsonWebTokenError') {
        return sendErrorResponse(
          res,
          HttpStatus.BAD_REQUEST,
          {
            message: err.message,
          },
          'JsonWebTokenError',
        );
      }
      if (err.name === 'TokenExpiredError') {
        return sendErrorResponse(
          res,
          HttpStatus.BAD_REQUEST,
          {
            message: err.message,
          },
          'TokenExpiredError',
        );
      }
      next(err);
    });

    // Mongo Error Handler
    this._express.use(mongoErrorHandler);

    // handle undefined routes
    this._express.use((err: any, req: Request, res: Response, next: NextFunction) => {
      const stack = config.NODE_ENV === 'development' ? err.stack.split('\n') : {};
      let frame = err.stack;
      let lineNumber = frame.split(':')[1];

      res.status(err.status || err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:
          err.message ||
          HttpStatus.getStatusText(err.status) ||
          HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR),
        stack,
        lineNumber,
        frame,
      });
    });
  }
}

export default new App()._express;
