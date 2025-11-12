import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer, EffectPass, RenderPass, SMAAEffect, VignetteEffect, BloomEffect, ToneMappingEffect } from 'postprocessing';
import Inventory from './Inventory';
import type { Item, InventoryItem, Equipment } from '../types/items';
import { ITEMS_DATABASE } from '../data/itemsData';
import type { EnemyConfig } from '../types/enemies';
import { SKILLS_DATABASE, type Skill } from '../types/skills';
import DamageNumber, { type DamageNumberData } from './DamageNumber';
import DialogueBox, { type Dialogue } from './DialogueBox';
import { DIALOGUES, NPCS, type NPCData } from '../data/dialogues';
import { QUESTS } from '../data/questsData';
import type { ActiveQuest, Quest, QuestStatus, QuestObjectiveType } from '../types/quests';
import QuestTracker from './QuestTracker';

// 敌人AI状态
enum EnemyAIState {
  PATROL,
  CHASE,
  ATTACK,
  DEAD,
}

// 敌人实例接口
interface EnemyInstance {
  id: string;
  config: EnemyConfig;
  group: THREE.Group;
  mesh: THREE.Mesh;
  health: number;
  aiState: EnemyAIState;
  patrolIndex: number;
  patrolPoints: THREE.Vector3[];
  lastAttackTime: number;
}

// 敌人配置
import { ENEMY_CONFIGS as IMPORTED_ENEMY_CONFIGS } from '../types/enemies';

const ENEMY_CONFIGS = IMPORTED_ENEMY_CONFIGS;

// 技能配置
const SKILL_CONFIGS = SKILLS_DATABASE;

