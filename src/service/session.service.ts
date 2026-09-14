import { hashRefreshToken } from "../utils/refreshToken.js";
import { db } from "./../db/index.js";
import { or, eq } from "drizzle-orm";
import { sessions } from "./../db/schema.js";

export const createSession = async (
  userId: string,
  refreshTokenHash: string,
  expiresAt: Date,
) => {
  if (!userId) {
    throw new Error("UserId is required");
  }
  if (!refreshTokenHash) {
    throw new Error("Refresh token hash is required");
  }
  if (!expiresAt) {
    throw new Error("Expire date is required");
  }

  await db.insert(sessions).values({
    userId: userId,
    refreshTokenHash: refreshTokenHash,
    expiresAt: expiresAt,
  });
};

export const findSessionByRefreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.refreshTokenHash, refreshToken));

  if (!session) {
    throw new Error("Invalid refresh token");
  }

  if (session.revokedAt) {
    throw new Error("Refresh token has been revoked");
  }

  if (session.expiresAt <= new Date()) {
    throw new Error("Refresh token has expired");
  }
  return session;
};

export const revokeSession = async(sessionId:string)=>{
  if(!sessionId){
    throw new Error("Session Id is required")
  }

  await db
    .update(sessions)
    .set({
      revokedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));
}