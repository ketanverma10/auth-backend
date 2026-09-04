import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { or, eq } from "drizzle-orm";
import { hashPassword } from "../utils/password.js";

export const registerUser = async (data: {
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  password: string;
}) => {
  if (!data.email && !data.phoneNumber) {
    throw new Error("Either email or phone number is required");
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
    throw new Error("User already exits");
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
