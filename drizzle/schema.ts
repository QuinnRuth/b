import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Game save data tables
export const gameSaves = mysqlTable("game_saves", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  saveName: varchar("saveName", { length: 100 }).notNull(),
  
  // Player stats
  playerHealth: int("playerHealth").notNull().default(100),
  playerMaxHealth: int("playerMaxHealth").notNull().default(100),
  playerEnergy: int("playerEnergy").notNull().default(100),
  playerMaxEnergy: int("playerMaxEnergy").notNull().default(100),
  playerExp: int("playerExp").notNull().default(0),
  playerLevel: int("playerLevel").notNull().default(1),
  playerMoney: int("playerMoney").notNull().default(200),
  
  // Player position
  playerX: int("playerX").notNull().default(0),
  playerY: int("playerY").notNull().default(0),
  playerZ: int("playerZ").notNull().default(0),
  
  // Game state
  currentDialogue: varchar("currentDialogue", { length: 100 }),
  gameTime: varchar("gameTime", { length: 50 }).notNull().default("morning"),
  score: int("score").notNull().default(0),
  combo: int("combo").notNull().default(0),
  
  // Inventory (JSON)
  inventory: text("inventory").notNull().default("[]"),
  equipment: text("equipment").notNull().default("{}"),
  
  // Quest progress (JSON)
  activeQuests: text("activeQuests").notNull().default("[]"),
  completedQuests: text("completedQuests").notNull().default("[]"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GameSave = typeof gameSaves.$inferSelect;
export type InsertGameSave = typeof gameSaves.$inferInsert;