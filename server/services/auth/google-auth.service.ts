import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

export interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  profileImg: string;
}

export class GoogleAuthService {
  private readonly client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(GOOGLE_CLIENT_ID);
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    // Try ID token verification first, fall back to access token
    try {
      return await this.verifyAsIdToken(idToken);
    } catch {
      return await this.verifyAsAccessToken(idToken);
    }
  }

  private async verifyAsIdToken(idToken: string): Promise<GoogleProfile> {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token payload");
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      fullName: payload.name || "",
      firstName: payload.given_name || "",
      lastName: payload.family_name || "",
      profileImg: payload.picture || "",
    };
  }

  private async verifyAsAccessToken(accessToken: string): Promise<GoogleProfile> {
    const { data } = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!data.email) {
      throw new Error("Invalid Google access token");
    }

    return {
      googleId: data.sub,
      email: data.email,
      fullName: data.name || "",
      firstName: data.given_name || "",
      lastName: data.family_name || "",
      profileImg: data.picture || "",
    };
  }
}
