import { Request, Response, NextFunction } from "express";

export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "don’t have access" });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
