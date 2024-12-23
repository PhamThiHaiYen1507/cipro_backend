import { Request, Response } from "express";
import { Account } from "../models/account";
import { GitHubWorkflowAction } from "../models/githubWorkflowAction";
import { ArtifactModel, NotificationModel, ProjectModel, UserModel } from "../models/models";
import { errorResponse, successResponse } from "../utils/responseFormat";
import { sendNotification } from "./notification.controller";

interface RequestBody {
  eventCode: string;
  imageName: string;
  data: Array<{
    cveId: string;
    description: string;
    severity: string;
    score?: number;
  }>;
}
export async function importVulnToImage(req: Request, res: Response) {
  const { eventCode, imageName, data }: RequestBody = req.body;
  try {
    // imageName is either in format of {image}:{tag} or {author}/{image}:{tag}. Retrieve the image and tag from it
    const name = imageName.split(":")[0];
    const version = imageName.split(":")[1];
    const type = "image";
    const artifacts = await ArtifactModel.find({
      name,
      version,
    });

    if (!artifacts) {
      return res.json(
        errorResponse(
          `No artifact found with name ${name} and version ${version}`
        )
      );
    }

    if (artifacts.length == 0) {
      await ArtifactModel.create(
        {
          name, version, type,
        }
      );
    }

    await ArtifactModel.updateMany(
      { name, version },
      {
        $set: {
          vulnerabilityList: data,
        },
      }
    );


    return res.json(
      successResponse(null, "Successfully imported vulnerabilities")
    );
  } catch (error) {
    console.log(error);
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function webhookNotification(req: Request, res: Response) {
  try {

    const payload = req.body as GitHubWorkflowAction;

    const { full_name: projectName } = payload.repository;

    if (["completed", "queued"].includes(payload.action)) {
      const project = await ProjectModel.findOne({ name: projectName });

      if (!project) {
        return res.status(404).json(errorResponse("Project not found"));
      }

      // Lấy tất cả User trong Project này
      const users = await UserModel.find({ projectIn: project!._id })
        .populate({
          path: "account",
          select: "fcmToken",
        });


      const accounts = users.map(user => user.account).filter(account => (account as Account).fcmToken);

      accounts.forEach(async data => {
        const account = data as Account;

        const title = 'Workflow notice';

        const content = payload.workflow_job.workflow_name + " " + payload.workflow_job.name + " " + payload.action;

        const notificationData = {
          title: title,
          content: content,
          createBy: payload.workflow_job.workflow_name,
          type: 'workflow',
          receiver: account,
        }

        await NotificationModel.create(notificationData);

        sendNotification(title, content, account!.fcmToken!, {
          title: title,
          content: content,
          createBy: payload.workflow_job.workflow_name,
          type: 'workflow',
        });
      })
    }

    return res.json(successResponse(true, "Event received"));
  } catch (error) {
    console.error(error);

    return res.json(errorResponse("Error processing event"));
  }
}
