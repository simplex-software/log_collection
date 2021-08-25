
import express = require("express");
import path = require("path");
import EventController from "../controllers/EventController";

const router = express.Router();
const eventController = new EventController();

router.get("/", (req, res, next) => {
    if (typeof req.query.file !== 'string' || req.query.file.includes("..")) {
        res.status(400).send("invalid file path")
        return;
    }
    next();
}, eventController.fetch)

export default router;