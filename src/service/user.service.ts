import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { AppError } from "../utils/AppError.js";
export const getUserById = async (userId: string) => {
  if (!userId) {
   throw new AppError("User ID is required", 400);
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
   throw new AppError("User not found", 404);
  }

  return userData;
};
