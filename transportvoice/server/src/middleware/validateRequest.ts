import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

/**
 * Middleware to validate request using express-validator
 * @param validations Array of validation chains
 * @returns Middleware function
 */
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    // Create error response
    const errorMessage = 'Validation failed';
    const error = new AppError(errorMessage, 400);
    
    // Send validation error response
    return res.status(400).json({
      status: 'error',
      message: errorMessage,
      errors: formattedErrors
    });
  };
};

/**
 * Middleware to sanitize request data
 * @param sanitizations Array of sanitization chains
 * @returns Middleware function
 */
export const sanitizeRequest = (sanitizations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all sanitizations
    await Promise.all(sanitizations.map(sanitization => sanitization.run(req)));
    next();
  };
}; 