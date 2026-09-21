import { oauthAccounts, users } from "../db/schema.js";
import { AppError } from "../utils/AppError.js";
import { db } from "../db/index.js";
import { eq, and } from "drizzle-orm";

export const findOAuthAccount = async (
  provider: string,
  providerAccountId: string,
) => {
  if (!provider) {
    throw new AppError("Provider is required", 400);
  }

  if (!providerAccountId) {
    throw new AppError("Provider Account ID is required", 400);
  }

  const [account] = await db
    .select()
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerAccountId, providerAccountId),
      ),
    );

  if (!account) {
    return null;
  }

  return account;
};

export const createOAuthAccount = async (
  userId: string,
  provider: string,
  providerAccountId: string,
) => {
  if (!userId) {
    throw new AppError("User id is required", 400);
  }
  if (!provider) {
    throw new AppError("Provider is required", 400);
  }
  if (!providerAccountId) {
    throw new AppError("Provider Account Id is required", 400);
  }

  const [account] = await db
    .insert(oauthAccounts)
    .values({
      userId,
      provider,
      providerAccountId,
    })
    .returning();

  return account;
};

export const findOrCreateGoogleUser = async (
  providerAccountID: string,
  email: string,
  firstName: string,
  lastName: string,
) => {
  if (!providerAccountID) {
    throw new AppError("Provider Account Id is required", 400);
  }
  if (!email) {
    throw new AppError("Email is required", 400);
  }
  if (!firstName) {
    throw new AppError("First Name is required", 400);
  }
  if (!lastName) {
    throw new AppError("Last Name is required", 400);
  }

  const existingAccount = await findOAuthAccount("google", providerAccountID);

  if (existingAccount) {
    return existingAccount.userId;
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    await createOAuthAccount(existingUser.id, "google", providerAccountID);

    return existingUser.id;
  }

  const [newUser] = await db
    .insert(users)
    .values({
      firstName,
      lastName,
      email,
      passwordHash: null,
    })
    .returning();

  await createOAuthAccount(newUser.id, "google", providerAccountID);

  return newUser.id;
};
