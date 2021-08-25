import { Request, Response } from 'express';
import express from "express";
import eventsRoute from "./routes/EventsRoutes"

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/health', (req: Request, res: Response) => {
  res.send({ health: true });
});

app.use('/events', eventsRoute);

const server = app.listen(process.env.PORT);

export default server