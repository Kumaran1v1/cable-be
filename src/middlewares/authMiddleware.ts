import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { verifyToken } from "../utils/token.utils";

export const authenticateJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authorization token missing or malformed",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const authenticate = authenticateJWT;
export type AuthenticatedRequest = AuthRequest;
