# Table V2 实现任务清单

> 基于 [DESIGN_V2.md](./DESIGN_V2.md) 和 [implementation_plan.md](./implementation_plan.md) 的分阶段实施计划

---

## 阶段 1：dt 统一模型（核心基础）

### 1.1 类型定义
- [x] 创建 `types.ts`：核心类型
  - [x] `DataTableInstance`、`DataTableStatus`、`DataTableActivity`
  - [x] `DataTablePagination`、`DataTableSelection`、`DataTableTree`、`DataTableDragSort`
  - [x] `DataTableActions`、`TableFilters`
  - [x] `DataTableError`、`DataTableErrors`
- [x] 创建状态适配器类型
  - [x] `TableStateSnapshot`、`TableStateAdapter`
  - [x] `TableSort`、`TableStateChangeReason`
  - [x] `UrlStateOptions`、`ControlledStateOptions`、`InternalStateOptions`
- [x] 创建数据源类型
  - [x] `DataSource`、`DataTableQuery`、`DataTableDataState`、`DataTableDataResult`
  - [x] `RemoteDataSourceOptions`、`LocalDataSourceOptions`
- [x] 创建 Feature 配置类型
  - [x] `DataTableFeatures`
  - [x] `SelectionFeatureOptions`（含 `CrossPageSelection`）
  - [x] `ColumnVisibilityFeatureOptions`、`ColumnSizingFeatureOptions`
  - [x] `PinningFeatureOptions`、`ExpansionFeatureOptions`、`DensityFeatureOptions`
  - [x] `TreeFeatureOptions`、`DragSortFeatureOptions`
- [x] 创建列定义扩展类型
  - [x] `DataTableColumnMeta`
  - [x] `FilterType`、`FilterDefinition`

### 1.2 状态适配器
- [x] 实现 `stateUrl()`：URL 状态同步适配器
  - [x] 使用 TanStack Router 的 search API
  - [x] 支持 parsers/codec 类型转换
  - [x] 支持 middleware 自定义行为
  - [x] 默认 `resetPageOnFilterChange=true`
  - [x] 数组参数使用重复 key（`?status=a&status=b`）
  - [x] `sort` 序列化为 `field.asc|field.desc`
- [x] 实现 `stateControlled()`：受控状态适配器
  - [x] 支持 `resetPageOnFilterChange` 配置
  - [x] 同步调用 onChange
- [x] 实现 `stateInternal()`：内部状态适配器
  - [x] 支持 `resetPageOnFilterChange` 配置
  - [x] 使用 useSyncExternalStore 模式

### 1.3 数据源适配器
- [x] 实现 `remote()`：TanStack Query 数据源
  - [x] `queryKey` 由 core 统一追加 state 依赖
  - [x] `filters/sort` 稳定化（结构化序列化）
  - [x] `map` 是唯一的非标准响应格式入口
  - [x] `extraMeta` 透传到 `dt.meta.data.extraMeta`
- [x] 实现 `local()`：本地数据源
  - [x] 前端实现 filter/sort/pagination
  - [x] 支持同步返回数据

### 1.4 核心 Hook
- [x] 实现 `useDataTable()`：统一入口
  - [x] 从 `state` 适配器获取 snapshot
  - [x] 调用 `dataSource.use(query)` 获取数据
  - [x] 创建 TanStack Table 实例
  - [x] 组合 `actions`、`filters`、`selection`、`tree`、`dragSort`
  - [x] 应用 `features`（按确定顺序）
  - [x] 计算 `status`（error | empty | ready）
  - [x] 计算 `activity`（isInitialLoading, isFetching, preferencesReady）
  - [x] 处理错误分类（blocking vs nonBlocking）
- [x] 实现 `actions` 对象：所有交互动作
  - [x] 数据操作：`refetch`、`retry`、`resetAll`
  - [x] 分页与排序：`setPage`、`setPageSize`、`setSort`、`clearSort`
  - [x] 选择操作：`clearSelection`、`selectAllCurrentPage`、`selectAllMatching`
  - [x] 偏好重置：`resetColumnVisibility`、`resetColumnSizing`、`resetDensity`
  - [x] 树形操作：`expandRow`、`collapseRow`、`toggleRowExpanded`、`expandAll`、`collapseAll`、`expandToDepth`
  - [x] 拖拽排序：`moveRow`
- [x] 实现 `filters` 对象：强类型筛选模型
  - [x] `state`、`set`、`setBatch`、`reset`
