import * as dotenv from "dotenv";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
dotenv.config();

const serviceAccountPath = path.resolve(__dirname, './firebase/firebase-service.json');

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

serviceAccount.private_key = process.env.FIREBASE_NOTIFICATION_PRIVATE_KEY;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export default admin;