import { NextFunction, Request, Response } from "express";

const fileValidation = (req: Request, res: Response, next: NextFunction): void => {
    if (typeof req.query.file !== 'string' || req.query.file.includes("..")) {
        res.status(400).send("invalid file path")
        return;
    }
    next();
}

const amountValidation = (req: Request, res: Response, next: NextFunction): void => {
    if (req.query.amount !== undefined) {
        const numberValue: number = parseInt(req.query.amount as string);
        if ((isNaN(numberValue) || numberValue < 0)) {
            res.status(400).send("incorrect amount value");
            return;
        }
    }
    next();
}

export { fileValidation, amountValidation }