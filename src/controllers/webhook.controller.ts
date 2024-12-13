import axios from "axios";
import { Request, Response } from "express";
import { Account } from "../models/account";
import { GitHubWorkflowAction } from "../models/githubWorkflowAction";
import { ArtifactModel, ProjectModel, TicketModel, UserModel } from "../models/models";
import { SonarIssue } from "../models/sonarIssue";
import { SonarProject } from "../models/sonarProject";
import { errorResponse, successResponse } from "../utils/responseFormat";
import { sendNotification } from "./notification.controller";

const baseUrl = process.env.SONAR_CLOUD_URL;
const organization = "phamthihaiyen1507";
const headers = {
  'Authorization': `Bearer ${process.env.SONAR_CLOUD_API_TOKEN}`
}

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
    const payload = JSON.parse(req.body.payload) as GitHubWorkflowAction;

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

      accounts.forEach(data => {
        const account = data as Account;
        sendNotification("Workflow notice", payload.workflow_job.workflow_name + " " + payload.workflow_job.name + " " + payload.action, account!.fcmToken!);
      })
    }

    if (payload.action == 'completed' && payload.workflow_job.workflow_name == 'SonarCloud') {
      getSonarIssues(projectName);
    }

    return res.json(successResponse(true, "Event received"));
  } catch (error) {
    console.error(error);

    return res.json(errorResponse("Error processing event"));
  }
}

async function getSonarProjectKey(projectName: string) {
  const project = await ProjectModel.findOne({ name: { $regex: projectName, $options: 'i' } });

  if (project && !project.sonarProjectKey) {
    const response = await axios.get(`${baseUrl}/projects/search?q=${projectName}&organization=${organization}`, {
      headers: headers,
    })

    response.data.components.forEach((pj: SonarProject) => {
      console.log(pj.name === projectName);

      if (pj.name === projectName) {
        project.sonarProjectKey = pj.key;
        project.save();
      }
    })
  }

  return project;
}

async function getSonarPullRequestId(projectName: string) {
  const project = await getSonarProjectKey(projectName);

  if (!project?.sonarProjectKey) {
    return null;
  }

  const response = await axios.get(

    `${baseUrl}/project_pull_requests/list?project=${project.sonarProjectKey}`, {
    headers: headers,
  });

  if (response.data.pullRequests.length > 0) {
    return response.data.pullRequests[0].key;
  }

  return null;
}

export async function getSonarIssues(projectName: string) {

  const project = await getSonarProjectKey(projectName);

  const pullId = await getSonarPullRequestId(projectName);

  if (!project?.sonarProjectKey) {
    return;
  }

  const response = await axios.get(`${baseUrl}/issues/search?componentKeys=${project.sonarProjectKey}&pullRequest=${pullId}&statuses=OPEN`, {
    headers: headers,
  })

  response.data.issues.forEach(async (issue: SonarIssue) => {
    console.log(issue);

    const issueData = await TicketModel.findOne({ sonarIssueKey: issue.key });

    if (!issueData) {
      TicketModel.create({
        projectName: project.name,
        title: issue.message,
        // priority: issue.severity,
        sonarIssueKey: issue.key,
        status: issue.status.toLowerCase(),
      })
    }
  });
}
