import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";

export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET || "fallback_default_secret_key";
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET || "fallback_default_secret_key";
  return jwt.verify(token, secret) as JWTPayload;
};
