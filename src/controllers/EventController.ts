import { NextFunction, Request, Response } from 'express';
import EventLimiter from './EventLimiterTransform';
import LogReadable from './LogReadable';
import WordFilter from './WordFilterTransform';

export default class EventController {
  private _logsDirectory: string;

  constructor(logsDirectory: string) {
    this._logsDirectory = logsDirectory;
  }

  public fetch = async (req: Request, res: Response, next: NextFunction) => {
    new LogReadable(`${this._logsDirectory}${req.query.file}`)
      .on("error", function (e: any) {
        let status = 500;
        let message = "server error";
        if (e.code === 'ENOENT') {
          status = 404;
          message = "file not found";
        }

        res.status(status).send(message);
        return;
      })
      .pipe(new WordFilter(req.query.filter as string))
      .pipe(new EventLimiter(req.query.amount as string))
      .pipe(res);
  }
}
