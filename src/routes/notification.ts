import express from "express";
import { getNotification, setNotificationToken } from "../controllers/notification.controller";

const notificationRoute = express.Router();

notificationRoute.post("/token", setNotificationToken);
notificationRoute.get("/", getNotification);

export default notificationRoute;