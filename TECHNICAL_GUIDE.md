# 江湖墨世录 3D原型 - 技术指南

## 项目概述

这是一个基于**Three.js**的3D武侠游戏原型，用于验证核心玩法和技术可行性，为后续使用Unity或Unreal Engine 5进行完整开发提供参考。

### 技术栈

- **前端框架**: React 19
- **3D引擎**: Three.js 0.181
- **语言**: TypeScript
- **构建工具**: Vite
- **UI库**: Tailwind CSS 4

---

## 已实现功能

### 1. 3D场景系统

**场景构成**：
- 200x200的地形平面，带有程序化生成的起伏
- 环境雾效（Fog）增强深度感
- 20棵随机分布的树木
- 动态光照系统（环境光 + 平行光）
- 实时阴影渲染

**技术实现**：
```typescript
// 地形起伏生成
const positions = groundGeometry.attributes.position;
for (let i = 0; i < positions.count; i++) {
  const x = positions.getX(i);
  const y = positions.getY(i);
  const height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2;
  positions.setZ(i, height);
}
positions.needsUpdate = true;
groundGeometry.computeVertexNormals();
```

### 2. 角色控制系统

**移动控制**：
- WASD键控制移动
- 角色自动朝向移动方向
- 移动速度：普通0.15，轻功0.3

**相机系统**：
- 第三人称跟随相机
- 平滑插值（Lerp）跟随
- 固定偏移量（0, 10, 20）

**技术实现**：
```typescript
// 相机跟随
const cameraOffset = new THREE.Vector3(0, 10, 20);
const cameraPosition = playerGroup.position.clone().add(cameraOffset);
camera.position.lerp(cameraPosition, 0.1);
camera.lookAt(playerGroup.position);
```

### 3. 轻功系统

**功能**：
- 跳跃（空格键）
- 二段跳（空中再按空格）
- 轻功奔跑（Shift + 移动）
- 内力消耗机制

**物理模拟**：
```typescript
// 重力和跳跃
playerState.velocity.y -= 0.02; // 重力加速度
playerGroup.position.y += playerState.velocity.y;

// 着地检测
if (playerGroup.position.y <= 2) {
  playerGroup.position.y = 2;
  playerState.velocity.y = 0;
  playerState.isJumping = false;
  playerState.canDoubleJump = true;
}
```

### 4. 战斗系统

**玩家攻击**：
- 鼠标左键触发攻击
- 攻击冷却时间：30帧
- 攻击范围：5单位
- 每次攻击伤害：10点

**敌人AI**：
- 巡逻模式：在3个巡逻点之间移动
- 追逐模式：玩家进入15单位范围内触发
- 攻击模式：玩家进入3单位范围内攻击
- 死亡动画：生命值归零后缓慢下沉

**技术实现**：
```typescript
// 敌人AI状态机
const distanceToPlayer = playerGroup.position.distanceTo(enemyGroup.position);
if (distanceToPlayer < 15 && enemyHealth > 0) {
  // 追逐玩家
  enemyState.isChasing = true;
  const directionToPlayer = new THREE.Vector3()
    .subVectors(playerGroup.position, enemyGroup.position)
    .normalize();
  enemyGroup.position.add(directionToPlayer.multiplyScalar(0.05));
} else if (enemyHealth > 0) {
  // 巡逻
  const targetPoint = enemyState.patrolPoints[enemyState.currentPatrolIndex];
  // ...
}
```

### 5. 粒子系统

**剑气特效**：
- 500个粒子
- 攻击时从剑尖发射
- 加法混合模式（Additive Blending）
- 青色发光效果

**轻功特效**：
- 轻功奔跑时从脚下发射粒子
- 向上运动模拟气流

**技术实现**：
```typescript
// 粒子发射
const emitParticles = (position: THREE.Vector3, direction: THREE.Vector3) => {
  for (let i = 0; i < 10; i++) {
    const idx = (particleIndex + i) % particlesCount;
    particlesPositions[idx * 3] = position.x;
    particlesPositions[idx * 3 + 1] = position.y;
    particlesPositions[idx * 3 + 2] = position.z;

    particlesVelocities[idx] = direction
      .clone()
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ));
  }
  particleIndex = (particleIndex + 10) % particlesCount;
};
```

### 6. UI系统

**HUD元素**：
- FPS显示
- 玩家生命值（红色进度条）
- 玩家内力（蓝色进度条）
- 敌人生命值（橙色进度条）
- 连击数显示
- 操作提示面板

