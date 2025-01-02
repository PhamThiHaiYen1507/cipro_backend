import express from "express";
import { startScanImage } from "../controllers/image.controller";
const imageScannerRoute = express.Router();

imageScannerRoute.get("/", startScanImage);

export default imageScannerRoute;