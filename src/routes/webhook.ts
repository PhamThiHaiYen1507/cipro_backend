import express, { Request, Response } from "express";
import { getSonarIssues, importVulnToImage, webhookNotification } from "../controllers/webhook.controller";
const webhookRoute = express.Router();

webhookRoute.post("/image", importVulnToImage);


webhookRoute.post("/workflow", webhookNotification)

webhookRoute.post("/project", (req: Request, res: Response) => {

    const { projectName } = req.body
    console.log(projectName);

    getSonarIssues(projectName)

    res.sendStatus(200)
})

export default webhookRoute;
