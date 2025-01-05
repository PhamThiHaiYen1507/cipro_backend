import axios from "axios";
import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { AccountModel, ProjectModel, ThirdPartyModel } from "../models/models";
import { Workflow } from "../models/workflow";
import { WorkflowRun } from "../models/workflowRun";
import { errorResponse, successResponse } from "../utils/responseFormat";
import { safeGithubClient, safeGitlabClient } from "../utils/token";
export async function getAll(req: Request, res: Response) {
  try {
    const thirdParties = await ThirdPartyModel.find();
    return res.json(successResponse(thirdParties, "Third parties found"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function get(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const thirdParty = await ThirdPartyModel.findById(id);
    return res.json(successResponse(thirdParty, "Third party found"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function create(req: Request, res: Response) {
  const { data } = req.body;
  try {
    const newThirdParty = await ThirdPartyModel.create(data);
    return res.json(successResponse(null, "Third party created"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { data } = req.body;
  try {
    const updatedThirdParty = await ThirdPartyModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
    return res.json(successResponse(null, "Third party updated"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const deletedThirdParty = await ThirdPartyModel.findByIdAndDelete(id);
    return res.json(successResponse(null, "Third party deleted"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function getReposFromGithub(req: Request, res: Response) {
  const account = req.user;
  if (!account) {
    return res.json(errorResponse("You are not authenticated"));
  }
  try {
    const thirdParty = account.thirdParty.find((x) => x.name === "Github");
    if (!thirdParty) {
      return res.json(errorResponse("No Github account linked"));
    }
    const { username } = thirdParty;
    const octokit = await safeGithubClient(account._id);
    const repos = await octokit.rest.repos.listForAuthenticatedUser({
      username,
      type: "owner",
    });
    const formattedRepos = repos.data.map(
      ({ html_url, visibility, owner, full_name }) => ({
        name: full_name,
        url: html_url,
        status: visibility,
        owner: owner.login,
      })
    );
    return res.json(successResponse(formattedRepos, "Github repos found"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}
export async function getReposFromGitlab(req: Request, res: Response) {
  const account = req.user;
  if (!account) {
    return res.json(errorResponse("You are not authenticated"));
  }
  try {
    const thirdParty = account.thirdParty.find((x) => x.name === "Gitlab");
    if (!thirdParty) {
      return res.json(errorResponse("No Gitlab account linked"));
    }
    const { username, accessToken } = thirdParty;
    if (!accessToken) {
      return res.json(errorResponse("No Gitlab access token"));
    }
    const api = await safeGitlabClient(account._id);
    const repos = await api.Projects.all({
      owned: true,
      orderBy: "name",
      sort: "asc",
    });
    const formattedRepos = repos.map(
      ({ visibility, owner, path_with_namespace, web_url }) => ({
        name: path_with_namespace,
        url: web_url,
        status: visibility,
        owner: owner.name,
      })
    );
    return res.json(successResponse(formattedRepos, "Gitlab repos found"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function getGithubWorkflowsInfo(req: Request, res: Response) {
  const { projectName } = req.query;
  const id = req.user?._id;

  if (!projectName) {
    return res.json(errorResponse("Project name is required"));
  }

  const project = getWorkflowRuns(projectName as string, id!);

  return res.json(successResponse(project, "Workflows found"));

}

async function getWorkflowRuns(projectName: string, id: Types.ObjectId) {
  try {
    const account = await AccountModel.findOne({
      _id: id
    });

    if (account) {
      const accessToken = account.thirdParty.find((x) => x.name === "Github")?.accessToken;

      if (accessToken) {
        const response = await axios.get(`https://api.github.com/repos/${projectName}/actions/workflows`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          },
        });

        const data: Workflow[] = snakeToCamelKeys(response.data.workflows.map((workflow: any) => {
          workflow['id'] = workflow['id'].toString();
          return workflow;
        }));

        for (const workflow of data) {
          const count = await axios.get(`https://api.github.com/repos/${projectName}/actions/workflows/${workflow.id}/runs`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json'
            },
          });

          const { workflow_runs: runs, total_count: totalRuns } = count.data;
          workflow['totalRuns'] = totalRuns;

          const workflowRuns: WorkflowRun[] = runs.map((run: any) => {
            run['id'] = run['id'].toString();
            run['workflow_id'] = run['workflow_id'].toString();

            return plainToInstance(WorkflowRun, run, { excludeExtraneousValues: true });
          });

          workflow['runs'] = snakeToCamelKeys(workflowRuns);
        }

        if (data) {
          const project = await ProjectModel.findOneAndUpdate({ name: projectName }, {
            $set: {
              workflows: data
            }
          }, {
            new: true,
            upsert: true,
          });

          return project;
        }

      }

      return null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function changeStatusAction(req: Request, res: Response) {
  const { projectName, status, workflowId } = req.body;

  const id = req.user?._id;

  try {
    const account = await AccountModel.findOne({
      _id: id
    });

    if (account) {
      const accessToken = account.thirdParty.find((x) => x.name === "Github")?.accessToken;


      if (accessToken) {
        const response = await axios.put(`https://api.github.com/repos/${projectName}/actions/workflows/${workflowId}/${status ? 'enable' : 'disable'}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json'
          },
        });

        getWorkflowRuns(projectName, id!);

        return res.json(successResponse(response.data, "Workflow status changed"));
      }

      return res.json(errorResponse("Workflows not found"));
    }
  } catch (error) {
    console.log(error);

    res.json(errorResponse(`Internal server error: ${error}`));
  }

}

function snakeToCamelKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      acc[camelKey] = obj[key];
      return acc;
    }, {} as Record<string, any>);
  }
  return obj;
}