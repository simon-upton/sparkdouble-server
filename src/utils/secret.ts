import crypto from "crypto";

export const genSecret = function (): string {
  return crypto.randomBytes(24).toString("hex");
};
