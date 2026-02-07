# 表格组件 V2 渐进式使用说明（实现对齐版）

适用范围：`/src/components/table/v2` 当前实现（`DataTableInstance.__version = "2.0"`）。

参考示例：
- `src/features/example/table/stages/stage-1-basic.tsx`
- `src/features/example/table/stages/stage-2-filters.tsx`
- `src/features/example/table/stages/stage-3-features.tsx`
- `src/features/example/table/stages/stage-4-tree-drag.tsx`
- `src/features/example/table/stages/stage-4-remote-drag.tsx`
- `src/features/example/table/stages/stage-5-preset.tsx`
- `src/features/example/users/components/user-management-page.tsx`

---

## 1. 快速开始（先建立心智模型）

V2 的核心是一个统一实例 `dt`，通过 `useDataTable()` 产出：

- Core：
  - 状态：`status`、`activity`、`pagination`、`filters`、`errors`
  - 行为：`actions`
  - TanStack 实例：`table`
  - Feature 快照：`selection`、`tree`、`dragSort`
- UI：
  - 全部 UI 组件只消费 `dt`，不再直接碰 URL / Query / Table 内部状态
- 组合方式：
  - 快速接入：`DataTablePreset`
  - 深度定制：`DataTableRoot + Toolbar + Table + SelectionBar + Pagination`

---

## 2. 快速开始（最小可运行版本）

```tsx
import { createColumnHelper, DataTablePreset, local, stateInternal, useDataTable } from "@/components/table/v2"

interface UserRow {
  id: string
  name: string
  role: string
}

interface UserFilters {
  q: string
}

const helper = createColumnHelper<UserRow>()

const columns = [
  helper.accessor("name", { header: "姓名", cell: (ctx) => ctx.row.original.name }),
  helper.accessor("role", { header: "角色", cell: (ctx) => ctx.row.original.role }),
]

export function UserTableDemo({ rows }: { rows: UserRow[] }) {
  const state = stateInternal<UserFilters>({
    initial: {
      page: 1,
      size: 10,
      sort: [],
      filters: { q: "" },
    },
  })

  const dataSource = local<UserRow, UserFilters>({ rows })

  const dt = useDataTable<UserRow, UserFilters>({
    columns,
    dataSource,
    state,
    getRowId: (row) => row.id,
  })

  return <DataTablePreset dt={dt} />
}
```

你已经得到：
- 分页、排序、空态/错误态、默认搜索框、默认分页条
- `dt.actions.resetAll()`、`dt.actions.refetch()` 等统一动作接口（无能力时为 no-op）

---

## 3. 基础用法（远程数据源 + URL 状态）

### 3.1 远程数据源 `remote`

```tsx
const dataSource = remote<UserRow, UserFilters, UserResponse>({
  queryKey: ["users"],
  queryFn: fetchUsers,
  map: (res) => ({
    rows: res.items,
    pageCount: res.pageCount,
    total: res.total,
    extraMeta: res.meta,
  }),
  keepPreviousData: true, // 默认 true
})
```

### 3.2 URL 状态适配器 `stateUrl`

```tsx
const state = stateUrl({
  key: "users_table", // URL 命名空间前缀
  parsers: {
    q: parseAsString.withDefault(""),
    status: parseAsString.withDefault("all"),
  },
  behavior: {
    history: "replace",
    searchKey: "q", // 会透传到 dt.meta.state.searchKey
    resetPageOnFilterChange: true,
    resetPageOnSearchChange: true,
  },
})
```

补充：
- URL 排序序列化格式：`field.asc|field.desc`
- 也可用 `codec` 完全接管 parse/serialize

---

## 4. 基础用法（搜索与筛选）

### 4.1 简单搜索

```tsx
<DataTableSearch<UserFilters> filterKey="q" debounceMs={300} />
```

`filterKey` 解析优先级：
`props.filterKey > dt.meta.state.searchKey > "q"`

### 4.2 高级搜索

```tsx
<DataTableSearch<UserFilters>
  mode="advanced"
  advancedFields={filterDefinitions}
/>
```

`advanced` 目前支持 7 种字段类型：
- `text`
- `select`
- `multi-select`
- `boolean`
- `number-range`
- `date`
- `date-range`

### 4.3 筛选条与激活标签

```tsx
<DataTableFilterBar filters={filterDefinitions} />
<DataTableActiveFilters filters={filterDefinitions} />
```

筛选值清空语义：
- `text` 清空为 `""`
- 其他类型清空为 `null`

---

## 5. 高级用法（Feature 全量能力）

