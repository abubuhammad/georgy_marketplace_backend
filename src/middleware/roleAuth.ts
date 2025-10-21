import { Request, Response, NextFunction } from 'express';
import '../types'; // Import type definitions

export const requireRole = (requiredRole: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions'
      });
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireDeliveryAgent = requireRole('delivery_agent');
export const requireAdminOrAgent = requireRole(['admin', 'delivery_agent']);
