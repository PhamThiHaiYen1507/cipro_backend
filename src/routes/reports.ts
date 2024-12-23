import express from "express";
import { receivedOwaspReports, receivedSonarReports, receivedTrivyReports } from "../controllers/reports.controller";

const reportRoute = express.Router();

reportRoute.post("/owasp", receivedOwaspReports);
reportRoute.post("/trivy", receivedTrivyReports);
reportRoute.post("/sonar", receivedSonarReports);

export default reportRoute;