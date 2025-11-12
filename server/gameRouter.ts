import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { gameSaves } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// 游戏状态数据验证schema
const GameStateSchema = z.object({
  saveName: z.string().min(1).max(100),

  // 玩家属性
  playerHealth: z.number().int().min(0),
  playerMaxHealth: z.number().int().min(1),
  playerEnergy: z.number().int().min(0),
  playerMaxEnergy: z.number().int().min(1),
  playerExp: z.number().int().min(0),
  playerLevel: z.number().int().min(1),
  playerMoney: z.number().int().min(0),

  // 玩家位置
  playerX: z.number(),
  playerY: z.number(),
  playerZ: z.number(),

  // 游戏状态
  currentDialogue: z.string().optional(),
  gameTime: z.string().default("morning"),
  score: z.number().int().min(0),
  combo: z.number().int().min(0),

  // 背包和装备 (JSON字符串)
  inventory: z.string(),
  equipment: z.string(),

  // 任务进度 (JSON字符串)
  activeQuests: z.string(),
  completedQuests: z.string(),
});

export const gameRouter = router({
  // 保存游戏进度
  saveGame: publicProcedure
    .input(GameStateSchema)
    .mutation(async ({ ctx, input }) => {
      // 需要登录才能保存
      if (!ctx.user) {
        throw new Error("Must be logged in to save game");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // 检查是否已存在同名存档
        const existingSave = await db.query.gameSaves.findFirst({
          where: (gameSaves: any, { and, eq }: any) => and(
            eq(gameSaves.userId, ctx.user!.id),
            eq(gameSaves.saveName, input.saveName)
          ),
        });

        if (existingSave) {
          // 更新现有存档
          await db
            .update(gameSaves)
            .set({
              ...input,
              updatedAt: new Date(),
            })
            .where(eq(gameSaves.id, existingSave.id));

          return {
            success: true,
            message: "Game saved successfully",
            saveId: existingSave.id,
          };
        } else {
          // 创建新存档
          const [newSave] = await db.insert(gameSaves).values({
            userId: ctx.user.id,
            ...input,
          });

          return {
            success: true,
            message: "New game save created",
            saveId: newSave.insertId,
          };
        }
      } catch (error) {
        console.error("Error saving game:", error);
        throw new Error("Failed to save game");
      }
    }),

  // 加载游戏进度
  loadGame: publicProcedure
    .input(
      z.object({
        saveId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Must be logged in to load game");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const save = await db.query.gameSaves.findFirst({
        where: (gameSaves: any, { and, eq }: any) => and(
          eq(gameSaves.id, input.saveId),
          eq(gameSaves.userId, ctx.user!.id)
        ),
      });

      if (!save) {
        throw new Error("Save not found");
      }

      return save;
    }),

  // 获取存档列表
  listSaves: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Must be logged in to list saves");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const saves = await db.query.gameSaves.findMany({
      where: (gameSaves: any, { eq }: any) => eq(gameSaves.userId, ctx.user!.id),
      orderBy: (gameSaves: any, { desc }: any) => [desc(gameSaves.updatedAt)],
    });

    return saves;
  }),

  // 删除存档
  deleteSave: publicProcedure
    .input(
      z.object({
        saveId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Must be logged in to delete save");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const save = await db.query.gameSaves.findFirst({
        where: (gameSaves: any, { and, eq }: any) => and(
          eq(gameSaves.id, input.saveId),
          eq(gameSaves.userId, ctx.user!.id)
        ),
      });

      if (!save) {
        throw new Error("Save not found");
      }

      await db.delete(gameSaves).where(eq(gameSaves.id, input.saveId));

      return {
        success: true,
        message: "Save deleted successfully",
      };
    }),

  // 获取最近的存档（用于自动加载）
  getLatestSave: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return null;
    }

    const db = await getDb();
    if (!db) {
      return null;
    }

    const save = await db.query.gameSaves.findFirst({
      where: (gameSaves: any, { eq }: any) => eq(gameSaves.userId, ctx.user!.id),
      orderBy: (gameSaves: any, { desc }: any) => [desc(gameSaves.updatedAt)],
    });

    return save || null;
  }),
});