```tsx
features: {
  selection: { ... },
  columnVisibility: { ... },
  columnSizing: { ... },
  pinning: { ... },
  columnOrder: { ... },
  expansion: { ... },
  density: { ... },
  tree: { ... },
  dragSort: { ... },
  virtualization: { ... },
  analytics: { ... },
}
```

### 5.1 `selection`

```tsx
selection: {
  enabled: true,
  mode: "cross-page",
  crossPage: {
    selectAllStrategy: "server", // "client" | "server"
    fetchAllIds: async (filters) => apiFetchIds(filters),
    maxSelection: 5000,
  },
}
```

要点：
- `cross-page` 必须提供 `getRowId`
- `DataTableSelectionBar` 会自动处理“选择本页 / 选择全部匹配 / 回退本页”
- 可拿到 `selectionScope` 与 `exportPayload` 直接做服务端导出

### 5.2 `columnVisibility`

```tsx
columnVisibility: {
  enabled: true,
  storageKey: "users_v2_visibility",
  defaultVisible: { email: false },
  schemaVersion: 2,
  migrate: ({ value }) => value,
}
```

### 5.3 `columnSizing`

```tsx
columnSizing: {
  enabled: true,
  storageKey: "users_v2_sizing",
  defaultSizing: { name: 240 },
  schemaVersion: 2,
  migrate: ({ value }) => value,
}
```

### 5.4 `pinning`

```tsx
pinning: {
  enabled: true,
  left: ["__select__", "name"],
  right: ["__actions__"],
  storageKey: "users_v2_pinning",
  schemaVersion: 1,
}
```

### 5.5 `columnOrder`

```tsx
columnOrder: {
  enabled: true,
  storageKey: "users_v2_column_order",
  defaultOrder: ["name", "role", "status"],
  schemaVersion: 1,
}
```

### 5.6 `expansion`

```tsx
expansion: {
  enabled: true,
  getRowCanExpand: (row) => row.original.childrenCount > 0,
}
```

配合：
`<DataTableTable renderSubComponent={(row) => <RowDetail row={row} />} />`

### 5.7 `density`

```tsx
density: {
  enabled: true,
  storageKey: "users_v2_density",
  default: "comfortable", // "compact" | "comfortable"
}
```

### 5.8 `tree`

```tsx
tree: {
  enabled: true,
  getSubRows: (row) => row.children,
  loadChildren: async (row) => apiLoadChildren(row.id),
  getRowCanExpand: (row) => row.hasChildren,
  defaultExpandedDepth: 1,
  defaultExpandedRowIds: ["root-1"],
  selectionBehavior: "cascade", // "independent" | "cascade"
  allowNesting: true,
  indentSize: 24,
}
```

要点：
- 使用 `loadChildren` 时必须提供 `getRowId`
- 渲染树节点时建议在列里用 `DataTableTreeCell`

### 5.9 `dragSort`

```tsx
dragSort: {
  enabled: true,
  onReorder: async ({
    activeId,
    overId,
    dropPosition,   // "above" | "below" | "inside"
    targetParentId,
    targetIndex,
    reorderedRows,
  }) => {
    // 本地可直接使用 reorderedRows
    // 树形可基于 targetParentId + targetIndex 落库
  },
  onError: ({ error }) => console.error(error),
  handle: true,
  canDrag: (row) => !row.locked,
  canDrop: (active, over) => active.type === over.type,
  dragOverlay: "row", // "row" | "ghost" | "minimal"
  allowNesting: true,
}
```

要点：
- `dragSort` 启用时必须提供 `getRowId`
- `allowNesting` 仅在 tree 场景有意义

### 5.10 `virtualization`

```tsx
virtualization: {
  enabled: true,
  mode: "infinite", // "windowed" | "infinite"
  rowHeight: 44,
  overscan: 8,
  loadMore: async () => fetchNextPage(),
  loadMoreOffset: 240,
}
```

当前实现的生效条件（都满足才会虚拟化）：
- `layout.scrollContainer === "root"`
- 未启用 dragSort
- `DataTableTable` 未传 `renderSubComponent`
- 未启用 tree
- analytics 未启用 `groupBy`

### 5.11 `analytics`

```tsx
analytics: {
  enabled: true,
  groupBy: (row) => row.department,
  groupLabel: ({ group, count }) => `${group} (${count})`,
  summary: {
    label: "汇总",
    labelColumnId: "name",
    values: {
      amount: (rows) => rows.reduce((sum, row) => sum + row.amount, 0),
    },
  },
}
```

效果：
- body 内分组头
- table footer 汇总行

---

