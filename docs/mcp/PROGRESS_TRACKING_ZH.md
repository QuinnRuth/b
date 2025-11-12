# MCP 自我检测与推进指南

本指南约定在 Codex CLI 或兼容 MCP 的环境中，如何用"计划 + 反思 + 记忆"实现智能体自检与稳步推进。

## 工具约定
- 计划：`functions.update_plan` 用于维护任务清单与状态（pending/in_progress/completed）。
- 反思：`functions.mcp__sequential-thinking__sequentialthinking` 用于多步思考与假设校验。
- 记忆：`functions.mcp__memory__*` 用于记录事实、结论、关系与关键节点。

## 日常循环（Daily）
1) 拉取当日目标（从路线图/冲刺 Backlog 拆分）。
2) 调用 `update_plan` 建立/更新任务状态。
3) 开发中若遇到不确定性或失败试验，调用 `sequentialthinking` 写出思考链与备选方案。
4) 关键事实、决策、风险录入 `memory.add_observations`，便于跨天/跨人衔接。
5) 收工前：
   - 标注完成项与阻塞项；
   - 附上演示链接/录屏/指标数据；
   - 写下明日最小可推进点（Next best move）。

## 每周复盘（Weekly）
- 对照 `docs/roadmap/YEAR1_ROADMAP_ZH.md:1` 的当月目标，评估完成度；
- 输出：
  - 成果清单（链接到提交/文件路径）；
  - 指标对比（FPS/内存/加载/崩溃等）；
  - 主要阻塞与解决计划；

## 里程碑验收（Milestone）
- 使用 `docs/checklists/MILESTONE_ACCEPTANCE_ZH.md:1` 清单；
- 产出：可运行演示、指标报告、评审纪要、风险与后续计划。

## 示例（片段）

- 更新计划：
```json
{
  "explanation": "M3 任务系统切片推进",
  "plan": [
    {"status":"completed","step":"任务数据结构定义"},
    {"status":"in_progress","step":"任务触发与条件验证"},
    {"status":"pending","step":"奖励结算与UI追踪"}
  ]
}
```

- 记录事实（记忆）：
```json
{
  "observations": [{
    "entityName":"任务系统",
    "contents":[
      "支持条件: 物品/击杀/区域/时间段",
      "触发源: NPC/机关/区域进入",
      "奖励: 经验/装备/名望/解锁区域"
    ]
  }]
}
```

- 反思（多步思考）：
```json
{
  "thought":"在性能与打击感间取舍，先实现受击硬直与材质命中反馈，规避全局慢动作",
  "thoughtNumber":1,
  "totalThoughts":3,
  "nextThoughtNeeded":true
}
```

## 产出归档
- 每月创建 `sprints/YYMM/`：
  - `backlog.md`：当月拆解；
  - `demo.md`：演示说明、截图/录屏链接；
  - `metrics.md`：指标对比；
  - `retro.md`：复盘与改进项；

---
统一在提交说明中附带：更新后的计划摘要、演示路径、关键指标、风险与下一步。
