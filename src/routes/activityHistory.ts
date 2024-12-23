import express from "express";
import { getActivityHistory, getScanHistory } from "../controllers/activityHistory.controller";
import { checkAuth } from "../middlewares/auth";

const activityHistoryRoute = express.Router();
activityHistoryRoute.get("/:projectName", checkAuth, getActivityHistory);

activityHistoryRoute.get("/scan", checkAuth, getScanHistory);
export default activityHistoryRoute;
