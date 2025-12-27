import jwt from 'jsonwebtoken';
import { db } from '../libs/db.ts';
import dotenv from 'dotenv';

dotenv.config();

export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized - No token provided (Not logged in)',
      });
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: 'Unauthorized - Invalid token',
      });
    }

    const user = await db.user.findUnique({
      where: {
        id: decodedToken?.id,
      },
      select: {
        id: true,
        image: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Error authenticating user' });
  }
};

export const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Access denied - Admins only',
      });
    }

    next();
  } catch (error) {
    console.error('Error authenticating admin:', error);
    res.status(500).json({ message: 'Error authenticating admin' });
  }
};
