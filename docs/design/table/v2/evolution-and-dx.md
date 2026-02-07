# 表格组件 V2 设计：演进策略与 DX

本文档聚焦 API 稳定性、版本策略、预留能力、能力边界与开发体验收敛。

## 14. 已落地能力与后续预留

### 14.1 多列排序

- API 形状 `sort: TableSort[]` 已支持多元素。
- `stateUrl` 已落地排序串行化：`name.asc|createdAt.desc`（`|` 分隔多列）。
- Feature 开关预留：`multiSort: { enabled, maxColumns }`

### 14.2 虚拟滚动

- API 已落地：`features.virtualization?: { mode, rowHeight, overscan, loadMore, loadMoreOffset }`
- 约束：与 sticky header 和 selection 需保持兼容
- Selection 必须基于 rowId，不能依赖 DOM 索引
- 当前实现生效条件：`scrollContainer="root"` 且未启用 `dragSort/tree/renderSubComponent/analytics.groupBy`
- 后续可继续优化：更复杂组合场景下的共存策略（见 `src/components/table/v2/TODO.md`）

---


## 18. API 稳定性保障

> V2 的核心目标之一是**长期 API 稳定**，避免未来频繁 Breaking Changes。本节总结设计决策与保障策略。

### 23.1 类型设计原则

| 原则               | 说明                | 示例                                                  |
|------------------|-------------------|-----------------------------------------------------|
| **数组优于联合**       | 即使当前只支持单值，也使用数组类型 | `sort: TableSort[]` 而非 `TableSort \| null`          |
| **始终存在优于可选**     | 避免业务层频繁判断可空       | `selection` 始终存在，通过 `enabled` 判断                    |
| **no-op 优于可选方法** | 调用方无需判断方法是否存在     | `actions.clearSelection()` 始终可调用                    |
| **对象优于布尔**       | 便于未来扩展配置项         | `selection: { enabled, mode }` 而非 `selection: true` |
| **批量操作预留**       | 常见操作提前提供批量版本      | `filters.setBatch()`                                |

### 23.2 向前兼容策略

当需要扩展 API 时，遵循以下策略：

```ts
// ✅ 兼容扩展：添加可选字段
interface TableSort {
  field: string
  order: "asc" | "desc"
  priority?: number  // 新增，可选
}

// ❌ Breaking Change：修改字段类型
interface TableSort {
  field: string
  order: "asc" | "desc" | "none"  // 破坏性，禁止
}
```

### 23.3 Deprecation 策略

1. **废弃周期**：废弃的 API 至少保留 **2 个次要版本**
2. **运行时警告**：废弃 API 调用时在开发环境输出 console.warn
3. **类型标记**：使用 `@deprecated` JSDoc 标记
4. **迁移文档**：每个废弃 API 提供迁移指南

```ts
/**
 * @deprecated 使用 `actions.setSort([])` 清除排序
 * 将在 v2.3 移除
 */
actions.clearSort: () => void
```

### 23.4 版本化策略

```ts
// DataTableInstance 包含版本字段，便于调试与迁移检测
interface DataTableInstance<TData, TFilterSchema> {
  __version: "2.0"  // 当前版本
  // ...
}
```

### 23.5 扩展点预留

| 预留点                           | 说明                                |
|-------------------------------|-----------------------------------|
| `status.type`                 | 预留未来可能的状态如 `"partial"`, `"stale"` |
| `DataTableColumnMeta.custom`  | 业务层自定义字段入口                        |
| `TableFilters.meta`           | 预留筛选项元信息扩展                        |
| `DataTableFeatures` 新 feature | 通过可选字段添加，不影响现有配置                  |

### 23.6 Breaking Change 检查清单

发布新版本前必须确认：

- [ ] 新增字段均为可选或有合理默认值
- [ ] 类型签名变更有兼容层
- [ ] 废弃 API 有迁移文档
- [ ] 运行时行为变更有 feature flag 控制
- [ ] 主要变更在 CHANGELOG 中记录

---

## 19. DX（开发体验）收敛：Preset 与 Recipes

V2 的分层设计适合“复杂场景按需组合”，但企业后台里大量页面属于“标准 CRUD 列表”。为了避免业务侧反复拼装 `Root/Toolbar/Table/Pagination` 产生模板代码，建议在 UI 层提供一个 **Preset 组件**：对 80% 场景“一把梭”，对复杂场景仍可降级到组合式 API。

### 24.1 `DataTablePreset`（建议）

设计原则：

- `DataTablePreset` **只做 UI 拼装**，内部仍通过 `useDataTable()` 产出 `dt`
- 允许少量插槽满足差异（toolbarActions、selectionBarActions、empty/error 渲染）
- Preset 不新增状态来源与数据源的能力入口，只是把“常见组合方式”标准化

组件 API 形态见 9.1，推荐用法见 9.2。

### 24.2 Recipes（落地片段）

建议在仓库中维护一组“可复制粘贴”的 Recipes（不是再造一套 API），用于降低认知成本：

- 远程分页/排序/筛选的标准接入
- URL 模式下搜索框的 debounce 与“提交态”处理
- 跨页选择的标准交互（见 26.2）
- 列偏好持久化冲突合并（见 25）

---


## 21. 能力边界与扩展建议

V2 第一阶段建议把重点放在“状态、数据、偏好、动作、错误模型”的核心闭环，并明确哪些能力属于扩展层（feature/recipe），避免 core 膨胀。

### 21.1 建议补充到文档中的能力清单（不一定全部进 Core）

- **列顺序（Column Order）**：与列显隐/列宽同属偏好体系，建议作为 feature 增量加入
- **Saved Views（视图方案）**：将 filters/sort/columns preferences 按名称保存与切换（通常落在业务层或上层组件）
- **高级筛选（Filter Builder）**：表达 AND/OR、操作符、范围等（更适合作为 UI/Recipe，在 `dt.filters` 之上构建）
- **导出（CSV/Excel）**：建议作为 `actions.export()` 的可选扩展，复用 columns 的 format 逻辑
- **行内编辑（Inline Editing）**：建议作为 recipe：引入草稿态（draft）、校验与提交动作，不强行进入 core

### 21.2 跨页选择的标准交互（建议写入 UI 规范）

当 `selection.mode = "cross-page"` 时，建议 UI 必须提供明确反馈与升级动作，避免用户误解“到底选了多少条”：

- 默认提示：“已选择本页 N 条”
- 提供升级入口：“选择全部 M 条”
- 提供回退入口：“仅保留本页选择”

这些交互不需要影响 core 契约，但应作为 UI 组件的默认行为（可被业务覆盖）。

---
