import { Model } from 'mongoose';
import { Response, NextFunction } from 'express';

const load = (to: string, from: string, entity: string, Model: Model<any>, modelEntity: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      let doc;
      if (modelEntity == undefined) {
        doc = await Model.findOne({
          _id: req[from][entity],
        });
      } else {
        doc = await Model.findOne({
          modelEntity: req[from][entity],
        });
      }

      if (doc) {
        req[to] = doc;
        return next();
      } else {
        return res.status(404).json({
          message: 'No valid entry found',
        });
      }
    } catch (error) {
      return res.status(500).json({
        error,
      });
    }
  };
};

module.exports = { load };