- [x] 确保引用稳定性
  - [x] `dt.actions` 使用稳定回调
  - [x] `dt.filters` 对象引用稳定

### 1.5 最小 UI 闭环
- [x] 实现 `DataTableRoot`：根容器 + Context Provider
  - [x] 使用拆分 Context 减少重渲染
  - [x] 支持 `layout` 配置（scrollContainer, stickyHeader, stickyPagination）
  - [x] 支持 `height` 约束
  - [x] 支持 CSS 变量 `--dt-sticky-top` / `--dt-sticky-bottom`
- [x] 实现 `DataTableTable`：表格渲染组件
  - [x] 根据 `dt.status` 渲染不同状态
  - [x] 支持自定义 `renderEmpty/renderError`
  - [x] 处理 `activity.isInitialLoading` 骨架屏
  - [x] 处理 `activity.isFetching` 轻量反馈
  - [x] 使用 Shadcn `Table` 组件
- [x] 实现 `DataTablePagination`：分页组件
  - [x] 调用 `dt.actions.setPage/setPageSize`
  - [x] 显示 `dt.pagination`
  - [x] i18n 文案统一管理
  - [x] 使用 Shadcn `Pagination` 组件

---

## 阶段 2：筛选与搜索能力

### 2.1 搜索组件
- [x] 实现 `DataTableSearch`
  - [x] 更新 `dt.filters.set(filterKey, value)`，默认 `filterKey="q"`
  - [x] 支持 `debounceMs` 配置（默认 300ms）
  - [x] 支持 i18n placeholder
  - [x] 使用 Shadcn `Input` 组件 + `Search` 图标

### 2.2 筛选器组件体系
- [x] 实现 `DataTableFilterBar`：筛选条容器
  - [x] 支持折叠/展开
  - [x] 支持 `maxVisible` 控制默认显示数量
  - [x] 支持 `collapsible` 配置
- [x] 实现 `DataTableFilterItem`：单个筛选项
  - [x] 根据 `FilterDefinition.type` 渲染不同控件
  - [x] 支持 8 种筛选器类型（text, select, multi-select, date, date-range, number-range, boolean, custom）
  - [x] 通过 `dt.filters.set` 更新值
  - [x] 支持自定义 `render`
- [x] 实现 `DataTableActiveFilters`：已激活筛选标签
  - [x] 以 Badge/Tag 形式展示
  - [x] 支持单个移除与全部清除
  - [x] 只展示非空值

---

## 阶段 3：Feature 基础能力

### 3.1 Selection Feature
- [x] 实现 `selection` feature（`core/features/selection.ts`）
  - [x] 支持 `mode="page"` 和 `mode="cross-page"`
  - [x] 实现 `CrossPageSelection` 模型（include/exclude 模式）
  - [x] 支持 `selectAllStrategy: "client" | "server"`
  - [x] 支持 `maxSelection` 限制
  - [x] `selectedRowsCurrentPage` 永远只代表当前页可见行数据
- [x] 创建选择列工厂 `select()`（`columns/select.tsx`）
  - [x] 40px 宽，不可隐藏/调整，`id: __select__`
  - [x] 使用 Shadcn `Checkbox` 组件
  - [x] 支持 `aria-label` 可访问性
- [x] 实现 `DataTableSelectionBar`（`ui/selection-bar.tsx`）
  - [x] 显示选中数量
  - [x] 提供 `actions` 插槽
  - [x] 跨页选择时提供升级/回退入口

### 3.2 Column Visibility Feature
- [x] 实现 `columnVisibility` feature（`core/features/column-visibility.ts`）
  - [x] 使用 envelope 格式（`PreferenceEnvelope<Record<string, boolean>>`）
  - [x] 实现合并规则（丢弃已不存在的列，新增列使用默认值）
  - [x] 支持迁移函数处理列重命名
  - [x] 优先使用 `getSync` 同步 hydration
- [x] 实现 `DataTableColumnToggle`（`ui/column-toggle.tsx`）
  - [x] 使用 Shadcn `DropdownMenu` + `Checkbox` 列表
  - [x] 列名从 `column.meta.headerLabel` 或 `column.header` 获取
  - [x] 支持全选/取消全选

