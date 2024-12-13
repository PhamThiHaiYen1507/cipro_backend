
import { Request, Response } from "express";
import admin from "firebase-admin";
import { AccountModel } from "../models/models";
import { errorResponse, successResponse } from "../utils/responseFormat";

export async function setNotificationToken(req: Request, res: Response) {
    try {
        var account = await AccountModel.findOneAndUpdate(req.user?._id, { $set: { fcmToken: req.body.token } }, { new: true, upsert: false });

        return res.json(successResponse(account, "Success"));
    } catch (error) {
        return res.json(errorResponse(`Internal server error: ${error}`));
    }
}

export async function sendNotification(title: string, body: string, token: string) {
    const message = {
        notification: {
            title,
            body,
        },
        token,
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