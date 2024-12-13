import admin from "firebase-admin";
import { firebaseService } from "./firebase/firebaseService";


admin.initializeApp({
    credential: admin.credential.cert({
        projectId: firebaseService.project_id,
        clientEmail: firebaseService.client_email,
        privateKey: firebaseService.private_key
    }),
});

export default admin;