
import express from "express";
import EventController from "../controllers/EventController";
import { amountValidation, fileValidation } from "./validations/EventValidation";

const router = express.Router();
const eventController = new EventController(process.env.LOGS_DIRECTORY || `/var/log/`);

router.get("/", amountValidation, fileValidation, eventController.fetch)

export default router;