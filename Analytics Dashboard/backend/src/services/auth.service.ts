import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment.js';
import { AppError } from '../middleware/error.middleware.js';
import { StatusCodes } from 'http-status-codes';

// Mock user database (in production, use Prisma with User model)
const users = new Map();

export class AuthService {
  private readonly saltRounds = 10;

  async register(email: string, password: string, name: string) {
    // Check if user exists
    if (users.has(email)) {
      throw new AppError('User already exists', StatusCodes.CONFLICT);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create user
    const user = {
      id: crypto.randomUUID(),
      email,
      name,
      password: hashedPassword,
      createdAt: new Date(),
    };

    users.set(email, user);

    // Generate token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    // Get user
    const user = users.get(email);
    if (!user) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }

    // Generate token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );
  }
}