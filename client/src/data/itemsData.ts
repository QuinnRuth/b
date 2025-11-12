import { Item, ItemType, ItemRarity, EquipSlot } from '../types/items';

export const ITEMS_DATABASE: Record<string, Item> = {
  // ===== 丹药类 =====
  health_potion_small: {
    id: 'health_potion_small',
    name: '小还丹',
    description: '恢复50点生命值',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.COMMON,
    icon: '🔴',
    stackable: true,
    maxStack: 99,
    price: 10,
    effect: {
      type: 'heal',
      value: 50,
    },
  },
  health_potion_medium: {
    id: 'health_potion_medium',
    name: '大还丹',
    description: '恢复100点生命值',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.UNCOMMON,
    icon: '🔴',
    stackable: true,
    maxStack: 99,
    price: 30,
    effect: {
      type: 'heal',
      value: 100,
    },
  },
  energy_potion_small: {
    id: 'energy_potion_small',
    name: '小回气丹',
    description: '恢复50点内力',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.COMMON,
    icon: '🔵',
    stackable: true,
    maxStack: 99,
    price: 10,
    effect: {
      type: 'energy',
      value: 50,
    },
  },
  energy_potion_medium: {
    id: 'energy_potion_medium',
    name: '大回气丹',
    description: '恢复100点内力',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.UNCOMMON,
    icon: '🔵',
    stackable: true,
    maxStack: 99,
    price: 30,
    effect: {
      type: 'energy',
      value: 100,
    },
  },
  strength_pill: {
    id: 'strength_pill',
    name: '大力丸',
    description: '30秒内攻击力+20',
    type: ItemType.CONSUMABLE,
    rarity: ItemRarity.RARE,
    icon: '💊',
    stackable: true,
    maxStack: 50,
    price: 50,
    effect: {
      type: 'buff',
      value: 20,
      duration: 30,
    },
  },

  // ===== 武器类 =====
  wooden_sword: {
    id: 'wooden_sword',
    name: '木剑',
    description: '普通的木制练习剑',
    type: ItemType.WEAPON,
    rarity: ItemRarity.COMMON,
    icon: '🗡️',
    stackable: false,
    maxStack: 1,
    price: 20,
    equipSlot: EquipSlot.WEAPON,
    stats: {
      attack: 10,
    },
  },
  iron_sword: {
    id: 'iron_sword',
    name: '铁剑',
    description: '锋利的铁制长剑',
    type: ItemType.WEAPON,
    rarity: ItemRarity.UNCOMMON,
    icon: '⚔️',
    stackable: false,
    maxStack: 1,
    price: 100,
    equipSlot: EquipSlot.WEAPON,
    stats: {
      attack: 25,
    },
  },
  blue_steel_sword: {
    id: 'blue_steel_sword',
    name: '青钢剑',
    description: '名匠打造的宝剑，削铁如泥',
    type: ItemType.WEAPON,
    rarity: ItemRarity.RARE,
    icon: '⚔️',
    stackable: false,
    maxStack: 1,
    price: 500,
    equipSlot: EquipSlot.WEAPON,
    stats: {
      attack: 50,
      speed: 5,
    },
  },
  dragon_slayer: {
    id: 'dragon_slayer',
    name: '屠龙刀',
    description: '传说中的神兵利器，武林至宝',
    type: ItemType.WEAPON,
    rarity: ItemRarity.LEGENDARY,
    icon: '🔪',
    stackable: false,
    maxStack: 1,
    price: 5000,
    equipSlot: EquipSlot.WEAPON,
    stats: {
      attack: 100,
      health: 50,
    },
  },

  // ===== 装备类 =====
  cloth_armor: {
    id: 'cloth_armor',
    name: '布衣',
    description: '普通的布制衣服',
    type: ItemType.ARMOR,
    rarity: ItemRarity.COMMON,
    icon: '👕',
    stackable: false,
    maxStack: 1,
    price: 15,
    equipSlot: EquipSlot.BODY,
    stats: {
      defense: 5,
    },
  },
  leather_armor: {
    id: 'leather_armor',
    name: '皮甲',
    description: '轻便的皮制护甲',
    type: ItemType.ARMOR,
    rarity: ItemRarity.UNCOMMON,
    icon: '🥋',
    stackable: false,
    maxStack: 1,
    price: 80,
    equipSlot: EquipSlot.BODY,
    stats: {
      defense: 15,
      speed: 3,
    },
  },
  golden_armor: {
    id: 'golden_armor',
    name: '黄金战甲',
    description: '金光闪闪的重型护甲',
    type: ItemType.ARMOR,
    rarity: ItemRarity.EPIC,
    icon: '🛡️',
    stackable: false,
    maxStack: 1,
    price: 1000,
    equipSlot: EquipSlot.BODY,
    stats: {
      defense: 40,
      health: 30,
    },
  },

  // ===== 材料类 =====
  iron_ore: {
    id: 'iron_ore',
    name: '铁矿石',
    description: '可用于锻造武器的矿石',
    type: ItemType.MATERIAL,
    rarity: ItemRarity.COMMON,
    icon: '⛏️',
    stackable: true,
    maxStack: 999,
    price: 5,
  },
  spirit_stone: {
    id: 'spirit_stone',
    name: '灵石',
    description: '蕴含灵气的宝石',
    type: ItemType.MATERIAL,
    rarity: ItemRarity.RARE,
    icon: '💎',
    stackable: true,
    maxStack: 999,
    price: 100,
  },
};

// 获取物品
export function getItem(itemId: string): Item | undefined {
  return ITEMS_DATABASE[itemId];
}

// 获取所有物品
export function getAllItems(): Item[] {
  return Object.values(ITEMS_DATABASE);
}

// 按类型获取物品
export function getItemsByType(type: ItemType): Item[] {
  return getAllItems().filter((item) => item.type === type);
}

// 按稀有度获取物品
export function getItemsByRarity(rarity: ItemRarity): Item[] {
  return getAllItems().filter((item) => item.rarity === rarity);
}
