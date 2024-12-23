
import { Request, Response } from "express";
import admin from "firebase-admin";
import { Account } from "../models/account";
import { AccountModel, NotificationModel } from "../models/models";
import { Notification } from "../models/notification";
import { errorResponse, successResponse } from "../utils/responseFormat";

export async function setNotificationToken(req: Request, res: Response) {
    try {
        var account = await AccountModel.findOneAndUpdate(req.user?._id, { $set: { fcmToken: req.body.token } }, { new: true, upsert: false });

        return res.json(successResponse(account, "Success"));
    } catch (error) {
        return res.json(errorResponse(`Internal server error: ${error}`));
    }
}

export async function sendNotification(info: Notification, token: string, data?: any, user?: Account) {
    const account = await AccountModel.findById(info.receiver._id);

    if (account && account.notifications.includes(info.type)) {
        const message = {
            notification: {
                title: info.title,
                body: info.content,
            },
            token,
            data
        };

        admin
            .messaging()
            .send(message)
            .then((response) => {
                console.log("Successfully sent message:", response);
            })
            .catch((error) => {
                console.error("Error sending message:", error);
            });
    }

    if (info) {
        NotificationModel.create(info);
    }
}

export async function getNotification(req: Request, res: Response) {
    try {
        const notifications = await NotificationModel.find({
            receiver: req.user?._id
        }, null,
            { sort: { createdAt: -1 }, limit: 50 });

        return res.json(successResponse(notifications, "Success"));
    } catch (error) {
        return res.json(errorResponse(`Internal server error: ${error}`));
    }
}