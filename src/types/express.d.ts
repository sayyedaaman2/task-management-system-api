import type { ITokenPayload } from "@/utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

export {};
