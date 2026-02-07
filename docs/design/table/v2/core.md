# 表格组件 V2 设计：Core 契约

本文档聚焦 V2 Core：对外 API、核心契约、状态适配器与数据源适配器。

## 3.1 实现对齐补充（截至 2026-02-07）

以下为当前实现与本文原始设计草案的关键对齐点（以 `src/components/table/v2/core/types.ts`、`use-data-table.ts` 为准）：

- `DataTableInstance` 当前包含 `__version: "2.0"`。
- `DataTableInstance.meta.feature` 额外包含：
  - `columnOrderEnabled`
  - `virtualizationEnabled`
  - `analyticsEnabled`
- `DataTableSelection` 当前额外包含：
  - `selectionScope`（`ids` / `all+excludedRowIds`）
  - `crossPage`（跨页选择元信息）
- `DataTableActions` 当前额外包含：
  - `setColumnPin` / `resetColumnPinning`
  - `setColumnOrder` / `moveColumn` / `resetColumnOrder`
- `errors` 已结构化为 `DataTableErrors`，内部为 `DataTableError`（`severity/code/message/original/retryable`）。
- `remote(...)` 当前支持 `keepPreviousData?: boolean`（默认开启）。
- `stateUrl` 排序序列化格式已落地为 `field.asc|field.desc`（`|` 分隔多列）。

## 4. 对外 API（建议形态）

### 4.1 `useDataTable`：统一入口

```ts
export interface UseDataTableOptions<TData, TFilterSchema> {
  // 使用 `never` 作为 TValue：允许异构列（string/number/...）在同一个数组中共存，且调用方无感知
  columns: ColumnDef<TData, never>[]
  dataSource: DataSource<TData, TFilterSchema>
  state: TableStateAdapter<TFilterSchema>
  features?: DataTableFeatures<TData, TFilterSchema>
  getRowId?: (row: TData) => string
}

export function useDataTable<TData, TFilterSchema>(
  options: UseDataTableOptions<TData, TFilterSchema>,
): DataTableInstance<TData, TFilterSchema>
```

### 4.2 `DataTableInstance`：统一返回值

```ts
export type DataTableStatus =
  | { type: "error"; error: unknown }
  | { type: "empty" }
  | { type: "ready" }

export interface DataTableActivity {
  isInitialLoading: boolean
  isFetching: boolean
  preferencesReady: boolean
}

export interface DataTablePagination {
  page: number
  size: number
  pageCount: number
  total?: number
}

// selection 始终存在，未启用时 enabled=false，其余字段为默认空值
export interface DataTableSelection<TData> {
  enabled: boolean
  mode: "page" | "cross-page"
  selectedRowIds: string[]
  selectedRowsCurrentPage: TData[]
  selectionScope:
    | { type: "ids"; rowIds: string[] }
    | { type: "all"; excludedRowIds: string[] }
  crossPage?: {
    selection: {
      mode: "include" | "exclude"
      rowIds: Set<string>
    }
    totalSelected: number | "all"
    isAllSelected: boolean
  }
}

// tree 始终存在，未启用时 enabled=false
export interface DataTableTree {
  enabled: boolean
  expandedRowIds: string[]
  loadingRowIds: string[]  // 正在懒加载子节点的行
}

// dragSort 始终存在，未启用时 enabled=false
export interface DataTableDragSort {
  enabled: boolean
  isDragging: boolean
  activeId: string | null
}

export interface DataTableError {
  severity: "blocking" | "non-blocking"
  code?: string
  message?: string
  original: unknown
  retryable?: boolean
}

export interface DataTableErrors {
  blocking?: DataTableError
  nonBlocking?: DataTableError
}

export interface DataTableInstance<TData, TFilterSchema> {
  __version: "2.0"
  table: Table<TData>
  status: DataTableStatus
  activity: DataTableActivity
  pagination: DataTablePagination
  filters: TableFilters<TFilterSchema>
  actions: DataTableActions
  selection: DataTableSelection<TData>  // 始终存在，通过 enabled 判断是否可用
  tree: DataTableTree                    // 始终存在，通过 enabled 判断是否可用
  dragSort: DataTableDragSort            // 始终存在，通过 enabled 判断是否可用
  errors?: DataTableErrors
  meta: {
    feature: {
      selectionEnabled: boolean
      columnVisibilityEnabled: boolean
      columnSizingEnabled: boolean
      pinningEnabled: boolean
      columnOrderEnabled: boolean
      virtualizationEnabled: boolean
      analyticsEnabled: boolean
      expansionEnabled: boolean
      densityEnabled: boolean
      treeEnabled: boolean
      dragSortEnabled: boolean
    }
    state?: {
      searchKey?: string
    }
    data?: {
      extraMeta?: Record<string, unknown>
    }
  }
}
```

