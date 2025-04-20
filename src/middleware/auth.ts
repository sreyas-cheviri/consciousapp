import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";


declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers["authorization"];
    
    if (!token) {
      res.status(401).json({ message: "Authentication token missing" });
      return;
    }
    
    const decodedToken = jwt.verify(
      token as string,
      process.env.JWT_SECRET || ''
    ) as JwtPayload;

    if (decodedToken && decodedToken.id) {
      req.userId = decodedToken.id;
      next();
    } else {
      res.status(403).json({ message: "Invalid authentication token" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(403).json({ message: "You are not logged in" });
  }
};