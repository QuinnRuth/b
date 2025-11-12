// 技能类型
export enum SkillType {
  ATTACK = 'attack',     // 攻击技能
  BUFF = 'buff',         // 增益技能
  MOVEMENT = 'movement', // 移动技能
  SPECIAL = 'special',   // 特殊技能
}

// 技能配置
export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  icon: string;
  energyCost: number;
  cooldown: number;        // 冷却时间（秒）
  damage?: number;
  range?: number;
  duration?: number;       // 持续时间（秒）
  effect?: {
    type: 'damage' | 'speed' | 'defense' | 'teleport';
    value: number;
  };
  particleColor?: number;
}

// 技能实例
export interface Skill {
  config: SkillConfig;
  currentCooldown: number;
  isActive: boolean;
}

// 预定义技能
export const SKILLS_DATABASE: Record<string, SkillConfig> = {
  // 降龙掌
  dragon_palm: {
    id: 'dragon_palm',
    name: '降龙掌',
    description: '强力的掌法攻击，造成大量伤害',
    type: SkillType.ATTACK,
    icon: '👊',
    energyCost: 30,
    cooldown: 5,
    damage: 50,
    range: 5,
    particleColor: 0xffd700,
    effect: {
      type: 'damage',
      value: 50,
    },
  },

  // 凌波微步
  lingbo_step: {
    id: 'lingbo_step',
    name: '凌波微步',
    description: '瞬间移动到前方，闪避敌人攻击',
    type: SkillType.MOVEMENT,
    icon: '💨',
    energyCost: 20,
    cooldown: 3,
    range: 10,
    particleColor: 0x00ffff,
    effect: {
      type: 'teleport',
      value: 10,
    },
  },

  // 剑气纵横
  sword_qi: {
    id: 'sword_qi',
    name: '剑气纵横',
    description: '发射强大的剑气，远程攻击敌人',
    type: SkillType.ATTACK,
    icon: '⚔️',
    energyCost: 25,
    cooldown: 4,
    damage: 35,
    range: 15,
    particleColor: 0x00ffff,
    effect: {
      type: 'damage',
      value: 35,
    },
  },

  // 金钟罩
  golden_bell: {
    id: 'golden_bell',
    name: '金钟罩',
    description: '提升防御力，减少受到的伤害',
    type: SkillType.BUFF,
    icon: '🛡️',
    energyCost: 40,
    cooldown: 10,
    duration: 10,
    particleColor: 0xffd700,
    effect: {
      type: 'defense',
      value: 30,
    },
  },

  // 疾风步
  swift_step: {
    id: 'swift_step',
    name: '疾风步',
    description: '大幅提升移动速度',
    type: SkillType.BUFF,
    icon: '🌪️',
    energyCost: 15,
    cooldown: 6,
    duration: 8,
    particleColor: 0x00ff00,
    effect: {
      type: 'speed',
      value: 2,
    },
  },
};
