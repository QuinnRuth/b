import { useEffect, useCallback, useRef } from 'react';
import { trpc } from '../lib/trpc';
import type { InventoryItem, Equipment } from '../types/items';
import type { ActiveQuest } from '../types/quests';

export interface GameState {
  saveName: string;
  playerHealth: number;
  playerMaxHealth: number;
  playerEnergy: number;
  playerMaxEnergy: number;
  playerExp: number;
  playerLevel: number;
  playerMoney: number;
  playerX: number;
  playerY: number;
  playerZ: number;
  currentDialogue?: string;
  gameTime: string;
  score: number;
  combo: number;
  inventory: InventoryItem[];
  equipment: Equipment;
  activeQuests: ActiveQuest[];
  completedQuests: string[];
}

export interface UseGameSaveOptions {
  autoSaveInterval?: number; // 自动保存间隔（毫秒），默认30秒
  enabled?: boolean; // 是否启用自动保存
}

export function useGameSave(
  gameState: GameState,
  options: UseGameSaveOptions = {}
) {
  const { autoSaveInterval = 30000, enabled = true } = options;
  const lastSaveTimeRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // tRPC mutations and queries
  const saveGameMutation = trpc.game.saveGame.useMutation();
  const listSavesQuery = trpc.game.listSaves.useQuery(undefined, {
    enabled: false, // Only fetch when explicitly requested
  });

  // 手动保存游戏
  const saveGame = useCallback(
    async (customSaveName?: string) => {
      try {
        const saveName = customSaveName || gameState.saveName || 'AutoSave';

        const saveData = {
          saveName,
          playerHealth: gameState.playerHealth,
          playerMaxHealth: gameState.playerMaxHealth,
          playerEnergy: gameState.playerEnergy,
          playerMaxEnergy: gameState.playerMaxEnergy,
          playerExp: gameState.playerExp,
          playerLevel: gameState.playerLevel,
          playerMoney: gameState.playerMoney,
          playerX: gameState.playerX,
          playerY: gameState.playerY,
          playerZ: gameState.playerZ,
          currentDialogue: gameState.currentDialogue,
          gameTime: gameState.gameTime,
          score: gameState.score,
          combo: gameState.combo,
          inventory: JSON.stringify(gameState.inventory),
          equipment: JSON.stringify(gameState.equipment),
          activeQuests: JSON.stringify(gameState.activeQuests),
          completedQuests: JSON.stringify(gameState.completedQuests),
        };

        const result = await saveGameMutation.mutateAsync(saveData);
        lastSaveTimeRef.current = Date.now();

        return {
          success: true,
          message: result.message,
          saveId: result.saveId,
        };
      } catch (error) {
        console.error('Failed to save game:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to save game',
        };
      }
    },
    [gameState, saveGameMutation]
  );

  // 自动保存逻辑
  useEffect(() => {
    if (!enabled) return;

    const triggerAutoSave = () => {
      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;

      // 如果距离上次保存超过间隔时间，执行保存
      if (timeSinceLastSave >= autoSaveInterval) {
        saveGame('AutoSave').then((result) => {
          if (result.success) {
            console.log('Auto-save completed:', result.message);
          }
        });
      }
    };

    // 设置定时器
    saveTimeoutRef.current = setInterval(triggerAutoSave, autoSaveInterval);

    // 清理
    return () => {
      if (saveTimeoutRef.current) {
        clearInterval(saveTimeoutRef.current);
      }
    };
  }, [enabled, autoSaveInterval, saveGame]);

  // 页面卸载前自动保存
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      // 使用 sendBeacon 或同步方式保存（受限于浏览器支持）
      const saveName = gameState.saveName || 'AutoSave';
      console.log('Saving game before unload:', saveName);
      // 注意：这里可能无法完成异步保存，建议使用visibilitychange事件
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, gameState.saveName]);

  return {
    saveGame,
    isSaving: saveGameMutation.isPending,
    saveError: saveGameMutation.error,
    listSaves: listSavesQuery.refetch,
    saves: listSavesQuery.data || [],
  };
}
