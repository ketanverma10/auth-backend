import { pgTable, uuid, varchar, timestamp,unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  firstName: varchar("first_name", { length: 100 }).notNull(),

  lastName: varchar("last_name", { length: 100 }).notNull(),

  email: varchar("email", { length: 255 }).unique(),

  phoneNumber: varchar("phone_number", { length: 20 }).unique(),

  passwordHash: varchar("password_hash", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  refreshTokenHash: varchar("referesh_token_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  revokedAt: timestamp("revoked_at"),
});


export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    provider: varchar("provider", {
      length: 50,
    }).notNull(),

    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    providerAccountUnique: unique().on(
      table.provider,
      table.providerAccountId
    ),
  })
);