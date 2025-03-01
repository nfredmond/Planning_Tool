import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import User from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

/**
 * Middleware to require authentication
 * Verifies JWT token from cookies or Authorization header
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or Authorization header
    const token = 
      req.cookies.token || 
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
        ? req.headers.authorization.split(' ')[1] 
        : null);

    // Check if token exists
    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;

    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id);

    // Check if user exists
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Add user and token to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    
    next(error);
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param roles Array of allowed roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists on request (requireAuth should be called first)
    if (!req.user) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
}; 