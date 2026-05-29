import type { User } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user: User;
        agencyId: string;
      };
    }
  }
}

export {};
