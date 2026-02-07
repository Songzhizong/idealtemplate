# 表格组件 V2 API 文档（实现对齐）

适用版本：`@/components/table/v2`（`DataTableInstance.__version = "2.0"`）。

---

## 1. `useDataTable` API

### 1.1 类型签名

```ts
export interface UseDataTableOptions<TData, TFilterSchema> {
  columns: DataTableColumnDef<TData>[]
  dataSource: DataSource<TData, TFilterSchema>
  state: TableStateAdapter<TFilterSchema>
  features?: DataTableFeatures<TData, TFilterSchema>
  getRowId?: (row: TData) => string
}

export function useDataTable<TData, TFilterSchema>(
  options: UseDataTableOptions<TData, TFilterSchema>,
): DataTableInstance<TData, TFilterSchema>
```

### 1.2 `DataTableInstance`

```ts
export interface DataTableInstance<TData, TFilterSchema> {
  __version: "2.0"
  table: Table<TData>
  status: { type: "error"; error: unknown } | { type: "empty" } | { type: "ready" }
  activity: {
    isInitialLoading: boolean
    isFetching: boolean
    preferencesReady: boolean
  }
  pagination: {
    page: number
    size: number
    pageCount: number
    total?: number
  }
  filters: TableFilters<TFilterSchema>
  actions: DataTableActions
  selection: DataTableSelection<TData>
  tree: DataTableTree
  dragSort: DataTableDragSort
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
    state?: { searchKey?: string }
    data?: { extraMeta?: Record<string, unknown> }
  }
}
```

### 1.3 `actions`

```ts
export interface DataTableActions {
  refetch: () => void | Promise<void>
  retry: (options?: { resetInvalidFilters?: boolean }) => void | Promise<void>
  resetAll: () => void

  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSort: (sort: { field: string; order: "asc" | "desc" }[]) => void
  clearSort: () => void

  clearSelection: () => void
  selectAllCurrentPage: () => void
  selectAllMatching: () => void | Promise<void>

  resetColumnVisibility: () => void
  resetColumnSizing: () => void
  setColumnPin: (columnId: string, pin: "left" | "right" | false) => void
  resetColumnPinning: () => void
  setColumnOrder: (columnOrder: string[]) => void
  moveColumn: (columnId: string, direction: "left" | "right") => void
  resetColumnOrder: () => void
  resetDensity: () => void

  expandRow: (rowId: string) => void
  collapseRow: (rowId: string) => void
  toggleRowExpanded: (rowId: string) => void
  expandAll: () => void
  collapseAll: () => void
  expandToDepth: (depth: number) => void

  moveRow: (activeId: string, overId: string) => void | Promise<void>
}
```

说明：
- 所有 actions 都始终存在；能力未启用时为 no-op。

---

## 2. 状态适配器 API

### 2.1 `stateInternal`

```ts
export function stateInternal<TFilterSchema>(options: {
  initial: {
    page?: number
    size?: number
    sort?: { field: string; order: "asc" | "desc" }[]
    filters?: TFilterSchema
  }
  behavior?: { resetPageOnFilterChange?: boolean }
}): TableStateAdapter<TFilterSchema>
```

### 2.2 `stateControlled`

```ts
export function stateControlled<TFilterSchema>(options: {
  value: {
    page: number
    size: number
    sort: { field: string; order: "asc" | "desc" }[]
    filters: TFilterSchema
  }
  onChange: (next: {
    page: number
    size: number
    sort: { field: string; order: "asc" | "desc" }[]
    filters: TFilterSchema
  }) => void
  behavior?: { resetPageOnFilterChange?: boolean }
}): TableStateAdapter<TFilterSchema>
```

### 2.3 `stateUrl`

```ts
export function stateUrl<TParsers extends ParserMap | undefined>(options: {
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
}): TableStateAdapter<InferParserValues<TParsers>>
```

说明：
- URL 中分页与排序字段由适配器托管。
- 排序序列化格式：`field.asc|field.desc`。
- `behavior.searchKey` 会透传到 `dt.meta.state.searchKey`。

---

## 3. 数据源适配器 API

### 3.1 `remote`

```ts
export function remote<TData, TFilterSchema, TResponse>(options: {
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
}): DataSource<TData, TFilterSchema>
```

### 3.2 `local`

```ts
export function local<TData, TFilterSchema>(options: {
  rows: TData[]
  total?: number
}): DataSource<TData, TFilterSchema>
```

