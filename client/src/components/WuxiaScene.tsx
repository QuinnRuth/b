import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function WuxiaScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState(60);
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(100);

  useEffect(() => {
    if (!containerRef.current) return;

    // 场景设置
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0e6d2); // 古风米黄色背景
    scene.fog = new THREE.Fog(0xf0e6d2, 50, 200);

    // 相机设置
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);

    // 渲染器设置
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
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

    // 添加地面起伏
    const positions = groundGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
      positions.setZ(i, height);
    }
    positions.needsUpdate = true;
    groundGeometry.computeVertexNormals();

    // 主角（简单的胶囊体）
    const playerGroup = new THREE.Group();
    
    // 身体
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      roughness: 0.5,
      metalness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    playerGroup.add(body);

    // 头部标记
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

    // 添加一些环境物体（树木）
    const createTree = (x: number, z: number) => {
      const treeGroup = new THREE.Group();
      
      // 树干
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.castShadow = true;
      trunk.position.y = 2;
      treeGroup.add(trunk);

      // 树冠
      const foliageGeometry = new THREE.ConeGeometry(2, 4, 8);
      const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.castShadow = true;
      foliage.position.y = 5;
      treeGroup.add(foliage);

      treeGroup.position.set(x, 0, z);
      scene.add(treeGroup);
    };

    // 随机放置树木
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      if (Math.abs(x) > 10 || Math.abs(z) > 10) {
        createTree(x, z);
      }
    }

    // 添加敌人（简单的立方体）
    const enemyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0xff4444 });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(10, 1, 5);
    enemy.castShadow = true;
    scene.add(enemy);

    // 键盘输入
    const keys: { [key: string]: boolean } = {};
    window.addEventListener('keydown', (e) => {
      keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
      keys[e.key.toLowerCase()] = false;
    });

    // 玩家状态
    const playerState = {
      velocity: new THREE.Vector3(),
      isJumping: false,
      canDoubleJump: true,
      isLightSkill: false,
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

        // 角色朝向移动方向
        const angle = Math.atan2(moveDirection.x, moveDirection.z);
        playerGroup.rotation.y = angle;
      }

      // 轻功奔跑（Shift键）
      if (keys['shift'] && moveDirection.length() > 0) {
        if (!playerState.isLightSkill) {
          playerState.isLightSkill = true;
        }
        setEnergy((prev) => Math.max(0, prev - 0.5));
      } else {
        playerState.isLightSkill = false;
        setEnergy((prev) => Math.min(100, prev + 0.2));
      }

      // 跳跃（空格键）
      if (keys[' ']) {
        if (!playerState.isJumping) {
          playerState.velocity.y = 0.5;
          playerState.isJumping = true;
          playerState.canDoubleJump = true;
        } else if (playerState.canDoubleJump) {
          playerState.velocity.y = 0.5;
          playerState.canDoubleJump = false;
        }
        keys[' '] = false; // 防止连续触发
      }

      // 重力和跳跃
      playerState.velocity.y -= 0.02;
      playerGroup.position.y += playerState.velocity.y;

      if (playerGroup.position.y <= 2) {
        playerGroup.position.y = 2;
        playerState.velocity.y = 0;
        playerState.isJumping = false;
        playerState.canDoubleJump = true;
      }

      // 相机跟随
      const cameraOffset = new THREE.Vector3(0, 10, 20);
      const cameraPosition = playerGroup.position.clone().add(cameraOffset);
      camera.position.lerp(cameraPosition, 0.1);
      camera.lookAt(playerGroup.position);

      // 敌人简单AI（朝向玩家）
      const directionToPlayer = new THREE.Vector3()
        .subVectors(playerGroup.position, enemy.position)
        .normalize();
      const angleToPlayer = Math.atan2(directionToPlayer.x, directionToPlayer.z);
      enemy.rotation.y = angleToPlayer;

      renderer.render(scene, camera);
    };

    animate();

    // 清理
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', () => {});
      window.removeEventListener('keyup', () => {});
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 space-y-2 text-white font-mono">
        <div className="bg-black/50 px-4 py-2 rounded">
          FPS: {fps}
        </div>
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
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-6 py-4 rounded-lg font-mono text-sm space-y-1">
        <div className="font-bold mb-2">操作指南</div>
        <div>WASD - 移动</div>
        <div>空格 - 跳跃/二段跳</div>
        <div>Shift - 轻功奔跑</div>
        <div>鼠标左键 - 攻击（待实现）</div>
      </div>
    </div>
  );
}
