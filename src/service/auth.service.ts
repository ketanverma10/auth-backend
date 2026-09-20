import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { or, eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "../utils/password.js";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/refreshToken.js";
import { AppError } from "../utils/AppError.js";
import { createSession } from "./session.service.js";

export const registerUser = async (data: {
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  password: string;
}) => {
  if (!data.email && !data.phoneNumber) {
    throw new AppError("Either email or phone number is required", 400);
  }
  let whereCondition;

  if (data.email && data.phoneNumber) {
    whereCondition = or(
      eq(users.email, data.email),
      eq(users.phoneNumber, data.phoneNumber),
    );
  } else if (data.email) {
    whereCondition = eq(users.email, data.email);
  } else if (data.phoneNumber) {
    whereCondition = eq(users.phoneNumber, data.phoneNumber);
  }
  const existingUser = await db.select().from(users).where(whereCondition);

  if (existingUser.length > 0) {
    throw new AppError("User already exists", 409);
  }

  const passwordHash = await hashPassword(data.password);
  const [newUser] = await db
    .insert(users)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      passwordHash: passwordHash,
    })
    .returning();

  return newUser;
};

export const loginUser = async (data: {
  email: string | null;
  phoneNumber: string | null;
  password: string;
}) => {
  if (!data.email && !data.phoneNumber) {
    throw new AppError("Either email or phone number is required", 400);
  }
  let whereCondition;

  if (data.email) {
    whereCondition = eq(users.email, data.email);
  } else if (data.phoneNumber) {
    whereCondition = eq(users.phoneNumber, data.phoneNumber);
  }

  const existingUser = await db.select().from(users).where(whereCondition);

  if (existingUser.length === 0) {
    throw new AppError("Invalid email/phone or password", 401);
  }

  const user = existingUser[0];

  const isPasswordValid = await comparePassword(
    data.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email/phone or password", 401);
  }

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await createSession(user.id, refreshTokenHash, expiresAt);
  return {
    user,
    refreshToken,
  };
};
