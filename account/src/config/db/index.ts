import mongoose from 'mongoose';
import config from './../env';

// make bluebird default Promise
Promise = require('bluebird');

interface IConnectOptions {
  useNewUrlParser: boolean;
  useCreateIndex: boolean;
  useFindAndModify: boolean;
  useUnifiedTopology: boolean;
}

export class MongoDB {
  public _connectOptions: IConnectOptions;
  public _mongoose: any = mongoose;

  constructor(
    options: IConnectOptions = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    },
  ) {
    this._connectOptions = options;

    // plugin bluebird promise in mongoose
    this._mongoose.Promise = Promise;

    // connect to mongo db
    this.connect();
  }

  private connect(): void {
    const mongoUri = config.MONGO_HOST;

    this._mongoose
      .connect(mongoUri, this._connectOptions)
      .then(() => {
        const mongoHost = mongoUri.search('localhost:27017') === -1 ? 'ATLAS' : 'Local';
        return console.log(`Successfully connected to MongoDB [${mongoUri}]`);
      })
      .catch((error: any) => {
        console.log('Error connecting to database: ', error);
        return process.exit(1);
      });
  }
}
