// 物品类型枚举
export enum ItemType {
  CONSUMABLE = 'consumable', // 消耗品（丹药）
  WEAPON = 'weapon',         // 武器
  ARMOR = 'armor',           // 装备
  MATERIAL = 'material',     // 材料
}

// 物品稀有度
export enum ItemRarity {
  COMMON = 'common',       // 普通（白色）
  UNCOMMON = 'uncommon',   // 优秀（绿色）
  RARE = 'rare',           // 稀有（蓝色）
  EPIC = 'epic',           // 史诗（紫色）
  LEGENDARY = 'legendary', // 传说（橙色）
}

// 装备部位
export enum EquipSlot {
  WEAPON = 'weapon',     // 武器
  HEAD = 'head',         // 头部
  BODY = 'body',         // 身体
  LEGS = 'legs',         // 腿部
  ACCESSORY = 'accessory', // 饰品
}

// 物品效果
export interface ItemEffect {
  type: 'heal' | 'energy' | 'buff' | 'damage';
  value: number;
  duration?: number; // 持续时间（秒）
}

// 物品属性
export interface ItemStats {
  attack?: number;
  defense?: number;
  health?: number;
  energy?: number;
  speed?: number;
}

// 物品基础接口
export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  stackable: boolean;
  maxStack: number;
  price: number;
  effect?: ItemEffect;
  stats?: ItemStats;
  equipSlot?: EquipSlot;
}

// 背包物品（包含数量）
export interface InventoryItem {
  item: Item;
  quantity: number;
}

// 装备槽
export interface Equipment {
  weapon?: Item;
  head?: Item;
  body?: Item;
  legs?: Item;
  accessory?: Item;
}
