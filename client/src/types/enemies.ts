import * as THREE from 'three';

// 敌人类型
export enum EnemyType {
  SWORDSMAN = 'swordsman',   // 剑客
  SPEARMAN = 'spearman',     // 枪兵
  ARCHER = 'archer',         // 弓箭手
  ELITE = 'elite',           // 精英
  BOSS = 'boss',             // Boss
}

// 敌人AI状态
export enum EnemyAIState {
  IDLE = 'idle',         // 待机
  PATROL = 'patrol',     // 巡逻
  CHASE = 'chase',       // 追逐
  ATTACK = 'attack',     // 攻击
  RETREAT = 'retreat',   // 撤退
  DEAD = 'dead',         // 死亡
}

// Boss阶段
export interface BossPhase {
  healthThreshold: number;  // 触发阈段的生命值百分比
  attackPower: number;      // 攻击力倍数
  moveSpeed: number;        // 移动速度倍数
  specialAbility?: string;  // 特殊能力
}

// 敌人配置
export interface EnemyConfig {
  type: EnemyType;
  name: string;
  maxHealth: number;
  attack: number;
  defense: number;
  moveSpeed: number;
  attackRange: number;
  detectionRange: number;
  color: number;
  size: { width: number; height: number; depth: number };
  dropItems?: string[];     // 掉落物品ID
  isBoss?: boolean;
  bossPhases?: BossPhase[];
}

// 敌人实例
export interface Enemy {
  id: string;
  config: EnemyConfig;
  group: THREE.Group;
  health: number;
  aiState: EnemyAIState;
  patrolPoints: THREE.Vector3[];
  currentPatrolIndex: number;
  attackCooldown: number;
  currentBossPhase?: number;
}

// 预定义敌人配置
export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  swordsman: {
    type: EnemyType.SWORDSMAN,
    name: '剑客',
    maxHealth: 100,
    attack: 10,
    defense: 5,
    moveSpeed: 0.05,
    attackRange: 3,
    detectionRange: 15,
    color: 0xff4444,
    size: { width: 1, height: 2, depth: 1 },
    dropItems: ['health_potion_small', 'iron_ore'],
  },
  spearman: {
    type: EnemyType.SPEARMAN,
    name: '枪兵',
    maxHealth: 120,
    attack: 15,
    defense: 3,
    moveSpeed: 0.04,
    attackRange: 4,
    detectionRange: 18,
    color: 0xff8844,
    size: { width: 1, height: 2, depth: 1 },
    dropItems: ['health_potion_small', 'energy_potion_small'],
  },
  archer: {
    type: EnemyType.ARCHER,
    name: '弓箭手',
    maxHealth: 80,
    attack: 12,
    defense: 2,
    moveSpeed: 0.06,
    attackRange: 10,
    detectionRange: 20,
    color: 0x44ff44,
    size: { width: 0.8, height: 1.8, depth: 0.8 },
    dropItems: ['energy_potion_small'],
  },
  elite: {
    type: EnemyType.ELITE,
    name: '精英武者',
    maxHealth: 200,
    attack: 25,
    defense: 15,
    moveSpeed: 0.07,
    attackRange: 3,
    detectionRange: 20,
    color: 0x8844ff,
    size: { width: 1.2, height: 2.2, depth: 1.2 },
    dropItems: ['health_potion_medium', 'energy_potion_medium', 'iron_sword'],
  },
  boss_litianxiong: {
    type: EnemyType.BOSS,
    name: '厉天雄',
    maxHealth: 500,
    attack: 30,
    defense: 20,
    moveSpeed: 0.08,
    attackRange: 5,
    detectionRange: 30,
    color: 0xff0000,
    size: { width: 1.5, height: 2.5, depth: 1.5 },
    isBoss: true,
    bossPhases: [
      {
        healthThreshold: 100,
        attackPower: 1.0,
        moveSpeed: 1.0,
      },
      {
        healthThreshold: 66,
        attackPower: 1.3,
        moveSpeed: 1.2,
        specialAbility: '剑气纵横',
      },
      {
        healthThreshold: 33,
        attackPower: 1.6,
        moveSpeed: 1.5,
        specialAbility: '狂暴模式',
      },
    ],
    dropItems: ['dragon_slayer', 'golden_armor', 'spirit_stone'],
  },
};