### 3.3 Column Sizing Feature
- [x] 实现 `columnSizing` feature（`core/features/column-sizing.ts`）
  - [x] 使用 envelope 格式（`PreferenceEnvelope<Record<string, number>>`）
  - [x] 实现合并规则（约束修正：最小/最大宽度、非法值丢弃）
  - [x] 支持迁移函数
  - [x] 使用 TanStack Table 的 `columnResizeMode="onChange"`
  - [x] 拖拽手柄使用 `cursor-col-resize`

### 3.4 Pinning Feature
- [x] 实现 `pinning` feature（`core/features/pinning.ts`）
  - [x] 固定列使用 `position: sticky`
  - [x] 固定列 header 的交叉区域层级必须更高（`z-index`）
  - [x] 左固定列：`left: 0`，右固定列：`right: 0`
  - [x] 支持阴影提示（滚动时显示）

### 3.5 Expansion Feature
- [x] 实现 `expansion` feature（`core/features/expansion.ts`）
  - [x] 支持 `getRowCanExpand` 配置
- [x] 创建展开列工厂 `expand()`（`columns/expand.tsx`）
  - [x] 40px 宽，不可隐藏/调整，`id: __expand__`
  - [x] 展开按钮使用 `ChevronRight`/`ChevronDown` 图标
  - [x] 支持 `aria-label` 可访问性

### 3.6 Density Feature
- [x] 实现 `density` feature（`core/features/density.ts`）
  - [x] 使用 envelope 格式
  - [x] 通过 CSS 类控制行高与内边距
  - [x] `compact`：`py-2`，`comfortable`：`py-4`
  - [x] 提供切换按钮（可选）

---

## 阶段 4：高级能力

### 4.1 Tree Feature（树形数据）
- [x] 实现 `tree` feature（`core/features/tree.ts`）
  - [x] 支持同步数据（`getSubRows`）
  - [x] 支持异步懒加载（`loadChildren`）
  - [x] `dt.tree.expandedRowIds` 管理展开状态
  - [x] `dt.tree.loadingRowIds` 管理加载状态
  - [x] 支持 `defaultExpandedDepth` 和 `defaultExpandedRowIds`
  - [x] 与 selection 组合时支持 `selectionBehavior: "independent" | "cascade"`
  - [x] 与 dragSort 组合时支持 `allowNesting`
- [x] 实现 `DataTableTreeCell`（`ui/tree-cell.tsx`）
  - [x] 缩进使用 `paddingLeft: depth * indentSize`（默认 24px）
  - [x] 展开图标状态：可展开/已展开/正在加载/无子节点
  - [x] 使用 `ChevronRight`/`ChevronDown`/`Spinner` 图标

### 4.2 Drag Sort Feature（拖拽排序）
- [x] 安装依赖：`@dnd-kit/core`、`@dnd-kit/sortable`
- [x] 实现 `dragSort` feature（`core/features/drag-sort.ts`）
  - [x] 基于 `@dnd-kit` 实现
  - [x] 支持拖拽手柄模式和整行拖拽模式
  - [x] `dt.dragSort.isDragging` 管理拖拽状态
  - [x] `dt.dragSort.activeId` 记录当前拖拽的行 ID
  - [x] 支持 `dragOverlay: "row" | "ghost" | "minimal"`
  - [x] 与 tree 组合时支持跨层级拖拽（`allowNesting`）
  - [x] 实现放置策略（上方/下方/内部）
  - [x] 支持乐观更新和服务端确认
  - [x] 防止将父节点拖入自己的子节点
- [x] 创建拖拽手柄列工厂 `dragHandle()`（`columns/drag-handle.tsx`）
  - [x] 40px 宽，不可隐藏/调整，`id: __drag_handle__`
  - [x] 使用 `GripVertical` 图标，`cursor: grab`
- [x] 实现 `DataTableDragHandle`（`ui/drag-handle.tsx`）
- [x] 实现 `DataTableDropIndicator`（`ui/drop-indicator.tsx`）
  - [x] 2px 高亮线，颜色使用 `--primary`
  - [x] 动画：fade-in 150ms

### 4.3 虚拟滚动（预留）
- [x] API 预留：`features.virtualization`
- [x] 文档说明约束与实现方向

---

## 阶段 5：DX 收敛与工具

### 5.1 DataTablePreset（一把梭组件）
- [x] 实现 `DataTablePreset`（`ui/preset.tsx`）
  - [x] 提供标准组合（Root + Toolbar + Table + SelectionBar + Pagination）
  - [x] 支持插槽：`toolbar`、`toolbarActions`、`selectionBarActions`、`renderEmpty`、`renderError`
  - [x] 支持 `layout` 配置

