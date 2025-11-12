import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Howl } from 'howler';
import Inventory from './Inventory';
import { Item, InventoryItem, Equipment, ItemType, EquipSlot } from '../types/items';
import { ITEMS_DATABASE } from '../data/itemsData';
import { Enemy, EnemyConfig, EnemyAIState, ENEMY_CONFIGS } from '../types/enemies';
import { Skill, SKILLS_DATABASE } from '../types/skills';
import { Button } from './ui/button';

export default function WuxiaGameV2() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 游戏状态
  const [fps, setFps] = useState(60);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [maxEnergy, setMaxEnergy] = useState(100);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  
  // 背包和装备
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { item: ITEMS_DATABASE.health_potion_small, quantity: 5 },
    { item: ITEMS_DATABASE.energy_potion_small, quantity: 3 },
    { item: ITEMS_DATABASE.wooden_sword, quantity: 1 },
    { item: ITEMS_DATABASE.cloth_armor, quantity: 1 },
  ]);
  const [equipment, setEquipment] = useState<Equipment>({});
  const [showInventory, setShowInventory] = useState(false);
  
  // 技能
  const [skills, setSkills] = useState<Skill[]>([
    {
      config: SKILLS_DATABASE.dragon_palm,
      currentCooldown: 0,
      isActive: false,
    },
    {
      config: SKILLS_DATABASE.lingbo_step,
      currentCooldown: 0,
      isActive: false,
    },
    {
      config: SKILLS_DATABASE.sword_qi,
      currentCooldown: 0,
      isActive: false,
    },
  ]);
  
  // 敌人状态
  const [enemies, setEnemies] = useState<{ config: EnemyConfig; health: number; id: string }[]>([]);
  
  // 游戏消息
  const [gameMessage, setGameMessage] = useState<string>('');
  
  // 使用物品
  const handleUseItem = useCallback((item: Item) => {
    if (item.effect) {
      if (item.effect.type === 'heal') {
        setHealth((prev) => Math.min(maxHealth, prev + item.effect!.value));
        setGameMessage(`使用${item.name}，恢复${item.effect.value}点生命值`);
      } else if (item.effect.type === 'energy') {
        setEnergy((prev) => Math.min(maxEnergy, prev + item.effect!.value));
        setGameMessage(`使用${item.name}，恢复${item.effect.value}点内力`);
      }
      
      // 减少物品数量
      setInventory((prev) =>
        prev
          .map((invItem) =>
            invItem.item.id === item.id
              ? { ...invItem, quantity: invItem.quantity - 1 }
              : invItem
          )
          .filter((invItem) => invItem.quantity > 0)
      );
      
      setTimeout(() => setGameMessage(''), 2000);
    }
  }, [maxHealth, maxEnergy]);
  
  // 装备物品
  const handleEquipItem = useCallback((item: Item) => {
    if (!item.equipSlot) return;
    
    setEquipment((prev) => {
      const newEquipment = { ...prev };
      const slot = item.equipSlot as keyof Equipment;
      
      // 如果该槽位已有装备，放回背包
      if (newEquipment[slot]) {
        setInventory((inv) => {
          const existing = inv.find((i) => i.item.id === newEquipment[slot]!.id);
          if (existing) {
            return inv.map((i) =>
              i.item.id === newEquipment[slot]!.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            );
          }
          return [...inv, { item: newEquipment[slot]!, quantity: 1 }];
        });
      }
      
      newEquipment[slot] = item;
      
      // 从背包移除
      setInventory((inv) =>
        inv
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
      
      return newEquipment;
    });
  }, []);
  
  // 卸下装备
  const handleUnequipItem = useCallback((slot: string) => {
    setEquipment((prev) => {
      const newEquipment = { ...prev };
      const equipSlot = slot as keyof Equipment;
      const item = newEquipment[equipSlot];
      
      if (!item) return prev;
      
      // 放回背包
      setInventory((inv) => {
        const existing = inv.find((i) => i.item.id === item.id);
        if (existing) {
          return inv.map((i) =>
            i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...inv, { item, quantity: 1 }];
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
      
      delete newEquipment[equipSlot];
      
      setGameMessage(`卸下了${item.name}`);
      setTimeout(() => setGameMessage(''), 2000);
      
      return newEquipment;
    });
  }, [maxHealth, maxEnergy]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 场景设置
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0e6d2);
    scene.fog = new THREE.Fog(0xf0e6d2, 50, 200);

    // 相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 20);

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // 光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffd700, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // 地面
    const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // 地形起伏
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
      positions.setZ(i, height);
    }
    positions.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    // 主角
    const playerGroup = new THREE.Group();
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      roughness: 0.5,
      metalness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    playerGroup.add(body);

    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.3;
    head.castShadow = true;
    playerGroup.add(head);

    playerGroup.position.set(0, 2, 0);
    scene.add(playerGroup);

    // 武器
    const swordGroup = new THREE.Group();
    const swordBladeGeometry = new THREE.BoxGeometry(0.1, 2, 0.05);
    const swordBladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.8,
      roughness: 0.2,
    });
    const swordBlade = new THREE.Mesh(swordBladeGeometry, swordBladeMaterial);
    swordBlade.position.y = 1;
    swordGroup.add(swordBlade);

    swordGroup.position.set(0.5, 0.5, 0);
    swordGroup.rotation.z = Math.PI / 4;
    playerGroup.add(swordGroup);

    // 创建敌人
    const enemyInstances: Enemy[] = [];
    
    const createEnemy = (config: EnemyConfig, position: THREE.Vector3) => {
      const enemyGroup = new THREE.Group();
      const enemyBodyGeometry = new THREE.BoxGeometry(
        config.size.width,
        config.size.height,
        config.size.depth
      );
      const enemyBodyMaterial = new THREE.MeshStandardMaterial({ color: config.color });
      const enemyBody = new THREE.Mesh(enemyBodyGeometry, enemyBodyMaterial);
      enemyBody.castShadow = true;
      enemyGroup.add(enemyBody);

      const enemyHeadGeometry = new THREE.SphereGeometry(0.4, 16, 16);
      const enemyHeadMaterial = new THREE.MeshStandardMaterial({
        color: config.color,
      });
      const enemyHead = new THREE.Mesh(enemyHeadGeometry, enemyHeadMaterial);
      enemyHead.position.y = config.size.height / 2 + 0.4;
      enemyHead.castShadow = true;
      enemyGroup.add(enemyHead);

      enemyGroup.position.copy(position);
      scene.add(enemyGroup);

      const enemy: Enemy = {
        id: Math.random().toString(36),
        config,
        group: enemyGroup,
        health: config.maxHealth,
        aiState: EnemyAIState.PATROL,
        patrolPoints: [
          position.clone(),
          position.clone().add(new THREE.Vector3(5, 0, 5)),
          position.clone().add(new THREE.Vector3(-5, 0, 5)),
        ],
        currentPatrolIndex: 0,
        attackCooldown: 0,
      };

      enemyInstances.push(enemy);
      
      setEnemies((prev) => [
        ...prev,
        { config, health: config.maxHealth, id: enemy.id },
      ]);

      return enemy;
    };

    // 生成多个敌人
    createEnemy(ENEMY_CONFIGS.swordsman, new THREE.Vector3(10, 1, 5));
    createEnemy(ENEMY_CONFIGS.spearman, new THREE.Vector3(-10, 1, -5));
    createEnemy(ENEMY_CONFIGS.archer, new THREE.Vector3(15, 1, -10));
    createEnemy(ENEMY_CONFIGS.elite, new THREE.Vector3(-15, 1, 10));

    // 粒子系统
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const particlesPositions = new Float32Array(particlesCount * 3);
    const particlesVelocities: THREE.Vector3[] = [];
    const particlesColors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      particlesPositions[i * 3] = 0;
      particlesPositions[i * 3 + 1] = 0;
      particlesPositions[i * 3 + 2] = 0;
      particlesVelocities.push(new THREE.Vector3(0, 0, 0));
      particlesColors[i * 3] = 1;
      particlesColors[i * 3 + 1] = 1;
      particlesColors[i * 3 + 2] = 1;
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlesPositions, 3)
    );
    particlesGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(particlesColors, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.3,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    let particleIndex = 0;

    const emitParticles = (
      position: THREE.Vector3,
      direction: THREE.Vector3,
      color: THREE.Color,
      count: number = 10
    ) => {
      for (let i = 0; i < count; i++) {
        const idx = (particleIndex + i) % particlesCount;
        particlesPositions[idx * 3] = position.x;
        particlesPositions[idx * 3 + 1] = position.y;
        particlesPositions[idx * 3 + 2] = position.z;

        particlesVelocities[idx] = direction
          .clone()
          .multiplyScalar(0.5)
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3
            )
          );

        particlesColors[idx * 3] = color.r;
        particlesColors[idx * 3 + 1] = color.g;
        particlesColors[idx * 3 + 2] = color.b;
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
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 玩家状态
    const playerState = {
      velocity: new THREE.Vector3(),
      isJumping: false,
      canDoubleJump: true,
      isLightSkill: false,
      attackCooldown: 0,
      baseAttack: 10,
      baseDefense: 0,
    };

    // 鼠标攻击
    let isAttacking = false;
    window.addEventListener('mousedown', () => {
      if (playerState.attackCooldown <= 0 && !isAttacking) {
        isAttacking = true;
        playerState.attackCooldown = 30;

        const attackPower =
          playerState.baseAttack + (equipment.weapon?.stats?.attack || 0);

        const swordTip = new THREE.Vector3();
        swordGroup.getWorldPosition(swordTip);
        const attackDirection = new THREE.Vector3(0, 0, -1)
          .applyQuaternion(playerGroup.quaternion)
          .normalize();
        emitParticles(swordTip, attackDirection, new THREE.Color(0x00ffff), 15);

        // 检测敌人
        enemyInstances.forEach((enemy) => {
          if (enemy.aiState === EnemyAIState.DEAD) return;
          const distance = playerGroup.position.distanceTo(enemy.group.position);
          if (distance < 5) {
            enemy.health -= attackPower;
            setEnemies((prev) =>
              prev.map((e) =>
                e.id === enemy.id ? { ...e, health: enemy.health } : e
              )
            );

            if (enemy.health <= 0) {
              enemy.aiState = EnemyAIState.DEAD;
              setScore((prev) => prev + 100);
              setCombo((prev) => prev + 1);

              // 掉落物品
              if (enemy.config.dropItems && Math.random() > 0.5) {
                const dropItemId =
                  enemy.config.dropItems[
                    Math.floor(Math.random() * enemy.config.dropItems.length)
                  ];
                const dropItem = ITEMS_DATABASE[dropItemId];
                if (dropItem) {
                  setInventory((prev) => {
                    const existing = prev.find((i) => i.item.id === dropItem.id);
                    if (existing) {
                      return prev.map((i) =>
                        i.item.id === dropItem.id
                          ? { ...i, quantity: i.quantity + 1 }
                          : i
                      );
                    }
                    return [...prev, { item: dropItem, quantity: 1 }];
                  });
                  setGameMessage(`获得了${dropItem.name}`);
                  setTimeout(() => setGameMessage(''), 2000);
                }
              }
            }
          }
        });

        setTimeout(() => {
          isAttacking = false;
        }, 300);
      }
    });

    // 响应式
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
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

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);

      frames++;
      const currentTime = performance.now();
      if (currentTime >= lastTime + 1000) {
        setFps(frames);
        frames = 0;
        lastTime = currentTime;
      }

      if (playerState.attackCooldown > 0) playerState.attackCooldown--;

      // 玩家移动
      const baseSpeed = 0.15;
      const speedBonus = equipment.body?.stats?.speed || 0;
      const moveSpeed = playerState.isLightSkill
        ? (baseSpeed + speedBonus * 0.01) * 2
        : baseSpeed + speedBonus * 0.01;

      const moveDirection = new THREE.Vector3();

      if (keys['w']) moveDirection.z -= 1;
      if (keys['s']) moveDirection.z += 1;
      if (keys['a']) moveDirection.x -= 1;
      if (keys['d']) moveDirection.x += 1;

      if (moveDirection.length() > 0) {
        moveDirection.normalize();
        playerGroup.position.x += moveDirection.x * moveSpeed;
        playerGroup.position.z += moveDirection.z * moveSpeed;

        const angle = Math.atan2(moveDirection.x, moveDirection.z);
        playerGroup.rotation.y = angle;

        if (playerState.isLightSkill) {
          emitParticles(
            playerGroup.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
            new THREE.Vector3(0, 1, 0),
            new THREE.Color(0x00ffff),
            3
          );
        }
      }

      // 轻功
      if (keys['shift'] && moveDirection.length() > 0) {
        if (!playerState.isLightSkill) {
          playerState.isLightSkill = true;
        }
        setEnergy((prev) => Math.max(0, prev - 0.5));
      } else {
        playerState.isLightSkill = false;
        setEnergy((prev) => Math.min(maxEnergy, prev + 0.2));
      }

      // 跳跃
      if (keys[' ']) {
        if (!playerState.isJumping) {
          playerState.velocity.y = 0.5;
          playerState.isJumping = true;
          playerState.canDoubleJump = true;
        } else if (playerState.canDoubleJump) {
          playerState.velocity.y = 0.5;
          playerState.canDoubleJump = false;
          emitParticles(
            playerGroup.position.clone(),
            new THREE.Vector3(0, -1, 0),
            new THREE.Color(0x00ffff),
            20
          );
        }
        keys[' '] = false;
      }

      // 重力
      playerState.velocity.y -= 0.02;
      playerGroup.position.y += playerState.velocity.y;

      if (playerGroup.position.y <= 2) {
        playerGroup.position.y = 2;
        playerState.velocity.y = 0;
        playerState.isJumping = false;
        playerState.canDoubleJump = true;
      }

      // 敌人AI
      enemyInstances.forEach((enemy) => {
        if (enemy.aiState === EnemyAIState.DEAD) {
          enemy.group.position.y = Math.max(0, enemy.group.position.y - 0.05);
          return;
        }

        const distanceToPlayer = playerGroup.position.distanceTo(
          enemy.group.position
        );

        if (distanceToPlayer < enemy.config.detectionRange) {
          enemy.aiState = EnemyAIState.CHASE;
          const directionToPlayer = new THREE.Vector3()
            .subVectors(playerGroup.position, enemy.group.position)
            .normalize();
          enemy.group.position.add(
            directionToPlayer.multiplyScalar(enemy.config.moveSpeed)
          );

          const angleToPlayer = Math.atan2(directionToPlayer.x, directionToPlayer.z);
          enemy.group.rotation.y = angleToPlayer;

          if (distanceToPlayer < enemy.config.attackRange) {
            if (enemy.attackCooldown <= 0) {
              const damage = Math.max(
                1,
                enemy.config.attack -
                  (playerState.baseDefense + (equipment.body?.stats?.defense || 0))
              );
              setHealth((prev) => Math.max(0, prev - damage));
              enemy.attackCooldown = 60;
            } else {
              enemy.attackCooldown--;
            }
          }
        } else {
          enemy.aiState = EnemyAIState.PATROL;
          const targetPoint = enemy.patrolPoints[enemy.currentPatrolIndex];
          const directionToTarget = new THREE.Vector3()
            .subVectors(targetPoint, enemy.group.position)
            .normalize();
          enemy.group.position.add(
            directionToTarget.multiplyScalar(enemy.config.moveSpeed * 0.5)
          );

          if (enemy.group.position.distanceTo(targetPoint) < 1) {
            enemy.currentPatrolIndex =
              (enemy.currentPatrolIndex + 1) % enemy.patrolPoints.length;
          }
        }
      });

      // 更新粒子
      const particlePositions = particlesGeometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        particlePositions[i * 3] += particlesVelocities[i].x;
        particlePositions[i * 3 + 1] += particlesVelocities[i].y;
        particlePositions[i * 3 + 2] += particlesVelocities[i].z;

        particlesVelocities[i].multiplyScalar(0.95);

        if (
          Math.abs(particlePositions[i * 3]) > 50 ||
          Math.abs(particlePositions[i * 3 + 1]) > 50 ||
          Math.abs(particlePositions[i * 3 + 2]) > 50
        ) {
          particlePositions[i * 3] = 0;
          particlePositions[i * 3 + 1] = 0;
          particlePositions[i * 3 + 2] = 0;
          particlesVelocities[i].set(0, 0, 0);
        }
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // 相机跟随
      const cameraOffset = new THREE.Vector3(0, 10, 20);
      const cameraPosition = playerGroup.position.clone().add(cameraOffset);
      camera.position.lerp(cameraPosition, 0.1);
      camera.lookAt(playerGroup.position);

      // 攻击动画
      if (isAttacking) {
        swordGroup.rotation.z = Math.PI / 2;
      } else {
        swordGroup.rotation.z = Math.PI / 4;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(skillCooldownInterval);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [equipment, maxEnergy, maxHealth]);

  const allEnemiesDead = enemies.every((e) => e.health <= 0);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />

      {/* HUD */}
      <div className="absolute top-4 left-4 space-y-2 text-white font-mono">
        <div className="bg-black/50 px-4 py-2 rounded">FPS: {fps}</div>
        <div className="bg-black/50 px-4 py-2 rounded">
          <div className="text-sm mb-1">生命值</div>
          <div className="w-48 h-4 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${(health / maxHealth) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {health.toFixed(0)} / {maxHealth}
          </div>
        </div>
        <div className="bg-black/50 px-4 py-2 rounded">
          <div className="text-sm mb-1">内力</div>
          <div className="w-48 h-4 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(energy / maxEnergy) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {energy.toFixed(0)} / {maxEnergy}
          </div>
        </div>
        <div className="bg-black/50 px-4 py-2 rounded">
          <div className="text-sm">得分: {score}</div>
        </div>
        {combo > 0 && (
          <div className="bg-yellow-500/80 px-4 py-2 rounded text-black font-bold">
            连击 x{combo}
          </div>
        )}
      </div>

      {/* 敌人状态 */}
      <div className="absolute top-4 right-4 space-y-2 text-white font-mono">
        <div className="bg-black/50 px-4 py-2 rounded">
          <div className="text-sm font-bold mb-2">敌人状态</div>
          {enemies.map((enemy, index) => (
            <div key={index} className="mb-2">
              <div className="text-xs">{enemy.config.name}</div>
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
      </div>

      {/* 技能快捷键 */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="bg-black/70 p-3 rounded border-2 border-yellow-600 w-16 h-16 flex flex-col items-center justify-center"
          >
            <div className="text-2xl">{skill.config.icon}</div>
            <div className="text-xs text-white mt-1">{index + 1}</div>
            {skill.currentCooldown > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                {skill.currentCooldown}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-6 py-4 rounded-lg font-mono text-sm space-y-1">
        <div className="font-bold mb-2">操作指南</div>
        <div>WASD - 移动</div>
        <div>空格 - 跳跃/二段跳</div>
        <div>Shift - 轻功奔跑</div>
        <div>鼠标左键 - 攻击</div>
        <div>I - 打开背包</div>
        <div>1/2/3 - 使用技能</div>
      </div>

      {/* 背包按钮 */}
      <Button
        className="absolute top-4 left-1/2 transform -translate-x-1/2"
        onClick={() => setShowInventory(true)}
      >
        背包 (I)
      </Button>

      {/* 背包界面 */}
      {showInventory && (
        <Inventory
          inventory={inventory}
          equipment={equipment}
          onUseItem={handleUseItem}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* 游戏消息 */}
      {gameMessage && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-black/80 text-yellow-400 px-8 py-4 rounded-lg text-xl font-bold">
          {gameMessage}
        </div>
      )}

      {/* 胜利提示 */}
      {allEnemiesDead && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-12 py-8 rounded-2xl text-center">
            <div className="text-4xl font-bold mb-4">胜利！</div>
            <div className="text-xl">你击败了所有敌人</div>
            <div className="text-lg mt-2">得分: {score}</div>
            <div className="text-lg">最高连击: {combo}</div>
          </div>
        </div>
      )}

      {/* 失败提示 */}
      {health === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-gradient-to-br from-red-600 to-red-800 text-white px-12 py-8 rounded-2xl text-center">
            <div className="text-4xl font-bold mb-4">失败</div>
            <div className="text-xl">你被击败了</div>
            <div className="text-sm mt-4 opacity-80">刷新页面重试</div>
          </div>
        </div>
      )}
    </div>
  );
}
