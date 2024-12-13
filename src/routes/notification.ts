import express from "express";
import { setNotificationToken } from "../controllers/notification.controller";

const notificationRoute = express.Router();

notificationRoute.post("/token", setNotificationToken);

export default notificationRoute;