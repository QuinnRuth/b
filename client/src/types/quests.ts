export enum QuestType {
  MAIN = 'main',
  SIDE = 'side',
  DAILY = 'daily',
}

export enum QuestStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLAIMED = 'claimed',
}

export enum QuestObjectiveType {
  KILL_ENEMIES = 'kill_enemies',
  COLLECT_ITEMS = 'collect_items',
  TALK_TO_NPC = 'talk_to_npc',
  REACH_LOCATION = 'reach_location',
  USE_SKILL = 'use_skill',
}

export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  description: string;
  target: string; // 目标ID（敌人类型、物品ID、NPC ID等）
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  exp?: number;
  silver?: number;
  items?: string[]; // 物品ID列表
}

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  status: QuestStatus;
  dialogueId?: string; // 接取任务的对话ID
  completeDialogueId?: string; // 完成任务的对话ID
  prerequisiteQuests?: string[]; // 前置任务
}

export interface ActiveQuest extends Quest {
  acceptedAt: number; // 接取时间戳
}
