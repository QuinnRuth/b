// 元素类型枚举
export enum ElementType {
  FIRE = 'fire',      // 火 - 高伤害
  WATER = 'water',    // 水 - 治疗和控制
  THUNDER = 'thunder', // 雷 - 连击和速度
  EARTH = 'earth',    // 土 - 防御和护盾
}

// 元素反应类型
export enum ElementReaction {
  VAPORIZE = 'vaporize',     // 蒸发 (火 + 水) - 超高伤害
  OVERLOAD = 'overload',     // 超载 (火 + 雷) - 范围爆炸
  ELECTRO_CHARGED = 'electro_charged', // 感电 (水 + 雷) - 持续伤害
  CRYSTALLIZE = 'crystallize', // 结晶 (任何 + 土) - 护盾
  MELT = 'melt',             // 融化 (冰 + 火) - 高伤害
  SWIRL = 'swirl',           // 扩散 - 元素扩散
}

// 元素配置
export interface ElementConfig {
  type: ElementType;
  name: string;
  color: number; // THREE.js 颜色
  icon: string;
  description: string;
  baseDamageMultiplier: number; // 基础伤害倍率
}

// 元素状态 (附着在敌人身上)
export interface ElementStatus {
  element: ElementType;
  duration: number; // 持续时间(秒)
  strength: number; // 强度 (1-3)
  appliedAt: number; // 应用时间
}

// 角色元素属性
export interface CharacterElement {
  elementType: ElementType;
  elementMastery: number; // 元素精通 (影响反应伤害)
  burstEnergy: number;    // 当前爆发能量
  maxBurstEnergy: number; // 最大爆发能量
  burstDamageMultiplier: number; // 爆发伤害倍率
}

// 元素反应结果
export interface ElementReactionResult {
  reaction: ElementReaction;
  damage: number;
  triggerElement: ElementType;
  targetElement: ElementType;
  position: { x: number; y: number; z: number };
}

// 元素数据库
export const ELEMENT_CONFIGS: Record<ElementType, ElementConfig> = {
  [ElementType.FIRE]: {
    type: ElementType.FIRE,
    name: '火',
    color: 0xff4500,
    icon: '🔥',
    description: '造成高额火焰伤害，擅长输出',
    baseDamageMultiplier: 1.3,
  },
  [ElementType.WATER]: {
    type: ElementType.WATER,
    name: '水',
    color: 0x1e90ff,
    icon: '💧',
    description: '提供治疗和控制效果',
    baseDamageMultiplier: 1.0,
  },
  [ElementType.THUNDER]: {
    type: ElementType.THUNDER,
    name: '雷',
    color: 0x9370db,
    icon: '⚡',
    description: '快速连击，提升攻击速度',
    baseDamageMultiplier: 1.2,
  },
  [ElementType.EARTH]: {
    type: ElementType.EARTH,
    name: '土',
    color: 0xdaa520,
    icon: '🪨',
    description: '强大的防御和护盾能力',
    baseDamageMultiplier: 0.9,
  },
};

// 元素反应伤害计算
export function calculateElementReaction(
  triggerElement: ElementType,
  targetElement: ElementType,
  baseDamage: number,
  elementMastery: number
): ElementReactionResult | null {
  let reaction: ElementReaction | null = null;
  let damageMultiplier = 1.0;

  // 计算元素精通加成
  const masteryBonus = 1 + (elementMastery / 100);

  // 判断元素反应
  if (
    (triggerElement === ElementType.FIRE && targetElement === ElementType.WATER) ||
    (triggerElement === ElementType.WATER && targetElement === ElementType.FIRE)
  ) {
    reaction = ElementReaction.VAPORIZE;
    damageMultiplier = 2.0 * masteryBonus;
  } else if (
    (triggerElement === ElementType.FIRE && targetElement === ElementType.THUNDER) ||
    (triggerElement === ElementType.THUNDER && targetElement === ElementType.FIRE)
  ) {
    reaction = ElementReaction.OVERLOAD;
    damageMultiplier = 1.5 * masteryBonus;
  } else if (
    (triggerElement === ElementType.WATER && targetElement === ElementType.THUNDER) ||
    (triggerElement === ElementType.THUNDER && targetElement === ElementType.WATER)
  ) {
    reaction = ElementReaction.ELECTRO_CHARGED;
    damageMultiplier = 1.3 * masteryBonus;
  } else if (targetElement === ElementType.EARTH || triggerElement === ElementType.EARTH) {
    reaction = ElementReaction.CRYSTALLIZE;
    damageMultiplier = 0.8; // 结晶主要提供护盾，不增加伤害
  }

  if (reaction) {
    return {
      reaction,
      damage: Math.floor(baseDamage * damageMultiplier),
      triggerElement,
      targetElement,
      position: { x: 0, y: 0, z: 0 },
    };
  }

  return null;
}

// 元素反应视觉效果配置
export const REACTION_VISUAL_EFFECTS: Record<ElementReaction, {
  particleColor: number;
  particleCount: number;
  explosionRadius: number;
  shakeIntensity: number;
}> = {
  [ElementReaction.VAPORIZE]: {
    particleColor: 0xff6347,
    particleCount: 80,
    explosionRadius: 5,
    shakeIntensity: 0.5,
  },
  [ElementReaction.OVERLOAD]: {
    particleColor: 0xff8c00,
    particleCount: 100,
    explosionRadius: 8,
    shakeIntensity: 0.8,
  },
  [ElementReaction.ELECTRO_CHARGED]: {
    particleColor: 0xee82ee,
    particleCount: 60,
    explosionRadius: 4,
    shakeIntensity: 0.3,
  },
  [ElementReaction.CRYSTALLIZE]: {
    particleColor: 0xffd700,
    particleCount: 40,
    explosionRadius: 3,
    shakeIntensity: 0.2,
  },
  [ElementReaction.MELT]: {
    particleColor: 0xff4500,
    particleCount: 70,
    explosionRadius: 6,
    shakeIntensity: 0.6,
  },
  [ElementReaction.SWIRL]: {
    particleColor: 0x7fffd4,
    particleCount: 50,
    explosionRadius: 7,
    shakeIntensity: 0.4,
  },
};
