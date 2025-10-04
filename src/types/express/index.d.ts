import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email?: string;
      };
    }
  }
}

export {}; // penting! biar dianggap module dan dievaluasi
