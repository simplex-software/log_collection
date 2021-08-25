import { NextFunction, Request, Response } from 'express';
import LogReadable from './LogRedable';
import WordFilter from './WordFilterTransform';

export default class EventController {

  public fetch = async (req: Request, res: Response, next: NextFunction) => {
    const filepath: string = `${process.env.LOGS_DIRECTORY || `/var/log/`}${req.query.file}`;
    const filterWord: string = req.query.filter ? "" + req.query.filter : "";
    const amount: number = req.query.amount ? +req.query.amount : 0;
    if (amount < 0 || isNaN(amount)) {
      res.status(400).send("incorrect amount value");
      return;
    }

    new LogReadable(filepath, amount)
      .on("error", function (e: any) {
        let status: number = 500
        let message: string = e.message
        if (e.code === 'ENOENT') {
          status = 404
          message = "file not found";
        }

        res.status(status).send(message);
        return;
      })
      .pipe(new WordFilter(filterWord))
      .pipe(res);
  }
}
