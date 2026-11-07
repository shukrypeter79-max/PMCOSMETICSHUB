import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const publicUserSelect = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  role: true,
  avatar: true,
} as const;

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

function createToken(user: { id: string; role: string }): string {
  return jwt.sign({ id: user.id, role: user.role }, jwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName } = req.body ?? {};
    if (
      typeof email !== 'string' || !email.trim() ||
      typeof password !== 'string' || password.length < 8 ||
      typeof firstName !== 'string' || !firstName.trim() ||
      typeof lastName !== 'string' || !lastName.trim() ||
      (phone !== undefined && phone !== null && typeof phone !== 'string')
    ) {
      return res.status(400).json({ error: 'Valid email, name, and password (at least 8 characters) are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: normalizedEmail }, ...(phone ? [{ phone }] : [])] },
    });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        phone: phone || null,
        password: await bcryptjs.hash(password, 12),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        // Never allow public registration to assign privileged roles.
        role: 'CUSTOMER',
      },
      select: publicUserSelect,
    });

    return res.status(201).json({ user, token: createToken(user) });
  } catch {
    return res.status(500).json({ error: 'Registration failed; check server authentication configuration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _password, ...safeUser } = user;
    return res.json({ user: safeUser, token: createToken(user) });
  } catch {
    return res.status(500).json({ error: 'Login failed; check server authentication configuration' });
  }
});

router.get('/me', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: publicUserSelect,
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