---

## 4. Feature 配置 API

```ts
export interface DataTableFeatures<TData, TFilterSchema> {
  selection?: SelectionFeatureOptions<TFilterSchema>
  columnVisibility?: ColumnVisibilityFeatureOptions
  columnSizing?: ColumnSizingFeatureOptions
  pinning?: PinningFeatureOptions
  columnOrder?: ColumnOrderFeatureOptions
  virtualization?: VirtualizationFeatureOptions
  analytics?: AnalyticsFeatureOptions<TData>
  expansion?: ExpansionFeatureOptions<TData>
  density?: DensityFeatureOptions
  tree?: TreeFeatureOptions<TData>
  dragSort?: DragSortFeatureOptions<TData>
}
```

### 4.1 `selection`

```ts
selection?: {
  enabled?: boolean
  mode?: "page" | "cross-page"
  crossPage?: {
    selectAllStrategy?: "client" | "server"
    fetchAllIds?: (filters: TFilterSchema) => Promise<string[]>
    maxSelection?: number
  }
}
```

### 4.2 偏好类 feature

```ts
columnVisibility?: {
  enabled?: boolean
  storageKey: string
  defaultVisible?: Record<string, boolean>
  schemaVersion?: number
  migrate?: PreferenceMigration<Record<string, boolean>>
  storage?: TablePreferenceStorage<PreferenceEnvelope<Record<string, boolean>>>
}

columnSizing?: {
  enabled?: boolean
  storageKey: string
  defaultSizing?: Record<string, number>
  schemaVersion?: number
  migrate?: PreferenceMigration<Record<string, number>>
  storage?: TablePreferenceStorage<PreferenceEnvelope<Record<string, number>>>
}

pinning?: {
  enabled?: boolean
  left?: string[]
  right?: string[]
  storageKey?: string
  schemaVersion?: number
  migrate?: PreferenceMigration<{ left: string[]; right: string[] }>
  storage?: TablePreferenceStorage<PreferenceEnvelope<{ left: string[]; right: string[] }>>
}

columnOrder?: {
  enabled?: boolean
  storageKey: string
  defaultOrder?: string[]
  schemaVersion?: number
  migrate?: PreferenceMigration<string[]>
  storage?: TablePreferenceStorage<PreferenceEnvelope<string[]>>
}

density?: {
  enabled?: boolean
  storageKey: string
  default?: "compact" | "comfortable"
  schemaVersion?: number
  migrate?: PreferenceMigration<"compact" | "comfortable">
  storage?: TablePreferenceStorage<PreferenceEnvelope<"compact" | "comfortable">>
}
```

### 4.3 `expansion`

```ts
expansion?: {
  enabled?: boolean
  getRowCanExpand?: (row: Row<TData>) => boolean
}
```

### 4.4 `tree`

```ts
tree?: {
  enabled?: boolean
  getSubRows?: (row: TData) => TData[] | undefined
  loadChildren?: (row: TData) => Promise<TData[]>
  getRowCanExpand?: (row: TData) => boolean
  defaultExpandedDepth?: number
  defaultExpandedRowIds?: string[]
  selectionBehavior?: "independent" | "cascade"
  allowNesting?: boolean
  indentSize?: number
}
```

### 4.5 `dragSort`

```ts
dragSort?: {
  enabled?: boolean
  onReorder: (args: {
    activeId: string
    overId: string
    activeIndex: number
    overIndex: number
    activeRow: TData
    overRow: TData
    reorderedRows?: TData[]
    dropPosition?: "above" | "below" | "inside"
    activeParentId?: string | null
    overParentId?: string | null
    targetParentId?: string | null
    targetIndex?: number
  }) => void | Promise<void>
  onError?: (args: {
    error: unknown
    activeId: string
    overId: string
    dropPosition: "above" | "below" | "inside"
  }) => void
  handle?: boolean
  canDrag?: (row: TData) => boolean
  canDrop?: (activeRow: TData, overRow: TData) => boolean
  dragOverlay?: "row" | "ghost" | "minimal"
  allowNesting?: boolean
}
```

### 4.6 `virtualization`

```ts
virtualization?: {
  enabled?: boolean
  mode?: "windowed" | "infinite"
  rowHeight?: number
  overscan?: number
  loadMore?: () => void | Promise<void>
  loadMoreOffset?: number
}
```

### 4.7 `analytics`