说明：

- `status` 只表达“主渲染态”。当已有可渲染数据但本轮刷新失败时，`status` 仍为 `ready`，错误写入 `errors.nonBlocking`，UI 以轻量提示/按钮重试呈现，不打断阅读。
- `activity.preferencesReady` 用于表达偏好（列显隐/列宽/density 等）是否已完成 hydration；避免“先用默认值渲染 → 异步回填跳变”。
- `selection` **始终存在**，通过 `enabled` 字段判断能力是否启用（未启用时 `enabled=false`，其余字段为默认空值）。这样设计避免业务层每次使用都需要判断可空性。`selectedRowsCurrentPage` 永远只代表当前页可见行数据，跨页批量应以 `selectedRowIds` 为主。
- `meta.state.searchKey` 由状态适配器暴露，用于 UI 默认对齐搜索字段（`DataTableSearch` 未显式传 `filterKey` 时可自动使用该值）。

### 4.3 `actions`：所有交互动作统一出口

> **设计原则**：所有方法始终存在，未启用对应 feature 时为 no-op（空函数）。这样设计让调用方无需判断方法是否存在，API 签名更稳定。

```ts
export interface DataTableActions {
  // 数据操作
  refetch: () => void | Promise<void>       // 刷新数据，非远程数据源时为 no-op
  retry: (options?: { resetInvalidFilters?: boolean }) => void | Promise<void>  // 重试失败请求，无错误时为 no-op
  resetAll: () => void                      // 重置所有状态

  // 分页与排序
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSort: (sort: { field: string; order: "asc" | "desc" }[]) => void  // 数组格式，单列时只传一个元素，空数组清除排序
  clearSort: () => void

  // 选择操作（未启用 selection 时为 no-op）
  clearSelection: () => void
  selectAllCurrentPage: () => void
  selectAllMatching: () => void | Promise<void>

  // 偏好重置（未启用对应 feature 时为 no-op）
  resetColumnVisibility: () => void
  resetColumnSizing: () => void
  setColumnPin: (columnId: string, pin: "left" | "right" | false) => void
  resetColumnPinning: () => void
  setColumnOrder: (columnOrder: string[]) => void
  moveColumn: (columnId: string, direction: "left" | "right") => void
  resetColumnOrder: () => void
  resetDensity: () => void

  // 树形操作（未启用 tree 时为 no-op）
  expandRow: (rowId: string) => void
  collapseRow: (rowId: string) => void
  toggleRowExpanded: (rowId: string) => void
  expandAll: () => void
  collapseAll: () => void
  expandToDepth: (depth: number) => void

  // 拖拽排序操作（未启用 dragSort 时为 no-op）
  moveRow: (activeId: string, overId: string) => void | Promise<void>
}
```

### 4.4 `filters`：强类型筛选模型（替代松散的 Record）

```ts
export interface TableFilters<TFilterSchema> {
  state: TFilterSchema
  set: <K extends keyof TFilterSchema>(key: K, value: TFilterSchema[K]) => void
  setBatch: (updates: Partial<TFilterSchema>) => void  // 批量更新，只触发一次状态变更
  reset: () => void
}
```

说明：

- `TFilterSchema` 由状态适配器决定（URL/受控/内部）。
- URL 模式下建议由 parser/schema 推导出值类型，避免 `any`。

---

## 5. 核心契约（必须形式化）

V2 的可控性来自“接口契约硬约束 + 组合顺序确定”。核心约定：

- State Adapter 只负责“读写状态 + 业务行为约定（例如筛选变化重置 page）”，不负责发请求与拼 queryKey。
- Data Source 只负责“把 query 变成 rows + pagination + activity”，不关心 URL 与 UI。
- Feature 以统一运行时接口注入 tableOptions/state/actions/meta，core 不能靠 if/else 堆叠能力。

### 5.1 `TableStateAdapter<TFilterSchema>`

