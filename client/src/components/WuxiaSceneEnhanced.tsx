import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function WuxiaSceneEnhanced() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState(60);
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // 场景设置
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0e6d2);
    scene.fog = new THREE.Fog(0xf0e6d2, 50, 200);

    // 相机设置
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 20);

    // 渲染器设置
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // 光照系统
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffd700, 0.8);
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

    // 地面起伏
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
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdbac,
      roughness: 0.6,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.3;
    head.castShadow = true;
    playerGroup.add(head);

    playerGroup.position.set(0, 2, 0);
    scene.add(playerGroup);

    // 武器（剑）
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

    const swordHandleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
    const swordHandleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const swordHandle = new THREE.Mesh(swordHandleGeometry, swordHandleMaterial);
    swordGroup.add(swordHandle);

    swordGroup.position.set(0.5, 0.5, 0);
    swordGroup.rotation.z = Math.PI / 4;
    playerGroup.add(swordGroup);

    // 树木
    const createTree = (x: number, z: number) => {
      const treeGroup = new THREE.Group();
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.castShadow = true;
      trunk.position.y = 2;
      treeGroup.add(trunk);

      const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
      const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.castShadow = true;
      foliage.position.y = 5;
      treeGroup.add(foliage);

      treeGroup.position.set(x, 0, z);
      scene.add(treeGroup);
    };

    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      if (Math.abs(x) > 10 || Math.abs(z) > 10) {
        createTree(x, z);
      }
    }

    // 敌人
    const enemyGroup = new THREE.Group();
    const enemyBodyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const enemyBodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444 });
    const enemyBody = new THREE.Mesh(enemyBodyGeometry, enemyBodyMaterial);
    enemyBody.castShadow = true;
    enemyGroup.add(enemyBody);

    const enemyHeadGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const enemyHeadMaterial = new THREE.MeshStandardMaterial({ color: 0xff8888 });
    const enemyHead = new THREE.Mesh(enemyHeadGeometry, enemyHeadMaterial);
    enemyHead.position.y = 1.4;
    enemyHead.castShadow = true;
    enemyGroup.add(enemyHead);

    enemyGroup.position.set(10, 1, 5);
    scene.add(enemyGroup);

    // 粒子系统（剑气轨迹）
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const particlesPositions = new Float32Array(particlesCount * 3);
    const particlesVelocities: THREE.Vector3[] = [];

    for (let i = 0; i < particlesCount; i++) {
      particlesPositions[i * 3] = 0;
      particlesPositions[i * 3 + 1] = 0;
      particlesPositions[i * 3 + 2] = 0;
      particlesVelocities.push(new THREE.Vector3(0, 0, 0));
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(particlesPositions, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    let particleIndex = 0;

    // 创建粒子
    const emitParticles = (position: THREE.Vector3, direction: THREE.Vector3) => {
      for (let i = 0; i < 10; i++) {
        const idx = (particleIndex + i) % particlesCount;
        particlesPositions[idx * 3] = position.x;
        particlesPositions[idx * 3 + 1] = position.y;
        particlesPositions[idx * 3 + 2] = position.z;

        particlesVelocities[idx] = direction
          .clone()
          .multiplyScalar(0.5)
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2
            )
          );
      }
      particleIndex = (particleIndex + 10) % particlesCount;
    };

    // 键盘输入
    const keys: { [key: string]: boolean } = {};
    window.addEventListener('keydown', (e) => {
      keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
      keys[e.key.toLowerCase()] = false;
    });

    // 鼠标点击攻击
    let isAttacking = false;
    let attackCooldown = 0;
    window.addEventListener('mousedown', () => {
      if (attackCooldown <= 0 && !isAttacking) {
        isAttacking = true;
        attackCooldown = 30; // 30帧冷却

        // 剑气特效
        const swordTip = new THREE.Vector3();
        swordGroup.getWorldPosition(swordTip);
        const attackDirection = new THREE.Vector3(0, 0, -1)
          .applyQuaternion(playerGroup.quaternion)
          .normalize();
        emitParticles(swordTip, attackDirection);

        // 检测敌人是否在攻击范围内
        const distanceToEnemy = playerGroup.position.distanceTo(enemyGroup.position);
        if (distanceToEnemy < 5) {
          setEnemyHealth((prev) => Math.max(0, prev - 10));
          setCombo((prev) => prev + 1);
        }

        setTimeout(() => {
          isAttacking = false;
        }, 300);
      }
    });

    // 玩家状态
    const playerState = {
      velocity: new THREE.Vector3(),
      isJumping: false,
      canDoubleJump: true,
      isLightSkill: false,
    };

    // 敌人AI状态
    const enemyState = {
      patrolPoints: [
        new THREE.Vector3(10, 1, 5),
        new THREE.Vector3(15, 1, 10),
        new THREE.Vector3(5, 1, 10),
      ],
      currentPatrolIndex: 0,
      isChasing: false,
    };

    // 响应式处理
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // FPS计数
    let lastTime = performance.now();
    let frames = 0;

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);

      // FPS计算
      frames++;
      const currentTime = performance.now();
      if (currentTime >= lastTime + 1000) {
        setFps(frames);
        frames = 0;
        lastTime = currentTime;
      }

      // 攻击冷却
      if (attackCooldown > 0) attackCooldown--;

      // 玩家移动
      const moveSpeed = playerState.isLightSkill ? 0.3 : 0.15;
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

        // 轻功奔跑时发射粒子
        if (playerState.isLightSkill) {
          const footPosition = playerGroup.position.clone();
          footPosition.y = 0.5;
          emitParticles(footPosition, new THREE.Vector3(0, 1, 0));
        }
      }

      // 轻功奔跑
      if (keys['shift'] && moveDirection.length() > 0) {
        if (!playerState.isLightSkill) {
          playerState.isLightSkill = true;
        }
        setEnergy((prev) => Math.max(0, prev - 0.5));
      } else {
        playerState.isLightSkill = false;
        setEnergy((prev) => Math.min(100, prev + 0.2));
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
          // 二段跳特效
          emitParticles(
            playerGroup.position.clone(),
            new THREE.Vector3(0, -1, 0)
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
      const distanceToPlayer = playerGroup.position.distanceTo(enemyGroup.position);
      if (distanceToPlayer < 15 && enemyHealth > 0) {
        // 追逐玩家
        enemyState.isChasing = true;
        const directionToPlayer = new THREE.Vector3()
          .subVectors(playerGroup.position, enemyGroup.position)
          .normalize();
        enemyGroup.position.add(directionToPlayer.multiplyScalar(0.05));

        const angleToPlayer = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        enemyGroup.rotation.y = angleToPlayer;

        // 敌人攻击
        if (distanceToPlayer < 3) {
          setHealth((prev) => Math.max(0, prev - 0.1));
        }
      } else if (enemyHealth > 0) {
        // 巡逻
        enemyState.isChasing = false;
        const targetPoint = enemyState.patrolPoints[enemyState.currentPatrolIndex];
        const directionToTarget = new THREE.Vector3()
          .subVectors(targetPoint, enemyGroup.position)
          .normalize();
        enemyGroup.position.add(directionToTarget.multiplyScalar(0.02));

        if (enemyGroup.position.distanceTo(targetPoint) < 1) {
          enemyState.currentPatrolIndex =
            (enemyState.currentPatrolIndex + 1) % enemyState.patrolPoints.length;
        }
      } else {
        // 敌人死亡
        enemyGroup.position.y = Math.max(0, enemyGroup.position.y - 0.05);
      }

      // 更新粒子
      const particlePositions = particlesGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        particlePositions[i * 3] += particlesVelocities[i].x;
        particlePositions[i * 3 + 1] += particlesVelocities[i].y;
        particlePositions[i * 3 + 2] += particlesVelocities[i].z;

        // 粒子衰减
        particlesVelocities[i].multiplyScalar(0.95);

        // 重置远离的粒子
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
      window.removeEventListener('keydown', () => {});
      window.removeEventListener('keyup', () => {});
      window.removeEventListener('mousedown', () => {});
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

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
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
        <div className="bg-black/50 px-4 py-2 rounded">
          <div className="text-sm mb-1">内力</div>
          <div className="w-48 h-4 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>
        <div className="bg-black/50 px-4 py-2 rounded">
          <div className="text-sm mb-1">敌人生命值</div>
          <div className="w-48 h-4 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${enemyHealth}%` }}
            />
          </div>
        </div>
        {combo > 0 && (
          <div className="bg-yellow-500/80 px-4 py-2 rounded text-black font-bold">
            连击 x{combo}
          </div>
        )}
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-6 py-4 rounded-lg font-mono text-sm space-y-1">
        <div className="font-bold mb-2">操作指南</div>
        <div>WASD - 移动</div>
        <div>空格 - 跳跃/二段跳</div>
        <div>Shift - 轻功奔跑</div>
        <div>鼠标左键 - 攻击</div>
      </div>

      {/* 胜利提示 */}
      {enemyHealth === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-12 py-8 rounded-2xl text-center">
            <div className="text-4xl font-bold mb-4">胜利！</div>
            <div className="text-xl">你击败了敌人</div>
            <div className="text-lg mt-2">连击数: {combo}</div>
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
