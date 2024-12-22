import express from "express";
import { receivedOwaspReports } from "../controllers/reports.controller";

const reportRoute = express.Router();

reportRoute.post("/owasp", receivedOwaspReports);

export default reportRoute;