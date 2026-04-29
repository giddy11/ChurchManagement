import { OAuth2Client } from "google-auth-library";
import axios from "axios";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
/**
 * The single redirect URI registered in Google Cloud Console.
 * Same URI works for ALL custom domains because the OAuth dance happens on
 * the API origin — the original frontend URL is round-tripped via the
 * signed `state` parameter.
 */
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.API_BASE_URL || "http://localhost:4000"}/api/auth/google/callback`;

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
  private readonly oauthClient: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(GOOGLE_CLIENT_ID);
    // Separate client configured for the auth-code flow (start + callback).
    this.oauthClient = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: GOOGLE_REDIRECT_URI,
    });
  }

  /** Build the Google consent screen URL for the auth-code flow. */
  buildAuthUrl(state: string): string {
    return this.oauthClient.generateAuthUrl({
      access_type: "online",
      prompt: "select_account",
      scope: ["openid", "email", "profile"],
      state,
    });
  }

  /** Exchange a one-time auth code for an access token, then load the profile. */
  async exchangeCodeForProfile(code: string): Promise<GoogleProfile> {
    const { tokens } = await this.oauthClient.getToken(code);
    const idToken = tokens.id_token;
    if (idToken) {
      try {
        return await this.verifyAsIdToken(idToken);
      } catch {
        // fall through
      }
    }
    if (!tokens.access_token) {
      throw new Error("Google token exchange returned no usable token");
    }
    return this.verifyAsAccessToken(tokens.access_token);
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
