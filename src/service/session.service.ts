import { hashRefreshToken } from "../utils/refreshToken.js";
import { db } from "./../db/index.js";
import { or, eq } from "drizzle-orm";
import { sessions } from "./../db/schema.js";
import { AppError } from "../utils/AppError.js";

export const createSession = async (
  userId: string,
  refreshTokenHash: string,
  expiresAt: Date,
) => {
  if (!userId) {
    throw new AppError("UserId is required", 400);
  }
  if (!refreshTokenHash) {
   throw new AppError("Refresh token hash is required", 400);
  }
  if (!expiresAt) {
   throw new AppError("Expire date is required", 400);
  }

  await db.insert(sessions).values({
    userId: userId,
    refreshTokenHash: refreshTokenHash,
    expiresAt: expiresAt,
  });
};

export const findSessionByRefreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.refreshTokenHash, refreshTokenHash));

  if (!session) {
  throw new AppError("Invalid refresh token", 401);
  }

  if (session.revokedAt) {
   throw new AppError("Refresh session has been revoked", 401);
  }

  if (session.expiresAt <= new Date()) {
   throw new AppError("Refresh session has expired", 401);
  }
  return session;
};

export const revokeSession = async (sessionId: string) => {
  if (!sessionId) {
 throw new AppError("Session ID is required", 400);
  }

  await db
    .update(sessions)
    .set({
      revokedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));
};

export const rotateSession = async (
  sessionId: string,
  userId: string,
  newRefreshTokenHash: string,
  expiresAt: Date,
) => {
  if (!sessionId) {
   throw new AppError("SessionId is required", 400);
  }

  if (!userId) {
   throw new AppError("User Id is required", 400);
  }

  if (!newRefreshTokenHash) {
    throw new AppError("New Refresh Token Hash is required", 400);
  }

  if (!expiresAt) {
   throw new AppError("expiresAt is required", 400);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, sessionId));

    await tx.insert(sessions).values({
      userId,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt,
    });
  });
};
