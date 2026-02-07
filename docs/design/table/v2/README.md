# 表格组件 V2 设计文档

本文档描述一个“彻底不兼容升级”的表格组件体系。它以 **Headless 内核 + 状态/数据源适配器 + UI 组合组件** 为核心，目标是让业务接入表格时只需要配置：列定义、数据源、状态来源与功能开关，其他能力均标准化、可复用、可持久化。

> 范围：仅描述对外 API 与模块分层设计，不包含具体实现代码。

---

## 1. 背景与问题

当前体系具备良好的架构原则（以 TanStack Table 的 `table` 实例为单一事实来源），但在实际使用中仍存在“能力入口分散”的现象：

- URL 同步：业务层 `useDataTable`、组件层 `DataTableSearch` 都会操作 URL（两套口径）。
- UI 状态：`loading/empty/fetching/error` 在 Hook 与 UI 之间缺少统一状态模型，导致调用方需要拼装 props。
- 功能扩展：列显示、列宽、固定列、选择/批量操作等能力缺少统一的 feature 接入方式与持久化约束。
- 组合方式过多：`PaginatedTable`、`DataTableContainer`、`DataTablePagination`、`DataTableToolbar`、`DataTableFilterBar` 的责任边界可以更清晰并进一步收敛。

V2 方案以“统一 dt（data-table instance）模型”为中心，通过适配器与 feature 配置，把分散能力收敛到一个核心 API。

---

## 2. 目标与非目标

### 2.1 目标

- 一个核心 Hook：`useDataTable()` 统一产出 `dt`（包含 table、状态、动作、分页、筛选）。
- UI 组件只消费 `dt`：不再要求调用方显式传 `loading/empty/pagination/onPageChange...`。
- 状态来源可插拔：支持 `URL` / `受控` / `内部` 三种模式，且对业务暴露一致的 `dt.filters` 与 `dt.actions`。
- 数据源可插拔：支持 `remote`（TanStack Query）与 `local`（前端数据）等统一接口。
- 功能以 feature 开关接入：selection、columnVisibility、columnSizing、pinning、expansion、density 等按需启用并可持久化。
- 全局/局部 i18n 统一：所有文本与可访问性名称都通过 config 统一管理，组件可局部覆盖。

### 2.2 非目标

- 不追求与现有 API 兼容。
- 虚拟滚动能力已落地，当前不将其作为所有场景的默认策略（组合场景仍在持续优化）。
- 不在 Hook 内部绑定具体 UI 组件库（shadcn），UI 层单独实现。

---

## 3. 核心设计原则

- **Single Source of Truth**：所有表格交互状态（排序、筛选、分页、选择、列可见性、列宽等）最终进入 TanStack Table 的 state（或与其一一映射）。
- **One dt to rule them all**：业务只拿到一个 `dt` 对象作为表格的唯一入口。
- **Adapters over branches**：URL/受控/内部状态通过适配器实现，不在业务层写分支逻辑。
- **Features are configuration**：功能通过 `features` 描述，而非“额外组件 + 额外状态 + 额外约定”。
- **UI is a pure consumer**：UI 只读取 `dt` 并调用 `dt.actions`，不再自行操作 URL、Query、TanStack Table state。

---


## 文档导航

- Core 契约：[`core.md`](./core.md)
- UI 与交互规范：[`ui.md`](./ui.md)
- Features 与高级能力：[`features.md`](./features.md)
- API 文档：[`api-reference.md`](./api-reference.md)
- 偏好持久化与迁移：[`persistence-and-migration.md`](./persistence-and-migration.md)
- 演进策略与 DX：[`evolution-and-dx.md`](./evolution-and-dx.md)
- 渐进式使用说明（实现对齐）：[`usage-guide.md`](./usage-guide.md)
- 示例代码：[`examples.md`](./examples.md)

## 说明

`DESIGN_V2.md` 已拆分为以上子文档。后续新增/变更请优先落在对应专题文件，避免单文件持续膨胀。
