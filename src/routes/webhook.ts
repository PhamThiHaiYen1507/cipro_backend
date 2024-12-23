import express from "express";
import { importVulnToImage, webhookNotification } from "../controllers/webhook.controller";
const webhookRoute = express.Router();

webhookRoute.post("/image", importVulnToImage);

webhookRoute.post("/workflow", webhookNotification)

export default webhookRoute;
