import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserService } from "../services/user.service";
import { TokenService } from "../services/token.service";
import { getPermissionsForRole } from "../utils/roles";
import dotenv from "dotenv";
dotenv.config();

const tokenService = new TokenService();


export interface AuthRequest extends Request {
    user: {
        id: string;
        email: string;
        role: string;
        groups?: any[];
        effectivePermissions?: string[];
    };
}

export const authMiddleware = (userService: UserService) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;
            const cookieToken = req.cookies?.access_token;
            const token = (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || cookieToken;

            if (!token) {
                res.status(401).json({
                    statusCode: 401,
                    message: "No authorization token"
                });
                return;
            }

            const decoded = tokenService.verifyAccessToken(token);
            const user = await userService.getUserById(decoded.id);

            if (!user) {
                res.status(401).json({
                    statusCode: 401,
                    message: "User not found"
                });
                return;
            }

            // Check if user is active
            if (!user.is_active) {
                res.status(403).json({
                    statusCode: 403,
                    message: "Account is deactivated. Please contact an administrator."
                });
                return;
            }

            const effectivePermissions = getPermissionsForRole(user.role || 'member');

            req.user = {
                id: user.id,
                email: user.email,
                role: user.role || 'member',
                groups: user.groups || [],
                effectivePermissions,
            };
            next();
        } catch (error) {
            res.status(401).json({
                statusCode: 401,
                message: "Invalid token"
            });
        }
    };
};

export const adminMiddleware: RequestHandler = (req, res, next) => {
    const authReq = req as AuthRequest;
    console.log("auth role:", authReq.user)
    if (!authReq.user || !authReq.user.role || !['admin', 'super_admin'].includes(authReq.user.role)) {
        res.status(403).json({
            statusCode: 403,
            message: "Access denied. Admin role required."
        });
        return;
    }
    next();
};