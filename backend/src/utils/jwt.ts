import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-change-in-production';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const generateAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: ACCESS_EXPIRES as any };
  return jwt.sign(payload, ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: REFRESH_EXPIRES as any };
  return jwt.sign(payload, REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const days = parseInt(REFRESH_EXPIRES.replace('d', '')) || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};