### 5.2 列定义工具
- [x] 实现 `createColumnHelper<TData>()`（`columns/helper.ts`）
  - [x] `accessor(accessor, column)`：访问器列
  - [x] `display(column)`：显示列
  - [x] `select()`：选择列
  - [x] `expand()`：展开列
  - [x] `dragHandle()`：拖拽手柄列
  - [x] `actions(render)`：操作列（80px 宽，固定右侧，`id: __actions__`）

### 5.3 偏好持久化工具
- [x] 实现偏好持久化工具（`core/utils/preference-storage.ts`）
  - [x] `PreferenceEnvelope<TValue>` 类型
  - [x] `mergeRecordPreference()` 函数
  - [x] `PreferenceMigration` 类型
  - [x] 合并规则实现

### 5.4 i18n 配置
- [x] 定义 `DataTableI18n` 接口
- [x] 实现 `TableConfigProvider`（可选）
- [x] 支持全局配置 + 组件局部覆盖
- [x] 提供默认中文文案

### 5.5 引用稳定性工具
- [x] 实现引用稳定性工具（`core/utils/reference-stability.ts`）
  - [x] `useStableCallback()`：稳定回调引用
  - [x] `useStableObject()`：稳定对象引用（浅比较）

---

## 验证与测试

### 单元测试
- [x] 状态适配器单元测试
  - [x] `stateUrl` 测试
  - [x] `stateControlled` 测试
  - [x] `stateInternal` 测试
- [x] 数据源适配器单元测试
  - [x] `remote` 测试
  - [x] `local` 测试
- [x] `useDataTable` 集成测试
- [x] Feature 单元测试
  - [x] `selection` 测试
  - [x] `columnVisibility` 测试
  - [x] `columnSizing` 测试
  - [x] `tree` 测试
  - [x] `dragSort` 测试

### 手动验证
- [x] 创建示例页面 `src/features/example/table/index.tsx`
- [ ] 验证阶段 1 场景
  - [ ] 首次加载显示 loading
  - [ ] 数据加载后正常渲染
  - [ ] 空数据显示 empty state
  - [ ] 分页切换正常
  - [ ] 排序正常
  - [ ] URL 参数同步正常
  - [ ] 刷新保留状态
- [ ] 验证阶段 2 场景
  - [ ] 搜索框 debounce 正常
  - [ ] 筛选器更新正常
  - [ ] 筛选变化自动重置 page
  - [ ] 已激活筛选标签显示正常
- [ ] 验证阶段 3 场景
  - [ ] 选择功能正常（page 模式）
  - [ ] 跨页选择正常（cross-page 模式）
  - [ ] 列显示切换正常
  - [ ] 列宽调整正常
  - [ ] 固定列正常
  - [ ] 行展开正常
  - [ ] 密度切换正常
- [ ] 验证阶段 4 场景
  - [ ] 树形数据展开/折叠正常
  - [ ] 树形数据懒加载正常
  - [ ] 拖拽排序正常（local 数据源）
  - [ ] 拖拽排序正常（remote 数据源 + 乐观更新）
  - [ ] 树形数据拖拽改变层级正常
- [ ] 验证阶段 5 场景
  - [ ] `DataTablePreset` 一把梭用法正常
  - [ ] 列定义工厂函数正常
  - [ ] 偏好持久化正常
  - [ ] i18n 配置正常

---

## 文档与示例

- [ ] 编写 API 文档
  - [ ] `useDataTable` API
  - [ ] 状态适配器 API
  - [ ] 数据源适配器 API
  - [ ] Feature 配置 API
  - [ ] UI 组件 API
- [ ] 编写使用指南
  - [ ] 快速开始
  - [ ] 基础用法
  - [ ] 高级用法
  - [ ] 最佳实践
- [ ] 编写迁移指南（V1 -> V2）
- [ ] 提供示例代码
  - [ ] 基础表格
  - [ ] 远程分页表格
  - [ ] 带筛选的表格
  - [ ] 带选择的表格
  - [ ] 树形表格
  - [ ] 可拖拽排序的表格

---

## 发布准备

- [ ] 代码审查
- [ ] 性能测试
- [ ] 可访问性测试
- [ ] 浏览器兼容性测试
- [ ] 编写 CHANGELOG
- [ ] 更新 README
- [ ] 发布 V2.0.0
