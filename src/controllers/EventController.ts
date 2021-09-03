import { NextFunction, Request, Response } from 'express';
import { ParsedQs } from 'qs';
import { Transform } from 'stream';
import LogReadable from './LogRedable';
import WordFilter from './WordFilterTransform';

export default class EventController {

  public fetch = async (req: Request, res: Response, next: NextFunction) => {
    const filepath: string = `${process.env.LOGS_DIRECTORY || `/var/log/`}${req.query.file}`;
    const filterWord: string = req.query.filter ? "" + req.query.filter : "";

    if (!this.isValidAmount(req.query.amount)) {
      res.status(400).send("incorrect amount value");
      return;
    }

    new LogReadable(filepath, parseInt("" + req.query.amount))
      .on("error", function (e: any) {
        let status = 500;
        let message = e.message;
        if (e.code === 'ENOENT') {
          status = 404;
          message = "file not found";
        }

        res.status(status).send(message);
        return;
      })
      .pipe(new WordFilter(filterWord))
      .pipe(res);
  }

  private isValidAmount(amount: string | ParsedQs | string[] | ParsedQs[] | undefined): boolean {
    if (amount === undefined) {
      return true;
    }

    if (typeof amount !== "string") {
      return false;
    }

    const numberValue: number = parseInt(amount);
    if ((isNaN(numberValue) || numberValue < 0)) {
      return false;
    }
    return true;
  }
}