```ts
export interface TableSort {
  field: string
  order: "asc" | "desc"
}

export interface TableStateSnapshot<TFilterSchema> {
  page: number
  size: number
  sort: TableSort[]  // 数组格式，空数组表示无排序；单列排序时只使用第一个元素
  filters: TFilterSchema
}

export type TableStateChangeReason =
  | "init"
  | "page"
  | "size"
  | "sort"
  | "filters"
  | "reset"

export interface TableStateAdapter<TFilterSchema> {
  getSnapshot: () => TableStateSnapshot<TFilterSchema>
  setSnapshot: (
    next: TableStateSnapshot<TFilterSchema>,
    reason: TableStateChangeReason,
  ) => void
  subscribe: (listener: () => void) => () => void
  searchKey?: string
}
```

约定：

- `getSnapshot` 必须同步可用（用于首屏初始化）。URL/受控/内部三种模式都要满足。
- `setSnapshot` 的行为约束（例如筛选变化自动 page=1）必须在 adapter 内完成，避免 core 与 UI 重复实现。
- `subscribe` 仅用于驱动 core 重新计算 query 与触发 dataSource；UI 不直接订阅 adapter。
- `searchKey` 为可选扩展字段：用于声明“全局搜索默认写入哪个 filter key”，`DataTableSearch` 可在未传 `filterKey` 时自动对齐。

### 5.2 `DataSource<TData, TFilterSchema>`

```ts
export interface DataTableQuery<TFilterSchema> {
  page: number
  size: number
  sort: { field: string; order: "asc" | "desc" }[]
  filters: TFilterSchema
}

export interface DataTableDataResult<TData> {
  rows: TData[]
  pageCount: number
  total?: number
  extraMeta?: Record<string, unknown>
}

export interface DataTableDataState<TData> {
  data: DataTableDataResult<TData> | null
  isInitialLoading: boolean
  isFetching: boolean
  error: unknown | null
  refetch?: () => void | Promise<void>
  retry?: () => void | Promise<void>
}

export interface DataSource<TData, TFilterSchema> {
  use: (query: DataTableQuery<TFilterSchema>) => DataTableDataState<TData>
}
```

约定：

- `query.filters` 必须保持强类型贯通，dataSource 不得退化为 `Record<string, unknown>`。
- dataSource 可以自行决定缓存与请求策略（例如 TanStack Query），但不拥有 URL 读写权。

### 5.3 `DataTableFeature<TData, TFilterSchema>`（运行时接口）

```ts
export interface DataTableFeatureRuntime<TData, TFilterSchema> {
  patchTableOptions?: (args: {
    getRowId?: (row: TData) => string
  }) => Partial<TableOptions<TData>>
  patchActions?: (actions: DataTableActions) => Partial<DataTableActions>
  patchMeta?: (meta: DataTableInstance<TData, TFilterSchema>["meta"]) => unknown
  patchActivity?: (activity: DataTableActivity) => Partial<DataTableActivity>
  onReset?: () => void
}
```

约定：

- core 以确定顺序应用 features：`state -> features -> table -> dataSource -> dt`。
- feature 不得直接依赖 URL/Query，只能通过 runtime patch 与 storage/hydration 接口间接影响行为。

---

## 6. 状态适配器（State Adapters）

状态适配器负责提供：

- 初始状态（page/size/sort/filters）
- 状态变更写入（URL / props 回调 / 内部 state）
- 业务约定（例如 filter 或搜索改变时自动把 page 重置为 1）

### 6.1 `state.url(...)`

```ts
export interface TableCodec<TOutput> {
  parse: (input: Record<string, string | string[] | undefined>) => TOutput
  serialize: (value: TOutput) => Record<string, string | null | undefined>
}

export type UrlStateMiddleware<TFilterSchema> = (args: {
  prev: { page: number; size: number; sort: { field: string; order: "asc" | "desc" }[]; filters: TFilterSchema }
  next: { page: number; size: number; sort: { field: string; order: "asc" | "desc" }[]; filters: TFilterSchema }
}) => {
  page: number
  size: number
  sort: { field: string; order: "asc" | "desc" }[]
  filters: TFilterSchema
}

export interface UrlStateOptions<TParsers> {
  key: string
  parsers?: TParsers
  codec?: TableCodec<InferParserValues<TParsers>>
  defaults?: Partial<InferParserValues<TParsers>>
  behavior?: {
    history?: "push" | "replace"
    resetPageOnFilterChange?: boolean
    resetPageOnSearchChange?: boolean
    searchKey?: string
    middleware?: UrlStateMiddleware<InferParserValues<TParsers>>
  }
}

export function stateUrl<TParsers>(
  options: UrlStateOptions<TParsers>,
): TableStateAdapter<InferParserValues<TParsers>>
```

