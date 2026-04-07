import * as admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.DOMAIN_FIREBASE_PROJECT_ID,
      clientEmail: process.env.DOMAIN_FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.DOMAIN_FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

export const firebaseAdmin = admin;
export const firebaseAuth = admin.auth();