## 6. 高级用法（列工具与列定义扩展）

### 6.1 `createColumnHelper`

```tsx
const helper = createColumnHelper<UserRow>()

const columns = [
  helper.select(),
  helper.expand(),
  helper.dragHandle(),
  helper.accessor("name", {
    header: "姓名",
    meta: {
      headerLabel: "姓名",
      hideable: true,
      pinned: "left",
      align: "left",
    },
  }),
  helper.actions((row) => <RowActions row={row.original} />, {
    header: "操作",
    align: "center",
    size: 96,
  }),
]
```

### 6.2 内置列工厂

- `select()`：选择列（40px，禁排序/禁隐藏/禁调宽）
- `expand()`：展开列（40px，禁排序/禁隐藏/禁调宽）
- `dragHandle()`：拖拽手柄列（40px）
- `actions(render, options)`：操作列，默认右对齐 + 右侧固定

---

## 7. 高级用法（UI 组件组合策略）

### 7.1 快速模式

```tsx
<DataTablePreset dt={dt} />
```

### 7.2 组合模式

```tsx
<DataTableRoot dt={dt} layout={{ stickyHeader: true, stickyPagination: true }}>
  <DataTableToolbar actions={<DataTableViewOptions />}>
    <DataTableSearch />
  </DataTableToolbar>
  <DataTableFilterBar filters={filterDefinitions} />
  <DataTableTable renderSubComponent={renderDetail} />
  <DataTableSelectionBar actions={({ exportPayload }) => <ExportButton payload={exportPayload} />} />
  <DataTablePagination />
</DataTableRoot>
```

低频配置入口：
- `DataTableViewOptions`：密度、列显隐、重置全部
- `DataTableColumnToggle`：更细颗粒列设置（含 pinning / columnOrder 操作）
- `DataTableDensityToggle`：单独密度切换

---

## 8. 高级用法（批量导出）

`DataTableSelectionBar` 的 `actions` 回调会给你：
- `selectedRowIds`
- `selectedRowsCurrentPage`
- `selectionScope`
- `exportPayload`

`exportPayload` 已是可直接发给后端的结构：

- `type: "ids"`：明确 ID 列表
- `type: "all"`：全选匹配 + `excludedRowIds` + `filters`

---

## 9. 高级用法（i18n 覆盖）

```tsx
<DataTableConfigProvider
  i18n={{
    emptyText: "No data",
    searchPlaceholder: "Search...",
    pagination: {
      total: (count) => `${count} total`,
      perPage: "/ page",
      previous: "Prev",
      next: "Next",
    },
  }}
>
  <DataTablePreset dt={dt} />
</DataTableConfigProvider>
```

可在全局和组件局部两层覆盖（多数组件都支持 `i18n` 局部参数）。

---

## 10. 最佳实践（状态适配器选择）

- `stateInternal`
  - 页面内简单列表、一次性状态
- `stateControlled`
  - 状态由父组件/外部状态管理统一托管
- `stateUrl`
  - 需要可分享链接、刷新可恢复状态

---

## 11. 最佳实践（常见坑与实现约束）

- `cross-page selection`、`tree.loadChildren`、`dragSort` 都依赖稳定 `getRowId`
- 本地数据源 `local` 的筛选是“精确匹配”，不是模糊查询
- `resetAll()` 会触发 feature 的 `onReset`（偏好、选择、展开、拖拽状态都会重置）
- 偏好持久化默认使用 localStorage envelope（`schemaVersion` + `updatedAt` + `value`）
- `DataTableSearch(mode="advanced")` 仅对 7 种字段类型生效，`custom` 仍建议走 `DataTableFilterItem`

---

## 12. 功能覆盖清单（当前实现）

Core：
- `useDataTable`
- `stateInternal / stateControlled / stateUrl`
- `local / remote`
- `buildSelectionExportPayload`

Features：
- `selection`
- `columnVisibility`
- `columnSizing`
- `pinning`
- `columnOrder`
- `expansion`
- `density`
- `tree`
- `dragSort`
- `virtualization`
- `analytics`

UI：
- `DataTableRoot / DataTablePreset`
- `DataTableToolbar / DataTableSearch / DataTableFilterBar / DataTableFilterItem / DataTableActiveFilters`
- `DataTableTable / DataTablePagination / DataTableSelectionBar`
- `DataTableViewOptions / DataTableColumnToggle / DataTableDensityToggle`
- `DataTableTreeCell / DataTableDragHandle / DataTableDropIndicator`
- `DataTableConfigProvider`

Columns：
- `createColumnHelper`
- `select / expand / dragHandle / actions`
