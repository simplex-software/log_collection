import { Request, Response } from 'express';
import express from "express";
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/health', (req: Request, res: Response) => {
  res.send({ health: true });
});

const server = app.listen(process.env.PORT);

export default server