**胜利/失败判定**：
- 敌人生命值归零：显示胜利画面
- 玩家生命值归零：显示失败画面

---

## 性能优化

### 当前优化措施

1. **渲染优化**：
   - 限制像素比：`Math.min(window.devicePixelRatio, 2)`
   - 抗锯齿开启
   - 软阴影（PCFSoftShadowMap）

2. **粒子优化**：
   - 固定粒子数量（500个）
   - 粒子复用（对象池模式）
   - 远离粒子自动重置

3. **几何体优化**：
   - 低多边形模型
   - 合理的细分级别

### 性能指标

- **FPS**: 11-60（取决于设备性能）
- **渲染对象**: ~30个
- **粒子数量**: 500个
- **阴影贴图**: 2048x2048

---

## 迁移到Unity的建议

### 1. 场景迁移

**Unity实现**：
```csharp
// 地形系统
Terrain terrain = Terrain.activeTerrain;
TerrainData terrainData = terrain.terrainData;

// 程序化生成地形高度
float[,] heights = new float[resolution, resolution];
for (int y = 0; y < resolution; y++) {
    for (int x = 0; x < resolution; x++) {
        heights[y, x] = Mathf.Sin(x * 0.1f) * Mathf.Cos(y * 0.1f) * 0.1f;
    }
}
terrainData.SetHeights(0, 0, heights);
```

**优势**：
- Unity Terrain系统更强大
- 支持多层纹理混合
- 内置植被系统（Foliage）
- 更好的性能优化

### 2. 角色控制迁移

**Unity实现**：
```csharp
public class PlayerController : MonoBehaviour {
    public float moveSpeed = 5f;
    public float lightSkillSpeed = 10f;
    private CharacterController controller;
    private Vector3 velocity;

    void Update() {
        // 移动输入
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        Vector3 move = transform.right * horizontal + transform.forward * vertical;

        // 速度调整
        float speed = Input.GetKey(KeyCode.LeftShift) ? lightSkillSpeed : moveSpeed;
        controller.Move(move * speed * Time.deltaTime);

        // 重力
        velocity.y += Physics.gravity.y * Time.deltaTime;
        controller.Move(velocity * Time.deltaTime);

        // 着地检测
        if (controller.isGrounded && velocity.y < 0) {
            velocity.y = -2f;
        }
    }
}
```

**优势**：
- CharacterController组件处理碰撞
- 物理引擎更精确
- 输入系统更完善

### 3. 战斗系统迁移

**Unity实现**：
```csharp
public class CombatSystem : MonoBehaviour {
    public float attackRange = 5f;
    public int attackDamage = 10;
    public LayerMask enemyLayer;

    void Update() {
        if (Input.GetMouseButtonDown(0)) {
            Attack();
        }
    }

    void Attack() {
        // 射线检测
        RaycastHit hit;
        if (Physics.Raycast(transform.position, transform.forward, out hit, attackRange, enemyLayer)) {
            EnemyHealth enemy = hit.collider.GetComponent<EnemyHealth>();
            if (enemy != null) {
                enemy.TakeDamage(attackDamage);
            }
        }

        // 播放攻击动画
        GetComponent<Animator>().SetTrigger("Attack");

        // 生成粒子特效
        Instantiate(swordEffectPrefab, transform.position, transform.rotation);
    }
}
```

**优势**：
- 物理射线检测更精确
- Animator系统支持复杂动画
- Prefab系统方便特效管理

### 4. 粒子系统迁移

**Unity实现**：
```csharp
// 使用Unity Particle System
ParticleSystem ps = GetComponent<ParticleSystem>();
var emission = ps.emission;
emission.rateOverTime = 50;

var main = ps.main;
main.startColor = Color.cyan;
main.startSize = 0.2f;
main.startLifetime = 2f;

// VFX Graph（更高级）
// 可视化编程，支持GPU加速
```

**优势**：
- 可视化编辑器
- GPU加速（VFX Graph）
- 更丰富的预设效果

---

## 迁移到Unreal Engine 5的建议

### 1. 场景迁移

