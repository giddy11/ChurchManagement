import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/user.model";
import path from "path";
import dotenv from "dotenv";
import { ActivityLog } from "../models/activity-log.model";
import { Denomination, Branch, BranchMembership, BranchJoinRequest, BranchInvite, DenominationRequest, CustomDomain } from "../models/church";
import { Person } from "../models/person.model";
import { Event, EventAttendance, GuestAttendance } from "../models/event";
import { WebsiteVisit } from "../models/website-visit.model";
import { FollowUp, FollowUpContactLog, FollowUpNotificationLog, FollowUpSavedFilter } from "../models/follow-up.model";
dotenv.config();

// Aiven and Cloud Run both provide DATABASE_URL; local dev may use DB_URL or
// individual DB_HOST / DB_PORT / DB_USERNAME / DB_PASSWORD / DB_NAME vars.
const connectionUrl = process.env.DATABASE_URL || process.env.DB_URL;

// SSL is always on when a connection URL is present (Aiven requires it).
// In plain host/port mode, opt-in via DB_SSL=true.
const sslConfig =
  connectionUrl || process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false;

export const AppDataSource = new DataSource({
    type: "postgres",
    ...(connectionUrl ? { url: connectionUrl } : {}),
    ssl: sslConfig,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "ferncot_db",
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [ User,
                ActivityLog,
                Denomination,
                Branch,
                BranchMembership,
                BranchJoinRequest,
                BranchInvite,
                DenominationRequest,
                CustomDomain,
                Person,
                Event,
                EventAttendance,
                GuestAttendance,
                WebsiteVisit,
                FollowUp,
                FollowUpContactLog,
                FollowUpNotificationLog,
                FollowUpSavedFilter
            ],
    migrations: [path.join(__dirname, '../migrations/*.js')],
    subscribers: [path.join(__dirname, '../subscribers/*.js')],
}); 