export default function WuxiaGameV3() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState(0);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [maxEnergy, setMaxEnergy] = useState(100);
  const [score, setScore] = useState(0);
  const [gameMessage, setGameMessage] = useState('');
  
  // 背包系统
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { item: ITEMS_DATABASE.health_potion_small, quantity: 3 },
    { item: ITEMS_DATABASE.energy_potion_small, quantity: 2 },
  ]);
  const [equipment, setEquipment] = useState<Equipment>({});
  const [showInventory, setShowInventory] = useState(false);
  
  // 敌人系统
  const [enemies, setEnemies] = useState([
    { id: 'enemy1', config: ENEMY_CONFIGS.swordsman, health: ENEMY_CONFIGS.swordsman.maxHealth },
    { id: 'enemy2', config: ENEMY_CONFIGS.spearman, health: ENEMY_CONFIGS.spearman.maxHealth },
    { id: 'enemy3', config: ENEMY_CONFIGS.archer, health: ENEMY_CONFIGS.archer.maxHealth },
    { id: 'enemy4', config: ENEMY_CONFIGS.elite, health: ENEMY_CONFIGS.elite.maxHealth },
  ]);
  
  // 技能系统
  const [skills, setSkills] = useState<Skill[]>([
    { config: SKILL_CONFIGS.dragon_palm, currentCooldown: 0, isActive: false },
    { config: SKILL_CONFIGS.lingbo_step, currentCooldown: 0, isActive: false },
    { config: SKILL_CONFIGS.sword_qi, currentCooldown: 0, isActive: false },
  ]);
  
  // 时间系统
  const [timeOfDay, setTimeOfDay] = useState(0.5); // 0=午夜, 0.5=中午, 1=午夜
  
  // 伤害数字系统
  const [damageNumbers, setDamageNumbers] = useState<DamageNumberData[]>([]);
  
  // 对话系统
  const [currentDialogue, setCurrentDialogue] = useState<Dialogue | null>(null);
  const [npcs, setNpcs] = useState<NPCData[]>(NPCS);
  
  // 连击系统
  const [comboCount, setComboCount] = useState(0);
  const [lastHitTime, setLastHitTime] = useState(0);
  
  // 任务系统
  const [activeQuests, setActiveQuests] = useState<ActiveQuest[]>([]);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerExp, setPlayerExp] = useState(0);
  const [silver, setSilver] = useState(200);
  
  // 背包操作
  const handleUseItem = (item: Item) => {
    if (item.type === 'consumable' && item.effect) {
      // 使用消耗品
      if (item.effect.type === 'heal') {
        setHealth((prev) => Math.min(prev + item.effect!.value, maxHealth));
      }
      if (item.effect.type === 'energy') {
        setEnergy((prev) => Math.min(prev + item.effect!.value, maxEnergy));
      }
      
      // 减少数量
      setInventory((prev) =>
        prev
          .map((i) =>
            i.item.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
          )
          .filter((i) => i.quantity > 0)
      );
      
      setGameMessage(`使用了${item.name}`);
      setTimeout(() => setGameMessage(''), 2000);
    } else if (item.type === 'weapon' || item.type === 'armor') {
      // 装备物品
      const equipSlot = item.type === 'weapon' ? 'weapon' : 'body';
      
      // 如果已有装备，卸下
      if (equipment[equipSlot]) {
        handleUnequipItem(equipSlot);
      }
      
      const newEquipment = { ...equipment, [equipSlot]: item };
      setEquipment(newEquipment);
      
      // 从背包移除
      setInventory((prev) =>
        prev
          .map((i) =>
            i.item.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
          )
          .filter((i) => i.quantity > 0)
      );
      
      // 应用属性加成
      if (item.stats) {
        if (item.stats.health) {
          const healthBonus = item.stats.health;
          setMaxHealth((prev) => prev + healthBonus);
          setHealth((prev) => prev + healthBonus);
        }
        if (item.stats.energy) {
          const energyBonus = item.stats.energy;
          setMaxEnergy((prev) => prev + energyBonus);
          setEnergy((prev) => prev + energyBonus);
        }
      }
      
      setGameMessage(`装备了${item.name}`);
      setTimeout(() => setGameMessage(''), 2000);
    }
  };
  
  const handleUnequipItem = (slot: string) => {
    const item = equipment[slot as keyof Equipment];
    if (!item) return;
    
    const newEquipment = { ...equipment };
    
    // 添加回背包
    setInventory((prev) => {
        const existing = prev.find((i) => i.item.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { item, quantity: 1 }];
      });
      
      // 移除属性加成
      if (item.stats) {
        if (item.stats.health) {
          const healthBonus = item.stats.health;
          setMaxHealth((prev) => prev - healthBonus);
          setHealth((prev) => Math.min(prev, maxHealth - healthBonus));
        }
        if (item.stats.energy) {
          const energyBonus = item.stats.energy;
          setMaxEnergy((prev) => prev - energyBonus);
          setEnergy((prev) => Math.min(prev, maxEnergy - energyBonus));
        }
      }
      
      delete newEquipment[slot as keyof Equipment];
      
      setGameMessage(`卸下了${item.name}`);
      setTimeout(() => setGameMessage(''), 2000);
      
      setEquipment(newEquipment);
  };
  
  // 任务管理函数
  const acceptQuest = (questId: string) => {
    const quest = QUESTS[questId];
    if (!quest) return;
    
    const activeQuest: ActiveQuest = {
      ...quest,
      status: 'in_progress' as QuestStatus,
      acceptedAt: Date.now(),
    };
    
    setActiveQuests((prev) => [...prev, activeQuest]);
    setGameMessage(`接受任务：${quest.title}`);
    setTimeout(() => setGameMessage(''), 2000);
  };
  
  const updateQuestProgress = (objectiveType: QuestObjectiveType, target: string, amount: number = 1) => {
    setActiveQuests((prev) =>
      prev.map((quest) => {
        if (quest.status !== 'in_progress') return quest;
        
        const updatedObjectives = quest.objectives.map((obj) => {
          if (obj.type === objectiveType && (obj.target === target || obj.target === 'any') && !obj.completed) {
            const newCurrent = Math.min(obj.current + amount, obj.required);
            return {
              ...obj,
              current: newCurrent,
              completed: newCurrent >= obj.required,
            };
          }
          return obj;
        });
        
        const allCompleted = updatedObjectives.every((obj) => obj.completed);
        
        return {
          ...quest,
          objectives: updatedObjectives,
          status: allCompleted ? ('completed' as QuestStatus) : quest.status,
        };
      })
    );
  };
  
  const claimQuestReward = (questId: string) => {
    const quest = activeQuests.find((q) => q.id === questId);
    if (!quest || quest.status !== 'completed') return;
    
    // 发放奖励
    if (quest.rewards.exp) {
      setPlayerExp((prev) => prev + quest.rewards.exp!);
    }
    if (quest.rewards.silver) {
      setSilver((prev) => prev + quest.rewards.silver!);
    }
    if (quest.rewards.items) {
      quest.rewards.items.forEach((itemId) => {
        const item = ITEMS_DATABASE[itemId];
        if (item) {
          setInventory((prev) => {
            const existing = prev.find((i) => i.item.id === itemId);
            if (existing) {
              return prev.map((i) =>
                i.item.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
              );
            }
            return [...prev, { item, quantity: 1 }];
          });
        }
      });
    }
    
    // 标记为已领取
    setActiveQuests((prev) =>
      prev.map((q) =>
        q.id === questId ? { ...q, status: 'claimed' as QuestStatus } : q
      )
    );
    
    setGameMessage(`完成任务：${quest.title}`);
    setTimeout(() => setGameMessage(''), 3000);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // 暴露任务函数到全局（供对话选项使用）
    (window as any).acceptQuest = acceptQuest;
    (window as any).claimQuestReward = claimQuestReward;
    
    // 开场对话
    setTimeout(() => {
      setCurrentDialogue(DIALOGUES.intro_1);
    }, 1000);

    // 场景设置
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xcccccc, 0.015); // 添加雾效

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    // 后处理
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // 水墨风格后处理
    const smaaEffect = new SMAAEffect();
    const vignetteEffect = new VignetteEffect({
      offset: 0.3,
      darkness: 0.5,
    });
    const bloomEffect = new BloomEffect({
      intensity: 0.3,
      luminanceThreshold: 0.6,
      luminanceSmoothing: 0.9,
    });
    const toneMappingEffect = new ToneMappingEffect();

    const effectPass = new EffectPass(
      camera,
      smaaEffect,
      vignetteEffect,
      bloomEffect,
      toneMappingEffect
    );
    composer.addPass(effectPass);

    // 动态天空盒
    const createSkybox = (time: number) => {
      const skyGeo = new THREE.SphereGeometry(500, 32, 32);
      
      // 根据时间计算天空颜色
      let topColor, bottomColor;
      if (time < 0.25) {
        // 夜间 -> 晨曦
        const t = time / 0.25;
        topColor = new THREE.Color().lerpColors(
          new THREE.Color(0x000033),
          new THREE.Color(0xff9966),
          t
        );
        bottomColor = new THREE.Color().lerpColors(
          new THREE.Color(0x000011),
          new THREE.Color(0xffcc99),
          t
        );
      } else if (time < 0.5) {
        // 晨曦 -> 中午
        const t = (time - 0.25) / 0.25;
        topColor = new THREE.Color().lerpColors(
          new THREE.Color(0xff9966),
          new THREE.Color(0x87CEEB),
          t
        );
        bottomColor = new THREE.Color().lerpColors(
          new THREE.Color(0xffcc99),
          new THREE.Color(0xffffff),
          t
        );
      } else if (time < 0.75) {
        // 中午 -> 黄昏
        const t = (time - 0.5) / 0.25;
        topColor = new THREE.Color().lerpColors(
          new THREE.Color(0x87CEEB),
          new THREE.Color(0xff6633),
          t
        );
        bottomColor = new THREE.Color().lerpColors(
          new THREE.Color(0xffffff),
          new THREE.Color(0xff9966),
          t
        );
      } else {
        // 黄昏 -> 夜间
        const t = (time - 0.75) / 0.25;
        topColor = new THREE.Color().lerpColors(
          new THREE.Color(0xff6633),
          new THREE.Color(0x000033),
          t
        );
        bottomColor = new THREE.Color().lerpColors(
          new THREE.Color(0xff9966),
          new THREE.Color(0x000011),
          t
        );
      }
      
      const skyMat = new THREE.ShaderMaterial({
        uniforms: {
          topColor: { value: topColor },
          bottomColor: { value: bottomColor },
          offset: { value: 33 },
          exponent: { value: 0.6 },
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
          }
        `,
        side: THREE.BackSide,
      });
      
      return new THREE.Mesh(skyGeo, skyMat);
    };
    
    const skybox = createSkybox(timeOfDay);
    scene.add(skybox);

    // 光照（根据时间调整）
    const updateLighting = (time: number) => {
      // 移除旧光源
      scene.children = scene.children.filter(
        (child) => !(child instanceof THREE.DirectionalLight || child instanceof THREE.AmbientLight || child instanceof THREE.HemisphereLight)
      );
      
      let ambientIntensity, directionalIntensity, lightColor;
      
      if (time < 0.25 || time > 0.75) {
        // 夜间
        ambientIntensity = 0.2;
        directionalIntensity = 0.3;
        lightColor = new THREE.Color(0x6666ff);
      } else if (time < 0.5) {
        // 早晨
        ambientIntensity = 0.5;
        directionalIntensity = 0.7;
        lightColor = new THREE.Color(0xffaa66);
      } else {
        // 下午/黄昏
        ambientIntensity = 0.6;
        directionalIntensity = 0.8;
        lightColor = new THREE.Color(0xffddaa);
      }
      
      const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(lightColor, directionalIntensity);
      directionalLight.position.set(50, 100, 50);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 500;
      directionalLight.shadow.camera.left = -100;
      directionalLight.shadow.camera.right = 100;
      directionalLight.shadow.camera.top = 100;
      directionalLight.shadow.camera.bottom = -100;
      scene.add(directionalLight);
      
      const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.3);
      scene.add(hemisphereLight);
    };
    
    updateLighting(timeOfDay);

    // 地面（带纹理）
    const groundGeo = new THREE.PlaneGeometry(200, 200, 50, 50);
    const vertices = groundGeo.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.sin(vertices[i] / 5) * Math.cos(vertices[i + 1] / 5) * 2;
    }
    groundGeo.computeVertexNormals();
    
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x8B7355,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 远景山体
    const createMountain = (x: number, z: number, scale: number) => {
      const mountainGeo = new THREE.ConeGeometry(scale * 20, scale * 40, 8);
      const mountainMat = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 1,
        fog: true,
      });
      const mountain = new THREE.Mesh(mountainGeo, mountainMat);
      mountain.position.set(x, scale * 20, z);
      mountain.receiveShadow = true;
      mountain.castShadow = true;
      return mountain;
    };
    
    scene.add(createMountain(-80, -100, 1.5));
    scene.add(createMountain(60, -120, 1.8));
    scene.add(createMountain(-100, -80, 1.2));
    scene.add(createMountain(90, -90, 1.6));

    // 树木
    for (let i = 0; i < 30; i++) {
      const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 6, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);

      const leavesGeo = new THREE.SphereGeometry(3, 8, 8);
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.y = 5;

      const tree = new THREE.Group();
      tree.add(trunk);
      tree.add(leaves);
      tree.position.set(
        (Math.random() - 0.5) * 150,
        3,
        (Math.random() - 0.5) * 150
      );
      tree.castShadow = true;
      tree.receiveShadow = true;
      scene.add(tree);
    }

    // 玩家
    const playerGroup = new THREE.Group();
    const playerGeo = new THREE.CapsuleGeometry(0.5, 2, 8, 16);
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x0066ff });
    const playerMesh = new THREE.Mesh(playerGeo, playerMat);
    playerMesh.castShadow = true;
    playerGroup.add(playerMesh);
    playerGroup.position.set(0, 1.5, 0);
    scene.add(playerGroup);

    // 玩家武器（剑）
    const swordGeo = new THREE.BoxGeometry(0.1, 2, 0.1);
    const swordMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
    const sword = new THREE.Mesh(swordGeo, swordMat);
    sword.position.set(0.8, 0, 0);
    sword.rotation.z = Math.PI / 4;
    playerGroup.add(sword);

    // 敌人实例
    const enemyInstances: EnemyInstance[] = enemies.map((enemyData, index) => {
      const enemyGroup = new THREE.Group();
      const enemyGeo = new THREE.BoxGeometry(1, 2, 1);
      const enemyMat = new THREE.MeshStandardMaterial({
        color: enemyData.config.color,
      });
      const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
      enemyMesh.castShadow = true;
      enemyGroup.add(enemyMesh);

      const angle = (index / enemies.length) * Math.PI * 2;
      const radius = 20;
      enemyGroup.position.set(
        Math.cos(angle) * radius,
        1,
        Math.sin(angle) * radius
      );
      scene.add(enemyGroup);

      // 巡逻点
      const patrolPoints = [
        enemyGroup.position.clone(),
        new THREE.Vector3(
          enemyGroup.position.x + (Math.random() - 0.5) * 20,
          1,
          enemyGroup.position.z + (Math.random() - 0.5) * 20
        ),
      ];

      return {
        id: enemyData.id,
        config: enemyData.config,
        group: enemyGroup,
        mesh: enemyMesh,
        health: enemyData.health,
        aiState: EnemyAIState.PATROL,
        patrolIndex: 0,
        patrolPoints,
        lastAttackTime: 0,
      };
    });

    // NPC实例
    const npcMeshes: THREE.Mesh[] = [];
    npcs.forEach((npc) => {
      const npcGroup = new THREE.Group();
      const npcGeo = new THREE.CapsuleGeometry(0.6, 2, 8, 16);
      const npcMat = new THREE.MeshStandardMaterial({ color: npc.color });
      const npcMesh = new THREE.Mesh(npcGeo, npcMat);
      npcMesh.castShadow = true;
      npcGroup.add(npcMesh);
      npcGroup.position.set(npc.position.x, npc.position.y + 1.5, npc.position.z);
      scene.add(npcGroup);
      npcMeshes.push(npcMesh);
      
      // NPC名字标签（简单实现）
      // 实际项目中应该使用CSS2DRenderer
    });

    // 相机
    camera.position.set(0, 10, 15);
    camera.lookAt(playerGroup.position);

    // 粒子系统
    const particlesCount = 1000;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
      sizes[i] = 0;
      velocities.push(new THREE.Vector3());
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    let particleIndex = 0;
    const emitParticles = (
      position: THREE.Vector3,
      direction: THREE.Vector3,
      color: THREE.Color,
      count: number
    ) => {
      const posArray = particlesGeo.attributes.position.array as Float32Array;
      const colorArray = particlesGeo.attributes.color.array as Float32Array;
      const sizeArray = particlesGeo.attributes.size.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const idx = (particleIndex + i) % particlesCount;
        posArray[idx * 3] = position.x;
        posArray[idx * 3 + 1] = position.y;
        posArray[idx * 3 + 2] = position.z;

        colorArray[idx * 3] = color.r;
        colorArray[idx * 3 + 1] = color.g;
        colorArray[idx * 3 + 2] = color.b;

        sizeArray[idx] = 0.5;

        const spread = 0.3;
        velocities[idx] = new THREE.Vector3(
          direction.x + (Math.random() - 0.5) * spread,
          direction.y + (Math.random() - 0.5) * spread,
          direction.z + (Math.random() - 0.5) * spread
        ).normalize().multiplyScalar(0.3);
      }
      particleIndex = (particleIndex + count) % particlesCount;
    };

    // 键盘输入
    const keys: { [key: string]: boolean } = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      
      // 打开背包
      if (e.key.toLowerCase() === 'i') {
        setShowInventory((prev) => !prev);
      }
      
      // 使用技能
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const skillIndex = parseInt(e.key) - 1;
        const skill = skills[skillIndex];
        if (skill && skill.currentCooldown === 0 && energy >= skill.config.energyCost) {
          setEnergy((prev) => prev - skill.config.energyCost);
          setGameMessage(`使用了${skill.config.name}`);
          setTimeout(() => setGameMessage(''), 1500);
          
          // 设置冷却
          setSkills((prev) =>
            prev.map((s, i) =>
              i === skillIndex
                ? { ...s, currentCooldown: s.config.cooldown * 60 }
                : s
            )
          );
          
          // 更新任务进度（使用技能）
          updateQuestProgress('use_skill' as QuestObjectiveType, skill.config.id, 1);
          
          // 技能效果
          if (skill.config.id === 'dragon_palm') {
            // 降龙掌：对附近敌人造成伤害
            enemyInstances.forEach((enemy) => {
              if (enemy.aiState !== EnemyAIState.DEAD) {
                const distance = playerGroup.position.distanceTo(enemy.group.position);
                if (distance < 8) {
                  enemy.health -= 50;
                  setEnemies((prev) =>
                    prev.map((e) =>
                      e.id === enemy.id ? { ...e, health: enemy.health } : e
                    )
                  );
                  if (enemy.health <= 0) {
                    enemy.aiState = EnemyAIState.DEAD;
                  }
                }
              }
            });
            emitParticles(
              playerGroup.position.clone(),
              new THREE.Vector3(0, 0, -1).applyQuaternion(playerGroup.quaternion),
              new THREE.Color(0xffd700),
              30
            );
          } else if (skill.config.id === 'lingbo_step') {
            // 凌波微步：瞬间移动
            const teleportDirection = new THREE.Vector3(0, 0, -1)
              .applyQuaternion(playerGroup.quaternion)
              .multiplyScalar(10);
            playerGroup.position.add(teleportDirection);
            emitParticles(
              playerGroup.position.clone(),
              new THREE.Vector3(0, 1, 0),
              new THREE.Color(0x00ffff),
              50
            );
          } else if (skill.config.id === 'sword_qi') {
            // 剑气纵横：远程攻击
            const attackDirection = new THREE.Vector3(0, 0, -1)
              .applyQuaternion(playerGroup.quaternion)
              .normalize();
            emitParticles(
              playerGroup.position.clone(),
              attackDirection,
              new THREE.Color(0x00ffff),
              40
            );
            
            enemyInstances.forEach((enemy) => {
              if (enemy.aiState !== EnemyAIState.DEAD) {
                const distance = playerGroup.position.distanceTo(enemy.group.position);
                if (distance < 15) {
                  enemy.health -= 35;
                  setEnemies((prev) =>
                    prev.map((e) =>
                      e.id === enemy.id ? { ...e, health: enemy.health } : e
                    )
                  );
                  if (enemy.health <= 0) {
                    enemy.aiState = EnemyAIState.DEAD;
                  }
                }
              }
            });
          }
        }
      }
      
      // 时间控制（调试用）
      if (e.key === 't') {
        setTimeOfDay((prev) => (prev + 0.1) % 1);
      }
      
      // E键与NPC交互
      if (e.key.toLowerCase() === 'e') {
        // 检查附近是否有NPC
        const nearbyNPC = npcs.find((npc) => {
          const npcPos = new THREE.Vector3(npc.position.x, npc.position.y, npc.position.z);
          const distance = playerGroup.position.distanceTo(npcPos);
          return distance < 5;
        });
        
        if (nearbyNPC && !currentDialogue) {
          setCurrentDialogue(DIALOGUES[nearbyNPC.dialogueId]);
        }
      }
      
      // 空格键关闭对话/继续对话
      if (e.key === ' ' && currentDialogue) {
        if (currentDialogue.options && currentDialogue.options.length > 0) {
          // 有选项时不自动关闭
        } else {
          setCurrentDialogue(null);
        }
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 鼠标攻击
    let isAttacking = false;
    window.addEventListener('mousedown', () => {
      if (isAttacking) return;
      isAttacking = true;

      // 攻击动画
      sword.rotation.z = -Math.PI / 2;
      setTimeout(() => {
        sword.rotation.z = Math.PI / 4;
        isAttacking = false;
      }, 300);

      // 检测攻击范围内的敌人
      enemyInstances.forEach((enemy) => {
        if (enemy.aiState === EnemyAIState.DEAD) return;

        const distance = playerGroup.position.distanceTo(enemy.group.position);
        if (distance < 5) {
          const attackPower = 20 + (equipment.weapon?.stats?.attack || 0);
          const isCritical = Math.random() < 0.2; // 20%暴击率
          const finalDamage = isCritical ? Math.floor(attackPower * 1.5) : attackPower;
          
          enemy.health -= finalDamage;
          setEnemies((prev) =>
            prev.map((e) =>
              e.id === enemy.id ? { ...e, health: enemy.health } : e
            )
          );

          // 生成伤害数字
          const screenPos = enemy.group.position.clone().project(camera);
          const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;
          
          setDamageNumbers((prev) => [
            ...prev,
            {
              id: `dmg_${Date.now()}_${Math.random()}`,
              damage: finalDamage,
              x,
              y,
              isCritical,
              isSkill: false,
            },
          ]);

          // 更新连击
          const now = Date.now();
          if (now - lastHitTime < 2000) {
            setComboCount((prev) => prev + 1);
          } else {
            setComboCount(1);
          }
          setLastHitTime(now);

          // 粒子效果
          emitParticles(
            enemy.group.position.clone(),
            new THREE.Vector3(0, 1, 0),
            new THREE.Color(isCritical ? 0xff3333 : 0x00ffff),
            isCritical ? 20 : 10
          );

          if (enemy.health <= 0) {
            enemy.aiState = EnemyAIState.DEAD;
            setScore((prev) => prev + 100);
            
            // 更新任务进度（击杀敌人）
            updateQuestProgress('kill_enemies' as QuestObjectiveType, 'any', 1);
            
            // 掉落物品
            if (Math.random() < 0.5 && enemy.config.dropItems) {
              const lootId = enemy.config.dropItems[
                Math.floor(Math.random() * enemy.config.dropItems.length)
              ];
              const lootItem = ITEMS_DATABASE[lootId];
              if (lootItem) {
                setInventory((prev) => {
                  const existing = prev.find((i) => i.item.id === lootId);
                  if (existing) {
                    return prev.map((i) =>
                      i.item.id === lootId ? { ...i, quantity: i.quantity + 1 } : i
                    );
                  }
                  return [...prev, { item: lootItem, quantity: 1 }];
                });
                setGameMessage(`获得了${lootItem.name}`);
                setTimeout(() => setGameMessage(''), 2000);
              }
            }
          }
        }
      });
    });

    // 响应式
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    
    // 技能冷却更新
    const skillCooldownInterval = setInterval(() => {
      setSkills((prev) =>
        prev.map((skill) => ({
          ...skill,
          currentCooldown: Math.max(0, skill.currentCooldown - 1),
        }))
      );
    }, 1000 / 60); // 60 FPS

    // FPS
    let lastTime = performance.now();
    let frames = 0;
    const fpsInterval = setInterval(() => {
      setFps(frames);
      frames = 0;
    }, 1000);

    // 玩家移动
    let velocity = new THREE.Vector3();
    let isOnGround = true;
    let canDoubleJump = false;
    let isQingGong = false;

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      frames++;

      const currentTime = performance.now();
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // 玩家移动
      const moveSpeed = isQingGong ? 15 : 8;
      const moveDirection = new THREE.Vector3();

      if (keys['w']) moveDirection.z -= 1;
      if (keys['s']) moveDirection.z += 1;
      if (keys['a']) moveDirection.x -= 1;
      if (keys['d']) moveDirection.x += 1;

      if (moveDirection.length() > 0) {
        moveDirection.normalize();
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
          playerGroup.quaternion
        );
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
          playerGroup.quaternion
        );

        const move = forward
          .multiplyScalar(moveDirection.z)
          .add(right.multiplyScalar(moveDirection.x))
          .multiplyScalar(moveSpeed * delta);

        playerGroup.position.add(move);

        // 旋转朝向
        const angle = Math.atan2(moveDirection.x, moveDirection.z);
        playerGroup.rotation.y = angle;

        // 轻功粒子
        if (isQingGong) {
          emitParticles(
            playerGroup.position.clone(),
            new THREE.Vector3(0, -1, 0),
            new THREE.Color(0x00ffff),
            2
          );
        }
      }

      // 轻功奔跑
      if (keys['shift'] && energy > 0 && moveDirection.length() > 0) {
        isQingGong = true;
        setEnergy((prev) => Math.max(0, prev - 10 * delta));
      } else {
        isQingGong = false;
        setEnergy((prev) => Math.min(maxEnergy, prev + 5 * delta));
      }

      // 跳跃
      if (keys[' ']) {
        if (isOnGround) {
          velocity.y = 12;
          isOnGround = false;
          canDoubleJump = true;
        } else if (canDoubleJump) {
          velocity.y = 12;
          canDoubleJump = false;
          emitParticles(
            playerGroup.position.clone(),
            new THREE.Vector3(0, -1, 0),
            new THREE.Color(0xffffff),
            15
          );
        }
        keys[' '] = false;
      }

      // 重力
      velocity.y -= 30 * delta;
      playerGroup.position.y += velocity.y * delta;

      if (playerGroup.position.y <= 1.5) {
        playerGroup.position.y = 1.5;
        velocity.y = 0;
        isOnGround = true;
      }

      // 相机跟随
      const cameraOffset = new THREE.Vector3(0, 10, 15);
      const cameraPosition = playerGroup.position.clone().add(cameraOffset);
      camera.position.lerp(cameraPosition, 0.1);
      camera.lookAt(playerGroup.position);

      // 敌人AI
      enemyInstances.forEach((enemy) => {
        if (enemy.aiState === EnemyAIState.DEAD) {
          enemy.group.position.y -= 0.5 * delta;
          if (enemy.group.position.y < -5) {
            scene.remove(enemy.group);
          }
          return;
        }

        const distanceToPlayer = enemy.group.position.distanceTo(
          playerGroup.position
        );

        if (distanceToPlayer < enemy.config.detectionRange) {
          enemy.aiState = EnemyAIState.CHASE;
        }

        if (enemy.aiState === EnemyAIState.PATROL) {
          const targetPoint = enemy.patrolPoints[enemy.patrolIndex];
          const direction = targetPoint
            .clone()
            .sub(enemy.group.position)
            .normalize();
            enemy.group.position.add(
              direction.multiplyScalar(enemy.config.moveSpeed * 100 * delta)
            );

          if (enemy.group.position.distanceTo(targetPoint) < 2) {
            enemy.patrolIndex =
              (enemy.patrolIndex + 1) % enemy.patrolPoints.length;
          }
        } else if (enemy.aiState === EnemyAIState.CHASE) {
          if (distanceToPlayer < enemy.config.attackRange) {
            enemy.aiState = EnemyAIState.ATTACK;
          } else {
            const direction = playerGroup.position
              .clone()
              .sub(enemy.group.position)
              .normalize();
            direction.y = 0;
            enemy.group.position.add(
              direction.multiplyScalar(enemy.config.moveSpeed * 100 * delta)
            );

            const angle = Math.atan2(direction.x, direction.z);
            enemy.group.rotation.y = angle;
          }
        } else if (enemy.aiState === EnemyAIState.ATTACK) {
          if (distanceToPlayer > enemy.config.attackRange) {
            enemy.aiState = EnemyAIState.CHASE;
          } else {
            const now = performance.now();
            if (now - enemy.lastAttackTime > 1000) {
              enemy.lastAttackTime = now;
              const damage = Math.max(
                1,
                enemy.config.attack - (equipment.body?.stats?.defense || 0)
              );
              setHealth((prev) => Math.max(0, prev - damage));
            }
          }
        }
      });

      // 粒子更新
      const posArray = particlesGeo.attributes.position.array as Float32Array;
      const sizeArray = particlesGeo.attributes.size.array as Float32Array;

      for (let i = 0; i < particlesCount; i++) {
        posArray[i * 3] += velocities[i].x;
        posArray[i * 3 + 1] += velocities[i].y;
        posArray[i * 3 + 2] += velocities[i].z;

        sizeArray[i] *= 0.95;
        if (sizeArray[i] < 0.01) {
          sizeArray[i] = 0;
        }
      }

      particlesGeo.attributes.position.needsUpdate = true;
      particlesGeo.attributes.size.needsUpdate = true;

      // 更新天空和光照
      if (timeOfDay !== undefined) {
        scene.remove(skybox);
        const newSkybox = createSkybox(timeOfDay);
        scene.add(newSkybox);
        updateLighting(timeOfDay);
      }

      composer.render();
    };

    animate();

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(skillCooldownInterval);
      clearInterval(fpsInterval);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      composer.dispose();
    };
  }, [equipment, maxEnergy, maxHealth, timeOfDay]);

  const allEnemiesDead = enemies.every((e) => e.health <= 0);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      {/* HUD */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-black/50 text-white px-4 py-2 rounded">
          FPS: {fps}
        </div>
        <div className="bg-black/50 text-white px-4 py-2 rounded">
          <div className="text-sm mb-1">生命值</div>
          <div className="w-48 h-4 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${(health / maxHealth) * 100}%` }}
            />
          </div>
          <div className="text-xs mt-1">
            {health} / {maxHealth}
          </div>
        </div>
        <div className="bg-black/50 text-white px-4 py-2 rounded">
          <div className="text-sm mb-1">内力</div>
          <div className="w-48 h-4 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(energy / maxEnergy) * 100}%` }}
            />
          </div>
          <div className="text-xs mt-1">
            {Math.floor(energy)} / {maxEnergy}
          </div>
        </div>
        <div className="bg-black/50 text-white px-4 py-2 rounded">得分: {score}</div>
        <div className="bg-black/50 text-white px-4 py-2 rounded">
          时间: {timeOfDay < 0.25 ? '凌晨' : timeOfDay < 0.5 ? '早晨' : timeOfDay < 0.75 ? '下午' : '黄昏'}
        </div>
      </div>

      {/* 背包按钮 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setShowInventory(!showInventory)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold"
        >
          背包 (I)
        </button>
      </div>

      {/* 敌人状态 */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded">
        <div className="font-bold mb-2">敌人状态</div>
        {enemies.map((enemy) => (
          <div key={enemy.id} className="mb-1">
            <div className="text-sm">{enemy.config.name}</div>
            <div className="w-32 h-2 bg-gray-700 rounded overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all"
                style={{
                  width: `${(enemy.health / enemy.config.maxHealth) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 技能栏 */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {skills.map((skill, index) => (
          <div
            key={skill.config.id}
            className="relative w-16 h-16 bg-black/70 rounded border-2 border-yellow-600 flex items-center justify-center"
          >
            <div className="text-3xl">{skill.config.icon}</div>
            <div className="absolute bottom-0 left-0 right-0 text-center text-white text-xs bg-black/80">
              {index + 1}
            </div>
            {skill.currentCooldown > 0 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-sm">
                {Math.ceil(skill.currentCooldown / 60)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-4 py-2 rounded text-sm">
        <div className="font-bold mb-2">操作指南</div>
        <div>WASD - 移动</div>
        <div>空格 - 跳跃/二段跳</div>
        <div>Shift - 轻功奔跑</div>
        <div>鼠标左键 - 攻击</div>
        <div>I - 打开背包</div>
        <div>1/2/3 - 使用技能</div>
        <div>T - 切换时间（调试）</div>
      </div>

      {/* 游戏消息 */}
      {gameMessage && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-8 py-4 rounded-lg text-xl font-bold">
          {gameMessage}
        </div>
      )}

      {/* 胜利/失败画面 */}
      {allEnemiesDead && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-yellow-400 mb-4">胜利！</div>
            <div className="text-2xl text-white mb-4">得分: {score}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-xl"
            >
              再来一局
            </button>
          </div>
        </div>
      )}

      {health <= 0 && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl font-bold text-red-500 mb-4">失败</div>
            <div className="text-2xl text-white mb-4">得分: {score}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-xl"
            >
              重新开始
            </button>
          </div>
        </div>
      )}

      {/* 背包界面 */}
      {showInventory && (
        <Inventory
          inventory={inventory}
          equipment={equipment}
          onUseItem={handleUseItem}
          onEquipItem={handleUseItem}
          onUnequipItem={handleUnequipItem}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* 伤害数字 */}
      {damageNumbers.map((dmg) => (
        <DamageNumber
          key={dmg.id}
          damageNumber={dmg}
          onComplete={(id) => {
            setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
          }}
        />
      ))}

      {/* 对话系统 */}
      {currentDialogue && (
        <DialogueBox
          dialogue={currentDialogue}
          onOptionSelect={(option) => {
            if (option.action) {
              option.action();
            }
            if (option.nextDialogueId) {
              setCurrentDialogue(DIALOGUES[option.nextDialogueId]);
            } else {
              setCurrentDialogue(null);
            }
          }}
          onClose={() => setCurrentDialogue(null)}
        />
      )}

      {/* 任务追踪 */}
      <QuestTracker activeQuests={activeQuests} />
      
      {/* 连击显示 */}
      {comboCount > 1 && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="text-6xl font-bold text-yellow-400 animate-pulse" style={{
            textShadow: '0 0 20px rgba(255,215,0,0.8), 0 0 40px rgba(255,215,0,0.6)'
          }}>
            {comboCount} 连击!
          </div>
        </div>
      )}
    </div>
  );
}
