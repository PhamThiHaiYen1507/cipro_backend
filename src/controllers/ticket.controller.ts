import { Request, Response } from "express";
import { Account } from "../models/account";
import { ChangeHistoryModel, TicketModel, UserModel } from "../models/models";
import { errorResponse, successResponse } from "../utils/responseFormat";

export async function getAll(req: Request, res: Response) {
  const { projectName } = req.query;
  if (!projectName) {
    return res.json(errorResponse("Project name is required"));
  }
  try {
    const tickets = await TicketModel.find({
      projectName,
    }).populate({
      path: "assignee assigner",
      populate: {
        path: "account",
      }
    });
    return res.json(successResponse(tickets, "Tickets fetched successfully"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function get(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const ticket = await TicketModel.findById(id).populate({
      path: "assignee assigner targetedVulnerability",
      populate: {
        path: "account",
      }
    });
    if (ticket) {
      return res.json(successResponse(ticket, "Ticket fetched successfully"));
    } else {
      return res.json(errorResponse("Ticket does not exist"));
    }
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function create(req: Request, res: Response) {
  const { data } = req.body;
  // data.assignee is UserModel _id
  try {
    const assigner = await UserModel.findOne({ account: req.user?._id });
    const assignee = await UserModel.findById(data.assignee);
    const ticket = await TicketModel.create({
      ...data,
      assignee: assignee?._id,
      assigner: assigner?._id,
      createBy: req.user?.username,
    });
    await UserModel.findByIdAndUpdate(data.assignee, {
      $push: {
        ticketAssigned: ticket._id,
      },
    });
    await ChangeHistoryModel.create({
      objectId: ticket._id,
      action: "create",
      timestamp: ticket.createdAt,
      account: req.user?._id,
      description: `${req.user?.username} created this ticket`,
    });
    return res.json(successResponse(null, "Ticket created successfully"));
  } catch (error) {
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { data, assigneeId } = req.body;
  const { status } = data;
  try {
    const ticket = await TicketModel.findById(id);

    if (ticket) {
      if (status) ticket.status = data.status;

      if (assigneeId) ticket.assignee = assigneeId;

      if (req.user?._id && !ticket.assigner) {
        const user = await UserModel.findOne({ account: req.user?._id });
        ticket.assigner = user?._id;
      }

      await ticket.save();

      const assignee = await UserModel.findById(assigneeId).populate({
        path: "account",
      }) as unknown as { account: Account };

      // Temporarily, this function is only used for ticket status update
      await ChangeHistoryModel.create({
        objectId: ticket._id,
        action: "update",
        timestamp: ticket.updatedAt,
        account: req.user?._id,
        description: assigneeId ? `${req.user?.username} assigned this ticket to ${assignee?.account.username}` :
          status === "closed"
            ? `${req.user?.username} closed this ticket`
            : status === "open" ? `${req.user?.username} reopened this ticket` : ``,
      });
      return res.json(successResponse(null, "Ticket updated successfully"));
    }
    return res.json(errorResponse("Ticket does not exist"));
  } catch (error) {
    console.log(error);
    return res.json(errorResponse(`Internal server error: ${error}`));
  }
}