```ts
analytics?: {
  enabled?: boolean
  groupBy?: (row: TData) => string
  groupLabel?: (args: { group: string; count: number }) => string
  summary?: {
    label?: string
    labelColumnId?: string
    values: Record<string, (rows: TData[]) => ReactNode>
  }
}
```

---

## 5. UI 组件 API

### 5.1 容器与预设

```tsx
export function DataTableRoot<TData, TFilterSchema>(props: {
  dt: DataTableInstance<TData, TFilterSchema>
  height?: string
  className?: string
  layout?: {
    scrollContainer?: "root" | "window"
    stickyHeader?: boolean | { topOffset?: number }
    stickyPagination?: boolean | { bottomOffset?: number }
  }
  children: ReactNode
}): JSX.Element

export function DataTablePreset<TData, TFilterSchema>(props: {
  dt: DataTableInstance<TData, TFilterSchema>
  height?: string
  className?: string
  layout?: DataTableLayoutOptions
  toolbar?: ReactNode
  toolbarActions?: ReactNode
  renderEmpty?: () => ReactNode
  renderError?: (error: unknown, retry?: () => void | Promise<void>) => ReactNode
  selectionBarActions?: DataTableSelectionBarProps<TData>["actions"]
}): JSX.Element
```

### 5.2 工具栏与搜索筛选

```tsx
export function DataTableToolbar(props: {
  className?: string
  children?: ReactNode
  actions?: ReactNode
}): JSX.Element

export function DataTableSearch<TFilterSchema>(props: {
  filterKey?: keyof TFilterSchema
  debounceMs?: number
  placeholder?: string
  className?: string
  inputClassName?: string
  i18n?: DataTableI18nOverrides
  mode?: "simple" | "advanced"
  advancedFields?: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
}): JSX.Element

export function DataTableFilterBar<TFilterSchema>(props: DataTableFilterBarProps<TFilterSchema>): JSX.Element
export function DataTableFilterItem<TFilterSchema, K extends keyof TFilterSchema>(props: DataTableFilterItemProps<TFilterSchema, K>): JSX.Element
export function DataTableActiveFilters<TFilterSchema>(props: DataTableActiveFiltersProps<TFilterSchema>): JSX.Element
```

### 5.3 表格主体与分页选择

```tsx
export function DataTableTable<TData>(props?: {
  className?: string
  renderEmpty?: () => ReactNode
  renderError?: (error: unknown, retry?: () => void | Promise<void>) => ReactNode
  renderSubComponent?: (row: Row<TData>) => ReactNode
  i18n?: DataTableI18nOverrides
}): JSX.Element

export function DataTablePagination(props?: DataTablePaginationProps): JSX.Element

export function DataTableSelectionBar<TData, TFilterSchema = unknown>(props: {
  className?: string
  actions?: (args: {
    selectedRowIds: string[]
    selectedRowsCurrentPage: TData[]
    mode: "page" | "cross-page"
    selection: DataTableSelection<TData>
    selectionScope: DataTableSelection<TData>["selectionScope"]
    exportPayload: DataTableSelectionExportPayload<TFilterSchema>
  }) => ReactNode
  i18n?: DataTableI18nOverrides
}): JSX.Element
```

### 5.4 视图配置与树/拖拽组件

```tsx
export function DataTableViewOptions(props?: DataTableViewOptionsProps): JSX.Element
export function DataTableColumnToggle(props?: DataTableColumnToggleProps): JSX.Element
export function DataTableDensityToggle(props?: DataTableDensityToggleProps): JSX.Element
export function DataTableTreeCell<TData>(props: DataTableTreeCellProps<TData>): JSX.Element
export function DataTableDragHandle(props?: DataTableDragHandleProps): JSX.Element
export function DataTableDropIndicator(props: DataTableDropIndicatorProps): JSX.Element
```

### 5.5 配置与 i18n

```tsx
export function DataTableConfigProvider(props: {
  children: ReactNode
  i18n?: DataTableI18nOverrides
}): JSX.Element
```

---

## 6. 列工厂 API（常用）

```ts
export function createColumnHelper<TData>(): {
  accessor: ...
  display: ...
  select: () => ColumnDef<TData>
  expand: () => ColumnDef<TData>
  dragHandle: () => ColumnDef<TData>
  actions: (
    render: (row: Row<TData>) => ReactNode,
    options?: DataTableActionsColumnOptions<TData>,
  ) => ColumnDef<TData>
}
```

