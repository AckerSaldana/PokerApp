import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { customizationService } from './customization.service';

export class AuthService {
  async register(data: RegisterInput) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new AppError('Email already in use', 400, 'EMAIL_EXISTS');
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new AppError('Username already taken', 400, 'USERNAME_EXISTS');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        chipBalance: true,
        createdAt: true,
      },
    });

    // Unlock default customization items for new user
    await customizationService.unlockDefaultItems(user.id);

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return { user, accessToken, refreshToken };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isValidPassword = await verifyPassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        chipBalance: user.chipBalance,
        avatarData: user.avatarData,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Refresh token expired', 401, 'TOKEN_EXPIRED');
    }

    try {
      verifyRefreshToken(refreshToken);
    } catch {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });
    const newRefreshToken = generateRefreshToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        chipBalance: true,
        lastWeeklyCredit: true,
        avatarData: true,
        consecutiveWins: true,
        maxWinStreak: true,
        equippedFrameId: true,
        equippedTitleId: true,
        equippedFrame: {
          select: {
            cssClass: true,
          },
        },
        equippedTitle: {
          select: {
            name: true,
            color: true,
          },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      ...user,
      equippedFrameCss: user.equippedFrame?.cssClass || null,
      equippedTitleName: user.equippedTitle?.name || null,
      equippedTitleColor: user.equippedTitle?.color || null,
    };
  }
}

export const authService = new AuthService();
