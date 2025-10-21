import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';
import { createError } from './errorHandler';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      const errorMessage = error.details.map(detail => detail.message).join(', ');
      
      const validationError = createError(`Validation error: ${errorMessage}`, 400);
      (validationError as any).details = errorDetails;
      
      return next(validationError);
    }

    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      const errorMessage = error.details.map(detail => detail.message).join(', ');
      
      const validationError = createError(`Parameter validation error: ${errorMessage}`, 400);
      (validationError as any).details = errorDetails;
      
      return next(validationError);
    }

    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      const errorMessage = error.details.map(detail => detail.message).join(', ');
      
      const validationError = createError(`Query validation error: ${errorMessage}`, 400);
      (validationError as any).details = errorDetails;
      
      return next(validationError);
    }

    next();
  };
};
