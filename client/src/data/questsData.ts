import { Quest, QuestType, QuestStatus, QuestObjectiveType } from '../types/quests';

export const QUESTS: Record<string, Quest> = {
  // 主线任务1：清理村庄
  main_clear_village: {
    id: 'main_clear_village',
    type: QuestType.MAIN,
    title: '清理村庄',
    description: '村庄附近出现了一群盗匪，击败他们以保护村民的安全。',
    objectives: [
      {
        id: 'kill_bandits',
        type: QuestObjectiveType.KILL_ENEMIES,
        description: '击败盗匪',
        target: 'any', // 任意敌人
        current: 0,
        required: 4,
        completed: false,
      },
    ],
    rewards: {
      exp: 100,
      silver: 50,
      items: ['health_potion_small'],
    },
    status: QuestStatus.NOT_STARTED,
    dialogueId: 'village_elder_quest',
    completeDialogueId: 'village_elder_complete',
  },

  // 支线任务1：采集草药
  side_collect_herbs: {
    id: 'side_collect_herbs',
    type: QuestType.SIDE,
    title: '采集草药',
    description: '商人需要一些草药来制作药品，帮助他收集草药。',
    objectives: [
      {
        id: 'collect_herbs',
        type: QuestObjectiveType.COLLECT_ITEMS,
        description: '收集草药',
        target: 'herb',
        current: 0,
        required: 5,
        completed: false,
      },
    ],
    rewards: {
      exp: 50,
      silver: 30,
      items: ['energy_pill'],
    },
    status: QuestStatus.NOT_STARTED,
    dialogueId: 'merchant_quest',
    completeDialogueId: 'merchant_complete',
  },

  // 主线任务2：学习武功
  main_learn_skills: {
    id: 'main_learn_skills',
    type: QuestType.MAIN,
    title: '学习武功',
    description: '使用三种不同的技能来熟悉武学招式。',
    objectives: [
      {
        id: 'use_dragon_palm',
        type: QuestObjectiveType.USE_SKILL,
        description: '使用降龙掌',
        target: 'dragon_palm',
        current: 0,
        required: 1,
        completed: false,
      },
      {
        id: 'use_lingbo_step',
        type: QuestObjectiveType.USE_SKILL,
        description: '使用凌波微步',
        target: 'lingbo_step',
        current: 0,
        required: 1,
        completed: false,
      },
      {
        id: 'use_sword_qi',
        type: QuestObjectiveType.USE_SKILL,
        description: '使用剑气纵横',
        target: 'sword_qi',
        current: 0,
        required: 1,
        completed: false,
      },
    ],
    rewards: {
      exp: 80,
      silver: 40,
    },
    status: QuestStatus.NOT_STARTED,
    prerequisiteQuests: ['main_clear_village'],
  },

  // 支线任务2：拜访NPC
  side_meet_npcs: {
    id: 'side_meet_npcs',
    type: QuestType.SIDE,
    title: '熟悉村庄',
    description: '与村庄中的村民和商人交谈，了解这里的情况。',
    objectives: [
      {
        id: 'talk_to_villager',
        type: QuestObjectiveType.TALK_TO_NPC,
        description: '与村民交谈',
        target: 'villager',
        current: 0,
        required: 1,
        completed: false,
      },
      {
        id: 'talk_to_merchant',
        type: QuestObjectiveType.TALK_TO_NPC,
        description: '与商人交谈',
        target: 'merchant',
        current: 0,
        required: 1,
        completed: false,
      },
    ],
    rewards: {
      exp: 30,
      silver: 20,
    },
    status: QuestStatus.NOT_STARTED,
  },
};