约定：

- `page/size/sort` 等保留字段由 V2 统一管理，不再允许组件各自写入；搜索字段默认 `q`，可通过 `behavior.searchKey` 自定义。
- `sort` 字符串序列化规范统一为 `field.asc|field.desc`（或 `field.asc` 这种），由 adapter 解析与生成。
- URL 入参天然是字符串，`parsers/codec` 是唯一的类型转换入口；业务不得在 UI 层自行做 string → number/date 的隐式转换。
- 默认实现路径以 TanStack Router 的 search 语义为准：adapter 通过 Router 的 search 读写完成状态同步；`key` 用作命名空间前缀，避免与页面其他 search 参数冲突。
- `state.url` 会把解析后的 `searchKey` 透传到 `TableStateAdapter.searchKey`，随后由 `useDataTable` 暴露到 `dt.meta.state.searchKey`，供 `DataTableSearch` 默认对齐。
- **V2.0 约束**：`TFilterSchema` 必须为扁平对象（仅一层 key/value），不支持嵌套结构，避免 codec 与 URL 映射复杂度爆炸。
- **数组格式规范**：URL 多值参数统一使用重复 key（例如 `?status=a&status=b`），禁止逗号拼接（`?status=a,b`）以避免歧义。

强类型建议：

- 优先使用 TanStack Router 的搜索校验/解析能力（例如 schema/validator），`codec` 作为可选的严格校验入口（例如 `zod`），将校验失败映射为默认值或剔除非法字段。

### 6.2 `state.controlled(...)`

```ts
export interface ControlledStateOptions<TFilterSchema> {
  value: {
    page: number
    size: number
    sort: { field: string; order: "asc" | "desc" }[]
    filters: TFilterSchema
  }
  onChange: (next: ControlledStateOptions<TFilterSchema>["value"]) => void
  behavior?: {
    resetPageOnFilterChange?: boolean
  }
}

export function stateControlled<TFilterSchema>(
  options: ControlledStateOptions<TFilterSchema>,
): TableStateAdapter<TFilterSchema>
```

### 6.3 `state.internal(...)`

```ts
export interface InternalStateOptions<TFilterSchema> {
  initial: {
    page?: number
    size?: number
    sort?: { field: string; order: "asc" | "desc" }[]
    filters?: TFilterSchema
  }
  behavior?: {
    resetPageOnFilterChange?: boolean
  }
}

export function stateInternal<TFilterSchema>(
  options: InternalStateOptions<TFilterSchema>,
): TableStateAdapter<TFilterSchema>
```

---

## 7. 数据源适配器（Data Sources）

数据源只负责“给 rows + 分页信息”，不关心 UI、URL、feature。

### 7.1 `dataSource.remote(...)`（TanStack Query）

```ts
export interface RemoteDataSourceOptions<TData, TFilterSchema, TResponse> {
  queryKey: unknown[]
  queryFn: (params: {
    page: number
    size: number
    sort: { field: string; order: "asc" | "desc" }[]
    filters: TFilterSchema
  }) => Promise<TResponse>
  map: (response: TResponse) => {
    rows: TData[]
    pageCount: number
    total?: number
    extraMeta?: Record<string, unknown>
  }
  keepPreviousData?: boolean
}

export function remote<TData, TFilterSchema, TResponse>(
  options: RemoteDataSourceOptions<TData, TFilterSchema, TResponse>,
): DataSource<TData, TFilterSchema>
```

约定：

- `queryKey` 由 core 统一追加 state 依赖（filters/sort/page/size），业务无需手动拼接。
- `map` 是唯一的“非标准响应格式”入口。
- `extraMeta` 用于保留后端返回的业务汇总信息，core 应将其透传到 `dt.meta.data.extraMeta`。
- 必须明确区分“进入 queryKey 的状态”和“只进入 queryFn 的参数”，避免缓存污染与不必要 refetch。
- `filters/sort` 用于 queryKey 时必须稳定化（例如结构化序列化、稳定 key 排序或结构共享）；稳定化策略由 core 统一完成，避免业务各自实现导致缓存碎片化。

### 7.2 `dataSource.local(...)`

```ts
export interface LocalDataSourceOptions<TData> {
  rows: TData[]
  total?: number
}

export function local<TData, TFilterSchema>(
  options: LocalDataSourceOptions<TData>,
): DataSource<TData, TFilterSchema>
```

---
