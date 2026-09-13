import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getUserById = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const [userData] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phoneNumber: users.phoneNumber,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!userData) {
    throw new Error("User not found");
  }

  return userData;
};
