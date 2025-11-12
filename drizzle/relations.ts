import { relations } from "drizzle-orm";
import { users, gameSaves } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  gameSaves: many(gameSaves),
}));

export const gameSavesRelations = relations(gameSaves, ({ one }) => ({
  user: one(users, {
    fields: [gameSaves.userId],
    references: [users.id],
  }),
}));