**UE5实现**：
```cpp
// Landscape系统
ALandscape* Landscape = GetWorld()->SpawnActor<ALandscape>();
ULandscapeInfo* LandscapeInfo = Landscape->CreateLandscapeInfo();

// Nanite虚拟几何体
// 支持数十亿多边形，无需手动LOD
UStaticMesh* TreeMesh = LoadObject<UStaticMesh>(nullptr, TEXT("/Game/Models/Tree"));
TreeMesh->NaniteSettings.bEnabled = true;
```

**优势**：
- Nanite技术：无限细节
- Lumen全局光照：实时GI
- 更真实的渲染效果

### 2. 角色控制迁移

**UE5实现**：
```cpp
// Character类（C++）
void APlayerCharacter::Tick(float DeltaTime) {
    Super::Tick(DeltaTime);

    // 移动输入
    FVector InputVector = GetInputAxisVector();
    float Speed = bIsLightSkill ? LightSkillSpeed : MoveSpeed;
    AddMovementInput(InputVector, Speed);

    // 跳跃
    if (bPressedJump) {
        if (CanJump()) {
            Jump();
        } else if (bCanDoubleJump) {
            LaunchCharacter(FVector(0, 0, JumpZVelocity), false, true);
            bCanDoubleJump = false;
        }
    }
}
```

**优势**：
- Character Movement Component功能强大
- 蓝图可视化编程
- 更好的网络同步

### 3. 战斗系统迁移

**UE5实现**：
```cpp
// 使用Gameplay Ability System (GAS)
UCLASS()
class UGA_Attack : public UGameplayAbility {
    virtual void ActivateAbility(...) override {
        // 播放蒙太奇动画
        PlayMontageAndWait(AttackMontage);

        // 生成粒子特效（Niagara）
        UNiagaraFunctionLibrary::SpawnSystemAtLocation(
            GetWorld(),
            SwordEffectSystem,
            GetActorLocation()
        );

        // 应用伤害
        UGameplayEffect* DamageEffect = NewObject<UGameplayEffect>();
        ApplyGameplayEffectToTarget(DamageEffect, TargetData);
    }
};
```

**优势**：
- GAS系统：模块化技能系统
- Niagara粒子系统：GPU加速
- 更强大的动画系统

### 4. 粒子系统迁移

**UE5实现**：
```cpp
// Niagara粒子系统
UNiagaraSystem* SwordEffect = LoadObject<UNiagaraSystem>(
    nullptr,
    TEXT("/Game/VFX/SwordTrail")
);

UNiagaraComponent* NiagaraComp = UNiagaraFunctionLibrary::SpawnSystemAttached(
    SwordEffect,
    SwordMesh,
    TEXT("SwordTip"),
    FVector::ZeroVector,
    FRotator::ZeroRotator,
    EAttachLocation::SnapToTarget,
    true
);
```

**优势**：
- 可视化编辑器
- GPU模拟
- 支持复杂的粒子行为

---

## 技术对比总结

| 特性 | Three.js | Unity | Unreal Engine 5 |
|------|----------|-------|-----------------|
| **开发速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **画面质量** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **性能** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **学习曲线** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **跨平台** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **社区支持** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **适用场景** | 原型/轻量级 | 中小型游戏 | 3A大作 |

---

## 下一步开发建议

### 短期（1-2周）

1. **优化当前原型**：
   - 添加水墨风格后处理
   - 实现天空盒
   - 优化性能（LOD系统）

2. **扩展内容**：
   - 添加更多敌人类型
   - 实现技能系统
   - 添加音效

### 中期（1-2个月）

1. **迁移到Unity**：
   - 重建场景和角色
   - 实现完整战斗系统
   - 添加剧情系统

2. **内容制作**：
   - 3D角色模型
   - 场景美术资源
   - 音乐和音效

### 长期（6-12个月）

1. **迁移到UE5**（可选）：
   - 追求极致画面
   - 大型开放世界
   - 商业级发布

2. **完整游戏**：
   - 8章完整剧情
   - 多样化玩法
   - 多平台发布

---

## 总结

这个Three.js原型成功验证了核心玩法的可行性，为后续开发提供了坚实的技术基础。无论选择Unity还是UE5，都可以基于这个原型的设计理念进行扩展和优化。

**核心优势**：
- 快速迭代验证想法
- 零安装，浏览器直接运行
- 易于分享和演示
- 为团队提供可视化参考

**下一步行动**：
- 根据测试反馈优化玩法
- 选择最适合的引擎进行完整开发
- 组建团队开始内容制作

**江湖墨世录，未来可期！** 🗡️
