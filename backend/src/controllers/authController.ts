import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/UserModel';
import { env } from '../config/env';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, role, full_name, phone } = req.body;
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }
      
      if (role === 'admin') {
        const adminCount = await UserModel.countAdmins();
        if (adminCount > 0) {
          res.status(403).json({ error: 'Admin already exists. Cannot register another.' });
          return;
        }
      }
      
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      
      const userId = await UserModel.create({
        username: username || email.split('@')[0], 
        email, 
        password_hash, 
        role: role || 'fisherman', 
        full_name, 
        phone
      });
      
      res.status(201).json({ message: 'User created successfully', userId });
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
          res.status(400).json({ error: 'Username or email already in use.' });
          return;
      }
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
         res.status(401).json({ error: 'Invalid credentials' });
         return;
      }
      
      const token = jwt.sign(
        { id: user.user_id, role: user.role, name: user.username },
        env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      res.status(200).json({ 
        token, 
        user: { id: user.user_id, role: user.role, name: user.username, email: user.email } 
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: 'Successfully logged out' });
  }
}
