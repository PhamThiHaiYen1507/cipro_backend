import { isDocumentArray } from "@typegoose/typegoose";
import { Request, Response } from "express";
import { Account } from "../models/account";
import { PhaseModel, ProjectModel, TaskModel, UserModel } from "../models/models";
import { errorResponse, successResponse } from "../utils/responseFormat";
import { sendNotification } from "./notification.controller";
export async function getAll(req: Request, res: Response) {
  const { projectName, filter } = req.query;
  const decodedProjectName = decodeURIComponent(projectName as string);
  try {
    const tasks = await TaskModel.find({ projectName: decodedProjectName });
    const project = await ProjectModel.findOne({
      name: decodedProjectName,
    }).populate("phaseList");
    if (!project) {
      return res.json(errorResponse("Project not found"));
    }
    switch (filter) {
      case "unassigned":
        const filteredUnassigned = tasks.filter((task) => {
          let isAssigned = false;
          if (isDocumentArray(project.phaseList)) {
            project.phaseList.forEach((phase) => {
              if (phase.tasks.includes(task._id)) {
                isAssigned = true;
              }
            });
            return !isAssigned;
          }
        });
        return res.json(successResponse(filteredUnassigned, "Tasks found"));
      case "assigned":
        const filteredAssigned = tasks.filter((task) => {
          let isAssigned = false;
          if (isDocumentArray(project.phaseList)) {
            project.phaseList.forEach((phase) => {
              if (phase.tasks.includes(task._id)) {
                isAssigned = true;
              }
            });
            return isAssigned;
          }
        });
        return res.json(successResponse(filteredAssigned, "Tasks found"));
    }
    return res.json(successResponse(tasks, "Tasks found"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function get(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const task = await TaskModel.findById(id);
    return res.json(successResponse(task, "Task found"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function create(req: Request, res: Response) {
  const { data, phaseId, assigneeId } = req.body;
  try {
    const newTask = await TaskModel.create(data);

    await PhaseModel.findByIdAndUpdate(phaseId, { $addToSet: { tasks: newTask._id } })

    const user = await UserModel.findByIdAndUpdate(
      assigneeId,
      { $addToSet: { taskAssigned: newTask._id } },
      { new: true }
    ).populate({
      path: "account"
    });

    const account = user?.account as Account;

    if (account && account.fcmToken) {
      sendNotification({
        title: 'New task',
        content: `You have been assigned to task "${newTask.name}"`,
        createBy: 'system',
        receiver: account._id,
        type: 'task',
      },
        account.fcmToken,
      )
    }

    return res.json(successResponse(null, "Task created"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function update(req: Request, res: Response) {
  const { data } = req.body;
  const { id } = req.params;
  try {
    const task = await TaskModel.findByIdAndUpdate(id, data, { new: true });
    return res.json(successResponse(null, "Task updated"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const results = await TaskModel.findByIdAndDelete(id);
    return res.json(successResponse(null, "Task deleted"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}
