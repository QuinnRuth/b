import type { Dialogue } from '../components/DialogueBox';

// NPC对话数据库
export const DIALOGUES: Record<string, Dialogue> = {
  // 开场对话
  intro_1: {
    id: 'intro_1',
    speaker: '旁白',
    text: '江湖风云变幻，天煞教横行无忌。你作为苍山剑派的弟子，肩负着维护武林正义的使命...',
    options: [
      { text: '我已准备好', nextDialogueId: 'intro_2' },
    ],
  },
  intro_2: {
    id: 'intro_2',
    speaker: '掌门',
    avatar: '👴',
    text: '孩子，前方有天煞教的余孽在作恶。去吧，用你的武艺惩奸除恶！',
    options: [
      { text: '是，掌门！' },
    ],
  },

  // NPC对话 - 村民（任务发布者）
  villager_1: {
    id: 'villager_1',
    speaker: '村民',
    avatar: '👨',
    text: '少侠，前方有天煞教的恶徒在作恶，还请小心！如果你能帮我们清除这些盗匙，村民们将感激不尽！',
    options: [
      { text: '接受任务：清理村庄', action: () => (window as any).acceptQuest?.('main_clear_village') },
      { text: '他们有多少人？', nextDialogueId: 'villager_2' },
      { text: '我再考虑考虑' },
    ],
  },
  villager_2: {
    id: 'villager_2',
    speaker: '村民',
    avatar: '👨',
    text: '我看到至少有四五个，个个身手不凡。少侠务必小心！',
    options: [
      { text: '我会小心的' },
    ],
  },

  // NPC对话 - 商人
  merchant_1: {
    id: 'merchant_1',
    speaker: '行商',
    avatar: '🧔',
    text: '少侠，需要补给吗？我这里有上好的丹药和装备！',
    options: [
      { text: '看看你的货物', nextDialogueId: 'merchant_shop' },
      { text: '不用了，谢谢' },
    ],
  },
  merchant_shop: {
    id: 'merchant_shop',
    speaker: '行商',
    avatar: '🧔',
    text: '这些都是好东西，童叟无欺！（商店功能开发中...）',
    options: [
      { text: '下次再来' },
    ],
  },

  // 战斗前对话
  before_battle_1: {
    id: 'before_battle_1',
    speaker: '天煞教徒',
    avatar: '😈',
    text: '哼，又来一个送死的！',
    options: [
      { text: '休要猩狂！' },
    ],
  },

  // 战斗胜利对话
  after_victory_1: {
    id: 'after_victory_1',
    speaker: '旁白',
    text: '你成功击败了天煞教的恶徒，为民除害！',
    options: [
      { text: '继续前进' },
    ],
  },

  // 任务对话
  quest_start_1: {
    id: 'quest_start_1',
    speaker: '掌门',
    avatar: '👴',
    text: '近日天煞教在附近村庄作恶，你去调查一下，务必将他们绳之以法！',
    options: [
      { text: '领命！' },
    ],
  },
  quest_complete_1: {
    id: 'quest_complete_1',
    speaker: '掌门',
    avatar: '👴',
    text: '干得好！你为武林除了一大害。这是你的奖励。',
    options: [
      { text: '多谢掌门！' },
    ],
  },
};

// NPC数据
export interface NPCData {
  id: string;
  name: string;
  avatar: string;
  position: { x: number; y: number; z: number };
  dialogueId: string;
  color: number;
}

export const NPCS: NPCData[] = [
  {
    id: 'npc_villager',
    name: '村民',
    avatar: '👨',
    position: { x: -15, y: 0, z: 10 },
    dialogueId: 'villager_1',
    color: 0x4444ff,
  },
  {
    id: 'npc_merchant',
    name: '行商',
    avatar: '🧔',
    position: { x: 15, y: 0, z: -10 },
    dialogueId: 'merchant_1',
    color: 0xffaa00,
  },
];
