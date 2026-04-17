import { Request, Response } from "express";
import { DenominationRequestService } from "../services/denomination-request.service";
import { DenominationRequestStatus } from "../models/church/denomination-request.model";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth.middleware";

const service = new DenominationRequestService();

// ─── Public: submit a denomination request ────────────────────────────────
export const submitDenominationRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      denomination_name,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country,
      reason,
    } = req.body;

    if (!denomination_name || !first_name || !last_name || !email) {
      res.status(400).json({
        status: 400,
        message:
          "denomination_name, first_name, last_name, and email are required",
      });
      return;
    }

    const request = await service.submit({
      denomination_name,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country,
      reason,
    });

    res.status(201).json({
      status: 201,
      data: request,
      message:
        "Your denomination request has been submitted. You will receive an email once it is reviewed.",
    });
  }
);

// ─── Super Admin: list all denomination requests ──────────────────────────
export const listDenominationRequests = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const status = req.query.status as DenominationRequestStatus | undefined;
    const requests = await service.list(status);
    res.json({ status: 200, data: requests });
  }
);

// ─── Super Admin: get a single denomination request ───────────────────────
export const getDenominationRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const request = await service.getById(id);
    res.json({ status: 200, data: request });
  }
);

// ─── Super Admin: approve a denomination request ──────────────────────────
export const approveDenominationRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const reviewerId = (req as AuthRequest).user?.id;
    const { user, denomination } = await service.approve(id, reviewerId);

    res.json({
      status: 200,
      data: { user: { id: user.id, email: user.email }, denomination },
      message:
        "Denomination approved. Account created and login credentials sent to the requester's email.",
    });
  }
);

// ─── Super Admin: reject a denomination request ───────────────────────────
export const rejectDenominationRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      res.status(400).json({ status: 400, message: "rejection_reason is required" });
      return;
    }

    const reviewerId = (req as AuthRequest).user?.id;
    const request = await service.reject(id, reviewerId, rejection_reason);

    res.json({
      status: 200,
      data: request,
      message: "Denomination request has been rejected and the requester has been notified.",
    });
  }
);
