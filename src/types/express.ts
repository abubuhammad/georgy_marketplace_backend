// Augment Express Request type to include user property
// This must NOT import or re-export express to avoid conflicts
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      userId?: string;
      email: string;
      role: string;
      [key: string]: any;
    };
  }
}
