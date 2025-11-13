import { ElementType, CharacterElement } from './elements';

// 角色配置接口
export interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  element: CharacterElement;
  baseStats: {
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
  };
  skills: {
    normal: CharacterSkill;
    special: CharacterSkill;
    burst: CharacterSkill;
  };
  color: number; // 角色主题色
  model: {
    bodyColor: number;
    weaponType: 'sword' | 'spear' | 'bow' | 'catalyst';
  };
}

// 角色技能
export interface CharacterSkill {
  id: string;
  name: string;
  description: string;
  damage: number;
  energyCost: number;
  cooldown: number; // 冷却时间(秒)
  elementalApplicationStrength: number; // 元素附着强度 (1-3)
  range: number; // 技能范围
  effects?: SkillEffect[];
}

// 技能效果
export interface SkillEffect {
  type: 'damage' | 'heal' | 'shield' | 'buff' | 'debuff';
  value: number;
  duration?: number; // 持续时间(秒)
}

// 4个可玩角色定义
export const PLAYABLE_CHARACTERS: Record<string, Character> = {
  fire_swordsman: {
    id: 'fire_swordsman',
    name: '烈焰剑圣',
    title: '炎之劫',
    description: '掌握火焰之力的剑术大师，以强大的爆发伤害著称',
    element: {
      elementType: ElementType.FIRE,
      elementMastery: 80,
      burstEnergy: 0,
      maxBurstEnergy: 80,
      burstDamageMultiplier: 2.5,
    },
    baseStats: {
      maxHealth: 120,
      attack: 45,
      defense: 25,
      speed: 8,
    },
    skills: {
      normal: {
        id: 'fire_slash',
        name: '烈焰斩',
        description: '挥舞火焰之剑进行普通攻击',
        damage: 30,
        energyCost: 0,
        cooldown: 0,
        elementalApplicationStrength: 1,
        range: 5,
      },
      special: {
        id: 'flame_wheel',
        name: '炎轮斩',
        description: '释放旋转的火焰轮，对周围敌人造成火焰伤害',
        damage: 60,
        energyCost: 25,
        cooldown: 6,
        elementalApplicationStrength: 2,
        range: 8,
      },
      burst: {
        id: 'inferno_burst',
        name: '炼狱爆发',
        description: '召唤火焰风暴，对大范围敌人造成巨额伤害',
        damage: 150,
        energyCost: 80,
        cooldown: 0,
        elementalApplicationStrength: 3,
        range: 15,
        effects: [
          {
            type: 'damage',
            value: 150,
            duration: 0,
          },
        ],
      },
    },
    color: 0xff4500,
    model: {
      bodyColor: 0xff6347,
      weaponType: 'sword',
    },
  },

  water_healer: {
    id: 'water_healer',
    name: '碧波仙子',
    title: '水之韵',
    description: '精通水系法术的治疗者，能够治愈队友并控制敌人',
    element: {
      elementType: ElementType.WATER,
      elementMastery: 100,
      burstEnergy: 0,
      maxBurstEnergy: 60,
      burstDamageMultiplier: 1.8,
    },
    baseStats: {
      maxHealth: 100,
      attack: 30,
      defense: 20,
      speed: 7,
    },
    skills: {
      normal: {
        id: 'water_bolt',
        name: '水箭术',
        description: '发射水箭攻击敌人',
        damage: 25,
        energyCost: 0,
        cooldown: 0,
        elementalApplicationStrength: 1,
        range: 10,
      },
      special: {
        id: 'healing_spring',
        name: '治疗之泉',
        description: '召唤治疗之泉，恢复生命值',
        damage: 0,
        energyCost: 30,
        cooldown: 8,
        elementalApplicationStrength: 1,
        range: 0,
        effects: [
          {
            type: 'heal',
            value: 40,
            duration: 0,
          },
        ],
      },
      burst: {
        id: 'tidal_wave',
        name: '潮汐之怒',
        description: '释放巨大的潮汐波，对敌人造成水元素伤害并冻结',
        damage: 120,
        energyCost: 60,
        cooldown: 0,
        elementalApplicationStrength: 3,
        range: 12,
        effects: [
          {
            type: 'damage',
            value: 120,
            duration: 0,
          },
        ],
      },
    },
    color: 0x1e90ff,
    model: {
      bodyColor: 0x4169e1,
      weaponType: 'catalyst',
    },
  },

  thunder_assassin: {
    id: 'thunder_assassin',
    name: '雷霆刺客',
    title: '电光影',
    description: '如闪电般迅捷的刺客，擅长快速连击',
    element: {
      elementType: ElementType.THUNDER,
      elementMastery: 90,
      burstEnergy: 0,
      maxBurstEnergy: 70,
      burstDamageMultiplier: 2.2,
    },
    baseStats: {
      maxHealth: 90,
      attack: 40,
      defense: 15,
      speed: 12,
    },
    skills: {
      normal: {
        id: 'lightning_strike',
        name: '雷霆突刺',
        description: '快速突刺攻击',
        damage: 28,
        energyCost: 0,
        cooldown: 0,
        elementalApplicationStrength: 1,
        range: 6,
      },
      special: {
        id: 'thunder_dash',
        name: '雷遁',
        description: '化身闪电快速移动并攻击',
        damage: 55,
        energyCost: 20,
        cooldown: 5,
        elementalApplicationStrength: 2,
        range: 15,
        effects: [
          {
            type: 'buff',
            value: 1.5, // 速度提升倍率
            duration: 3,
          },
        ],
      },
      burst: {
        id: 'lightning_storm',
        name: '雷暴降临',
        description: '召唤雷暴对区域内所有敌人造成持续伤害',
        damage: 140,
        energyCost: 70,
        cooldown: 0,
        elementalApplicationStrength: 3,
        range: 10,
        effects: [
          {
            type: 'damage',
            value: 20,
            duration: 5, // 持续5秒的雷电伤害
          },
        ],
      },
    },
    color: 0x9370db,
    model: {
      bodyColor: 0x8a2be2,
      weaponType: 'sword',
    },
  },

  earth_guardian: {
    id: 'earth_guardian',
    name: '岩石守护者',
    title: '地之盾',
    description: '坚若磐石的守护者，提供强大的防护',
    element: {
      elementType: ElementType.EARTH,
      elementMastery: 70,
      burstEnergy: 0,
      maxBurstEnergy: 90,
      burstDamageMultiplier: 1.5,
    },
    baseStats: {
      maxHealth: 150,
      attack: 35,
      defense: 40,
      speed: 6,
    },
    skills: {
      normal: {
        id: 'stone_strike',
        name: '岩石重击',
        description: '用沉重的岩石武器攻击',
        damage: 35,
        energyCost: 0,
        cooldown: 0,
        elementalApplicationStrength: 1,
        range: 4,
      },
      special: {
        id: 'stone_shield',
        name: '岩之壁',
        description: '创造岩石护盾吸收伤害',
        damage: 0,
        energyCost: 25,
        cooldown: 10,
        elementalApplicationStrength: 1,
        range: 0,
        effects: [
          {
            type: 'shield',
            value: 60,
            duration: 8,
          },
        ],
      },
      burst: {
        id: 'earthquake',
        name: '大地震颤',
        description: '引发地震，对范围内敌人造成伤害并晕眩',
        damage: 130,
        energyCost: 90,
        cooldown: 0,
        elementalApplicationStrength: 3,
        range: 12,
        effects: [
          {
            type: 'damage',
            value: 130,
            duration: 0,
          },
          {
            type: 'debuff',
            value: 0.5, // 减速50%
            duration: 4,
          },
        ],
      },
    },
    color: 0xdaa520,
    model: {
      bodyColor: 0xcd853f,
      weaponType: 'spear',
    },
  },
};

// 获取角色列表
export function getCharacterList(): Character[] {
  return Object.values(PLAYABLE_CHARACTERS);
}

// 根据ID获取角色
export function getCharacterById(id: string): Character | undefined {
  return PLAYABLE_CHARACTERS[id];
}
