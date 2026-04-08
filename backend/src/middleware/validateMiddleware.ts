import { Request, Response, NextFunction } from 'express';

const ALLOWED_PUBLIC_ROLES = ['fisherman', 'researcher'];

export const validateRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email, and password are required.' });
    return;
  }

  if (role && !ALLOWED_PUBLIC_ROLES.includes(role)) {
    res.status(403).json({
      error: 'Security Exception: Admin accounts cannot be created via public registration.'
    });
    return;
  }

  next();
};
