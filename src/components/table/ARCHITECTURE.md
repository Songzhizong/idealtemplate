# 表格架构文档

## 设计理念

表格系统基于 **TanStack Table 作为唯一数据源**构建，消除了双重状态管理，确保 UI 一致性。

## 核心原则

### 0. 防御性编程 (Defensive Programming)

在处理异步数据时，始终确保数据类型安全：

```typescript
// ✅ 好的做法：防止 undefined 导致崩溃
const table = useReactTable({
  data: pageData.data ?? [], // 永远保证是数组
  columns,
  // ...
});

// ❌ 不好的做法：可能导致 table 内部崩溃
const table = useReactTable({
  data: pageData.data, // 如果 API 未返回，可能是 undefined
  columns,
});
```

### 1. 单一数据源

所有表格状态（列可见性、排序、选择、分页）都存储在 TanStack Table 实例中。不存在并行的状态管理。

```typescript
// ✅ 好的做法：单一数据源
const { table } = useTableContext();
const isVisible = column.getIsVisible();
column.toggleVisibility();

// ❌ 不好的做法：双重状态管理
const [columnChecks, setColumnChecks] = useState([]);
const [columnVisibility, setColumnVisibility] = useState({});
// 现在你需要同步这两个状态！
```

### 2. 状态提升

表格实例在 Hook 层创建，并通过 Context 向下传递，确保所有组件都能访问同一个实例。

```
useTablePagination (创建表格实例)
    ↓
PaginatedTable (接收表格实例)
    ↓
TableProvider (通过 Context 提供表格实例)
    ↓
DataTableToolbar / DataTable / 等 (通过 useTableContext 消费)
```

### 3. 最小化 Props

组件只接收它们需要的内容。表格实例提供其他所有内容。

```typescript
// 之前：15+ 个 props
<PaginatedTable
  columns={columns}
  data={data}
  columnChecks={columnChecks}
  setColumnChecks={setColumnChecks}
  columnVisibility={columnVisibility}
  onColumnVisibilityChange={onColumnVisibilityChange}
  rowSelection={rowSelection}
  onRowSelectionChange={onRowSelectionChange}
  sorting={sorting}
  onSortingChange={onSortingChange}
  // ... 还有 6 个 props
/>

// 之后：5 个核心 props
<PaginatedTable
  table={table}
  loading={loading}
  empty={empty}
  pagination={pagination}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

### 4. 布局与滚动策略（完整设计）

#### 目标体验

- **单一滚动**：默认使用页面滚动，避免“双滚动条”。
- **上下文常驻**：表头吸顶，分页器吸底。
- **可控内滚动**：仅在固定高度容器中启用内部滚动。

#### 默认布局（页面滚动 + Sticky）

- `DataTableContainer`：
  - 吸底分页器（`pagination`）
- `DataTable`：
  - 吸顶表头（`thead` 模拟）
  - **表头吸顶 top = 0**

**关键机制**：`DataTable` 表头直接吸顶（`top: 0`），更加稳定可靠。筛选区随页面滚动。

#### 固定高度容器（内部滚动）

只有在容器高度固定时使用：

```tsx
<DataTable maxHeight="calc(100vh - 320px)" ... />
```

此时：

- 表格内容区域内部滚动
- 表头仍可吸顶（相对于表格内部滚动容器）
- 分页器继续吸底

#### 结构与层级（必须遵守）

```
DataTableContainer
  ├─ Toolbar (normal flow)
  ├─ DataTable (Header sticky top=0)
  └─ Pagination (sticky bottom=0)
```

#### 约束与踩坑

- **避免外层 overflow**：祖先元素设置 `overflow: hidden/auto/scroll` 会破坏 sticky。
- **避免 gap**：筛选区与表格之间不要用 `gap`，否则 sticky 偏移会被额外间距干扰。
- **圆角保持**：圆角必须由 `DataTableContainer` 统一裁切（`overflow-hidden`）。
- **背景一致**：吸顶区域使用 `bg-card` 与表格卡片一致，避免突兀。

## 架构层次

### 第零层：高阶 Hook (`useDataTable`) - 推荐使用

**职责**：URL 状态管理、自动化最佳实践、消除胶水代码

这是对 `useTablePagination` 的高阶封装，专为业务开发优化。它自动处理：

- URL 状态同步（基于 `nuqs`）
- 筛选变化时自动重置页码
- 内置防抖搜索
- 类型安全的筛选器状态

```typescript
export function useDataTable<TData>(options) {
  // 1. 统一管理 URL 状态（分页 + 搜索 + 业务筛选）
  const [urlState, setUrlState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    size: parseAsInteger.withDefault(10),
    sort: parseAsString,
    q: parseAsString,
    ...filterParsers, // 业务筛选字段
  });

  // 2. 筛选操作（自动重置页码）
  const setFilter = useCallback(
    (key, value) => {
      setUrlState((old) => ({
        ...old,
        [key]: value,
        page: 1, // 🔥 核心：任何筛选变动，自动重置页码
      }));
    },
    [setUrlState],
  );

  // 3. 防抖搜索
  const onSearch = useDebouncedCallback((value: string) => {
    setFilter("q", value || null);
  }, 500);

  // 4. 重置所有筛选
  const resetFilters = useCallback(() => {
    setUrlState({
      page: 1,
      size: urlState.size,
      sort: null,
      q: null,
      ...Object.keys(filterParsers).reduce(
        (acc, key) => ({
          ...acc,
          [key]: defaultFilters[key] ?? null,
        }),
        {},
      ),
    });
  }, [setUrlState, urlState.size, filterParsers, defaultFilters]);

  // 5. 转换 URL 状态为 API 参数
  const apiParams = useMemo(() => {
    const params = {
      pageNumber: urlState.page,
      pageSize: urlState.size,
    };

    // 添加搜索、排序、业务筛选（过滤 null/"all" 值）
    if (urlState.q) params.q = urlState.q;
    if (urlState.sort) {
      const [field, order] = urlState.sort.split(".");
      params.sorting = { field, order };
    }

    // 添加业务筛选（排除 null/undefined/empty/"all"）
    for (const [key, value] of Object.entries(urlState)) {
      if (
        key !== "page" &&
        key !== "size" &&
        key !== "sort" &&
        key !== "q" &&
        value != null &&
        value !== "" &&
        value !== "all"
      ) {
        params[key] = value;
      }
    }

    return params;
  }, [urlState]);

  // 6. 调用底层 useTablePagination
  const tableQuery = useTablePagination({
    queryKey: [...queryKey, apiParams],
    queryFn: async () => queryFn(apiParams),
    columns,
    pageNumber: urlState.page,
    pageSize: urlState.size,
    onPaginationChange: ({ pageNumber, pageSize }) => {
      setUrlState({ page: pageNumber, size: pageSize });
    },
    enableServerSorting,
  });

  // 7. 返回简化的 API
  return {
    ...tableQuery,
    filters: {
      state: urlState, // 当前筛选状态
      set: setFilter, // 设置单个筛选（自动重置页码）
      reset: resetFilters, // 重置所有筛选
      onSearch, // 防抖搜索处理器
    },
  };
}
```

**使用场景**：

- ✅ 标准的 CRUD 列表页面
- ✅ 需要 URL 状态持久化的表格
- ✅ 带搜索和筛选的表格
- ✅ 需要分享/书签功能的表格

**优势**：

- **零胶水代码**：无需手动同步 URL、无需手动重置页码
- **强制最佳实践**：自动防抖、自动页码重置、URL 同步
- **类型安全**：筛选状态完全类型化
- **代码减少 47%**：一个 Hook 替代三个 Hook + 手动连线

**示例**：

```typescript
// 🔥 一个 Hook 搞定所有逻辑
const { table, filters, loading, empty, refetch, pagination } = useDataTable<User>({
  queryKey: ["users"],
  queryFn: (params) => getUsers(params as unknown as GetUsersParams),
  columns: usersTableColumns,
  filterParsers: {
    username: parseAsString,
    status: parseAsString.withDefault("all"),
  },
  defaultFilters: {
    status: "all",
  },
})

// 筛选器直接用，自动重置页码
<Select value={filters.state.status} onValueChange={(v) => filters.set("status", v)} />

// 重置按钮直接用
<Button onClick={filters.reset}>重置</Button>
```

### 第一层：基础 Hook (`useTablePagination`)

**职责**：数据获取、状态管理、表格实例创建

这是底层 Hook，提供更细粒度的控制。当 `useDataTable` 不满足需求时使用。

```typescript
export function useTablePagination<TData>(options) {
  // 1. 使用 TanStack Query 获取数据
  const query = useQuery({ ... })

  // 2. 管理内部状态
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  // 3. 自动重置页码逻辑（关键优化）
  useEffect(() => {
    if (globalFilter) {
      setPage(1) // 搜索时自动回到第一页
    }
  }, [globalFilter, setPage])

  // 4. 创建表格实例（单一数据源）
  const table = useReactTable({
    data: pageData.data ?? [], // 防御性编程：确保始终是数组
    columns,
    state: { sorting, rowSelection, globalFilter, columnVisibility, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    autoResetPageIndex: false, // 手动控制页码重置
    // ...
  })

  // 5. 返回表格实例 + 辅助函数
  return {
    table,           // ← 单一数据源
    loading,
    empty,
    pagination,
    setPage,
    setPageSize,
    globalFilter,
    setGlobalFilter,
    refetch,
  }
}
```

### 第二层：Context (`TableProvider`)

**职责**：在组件树中共享表格实例

```typescript
// 关键：泛型透传确保类型安全
interface TableContextValue<TData = unknown> {
  table: Table<TData>      // 必需 - 所有操作都通过它进行
  loading: boolean          // UI 状态
  empty: boolean           // UI 状态
  pagination?: PaginationState  // 用于分页 UI
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

// Provider 必须是泛型组件
export function TableProvider<TData>({
  children,
  table, // table: Table<TData>
  ...others
}: TableProviderProps<TData>) {
  return (
    <TableContext.Provider value={{ table, ...others }}>
      {children}
    </TableContext.Provider>
  )
}

// Hook 也必须支持泛型
export function useTableContext<TData>() {
  const context = useContext(TableContext)
  if (!context) {
    throw new Error("useTableContext must be used within TableProvider")
  }
  return context as TableContextValue<TData>
}
```

### 第三层：组件

**职责**：渲染 UI，将操作委托给表格实例

```typescript
// PaginatedTable: 布局容器
export function PaginatedTable({ table, loading, empty, ... }) {
  return (
    <TableProvider table={table} loading={loading} empty={empty}>
      <DataTableContainer>
        <DataTableFilterBar />
        <DataTable table={table} />
        <DataTablePagination />
      </DataTableContainer>
    </TableProvider>
  )
}

// DataTableToolbar: 操作工具栏
export function DataTableToolbar() {
  const { table } = useTableContext()
  return <DataTableColumnToggle table={table} />
}

// DataTableColumnToggle: 列可见性控制
export function DataTableColumnToggle({ table }) {
  return table.getAllColumns()
    .filter(col => col.getCanHide())
    .map(column => (
      <Checkbox
        checked={column.getIsVisible()}
        onChange={() => column.toggleVisibility()}
      />
    ))
}
```

## 数据流

### 完整数据流（使用 `useDataTable`）

```
用户操作（点击筛选器）
    ↓
filters.set("status", "active")
    ↓
setUrlState({ status: "active", page: 1 })  // 自动重置页码
    ↓
URL 更新：?status=active&page=1
    ↓
apiParams 重新计算（useMemo）
    ↓
queryKey 变化 [...queryKey, apiParams]
    ↓
React Query 自动触发 refetch
    ↓
queryFn(apiParams) 调用 API
    ↓
useTablePagination 创建新的表格实例
    ↓
组件重新渲染，显示新数据
```

### 读取流程（列可见性示例）

```
用户看到复选框状态
    ↑
组件读取：column.getIsVisible()
    ↑
表格实例状态：columnVisibility
    ↑
Hook 初始化：useReactTable({ state: { columnVisibility } })
```

### 写入流程（切换列示例）

```
用户点击复选框
    ↓
组件调用：column.toggleVisibility()
    ↓
表格更新内部状态
    ↓
React 使用新状态重新渲染
    ↓
复选框反映新状态
```

## 优势

### Hook 选择指南

#### 使用 `useDataTable`（推荐）

**适用场景**：

- ✅ 标准的 CRUD 列表页面
- ✅ 需要 URL 状态持久化（分享链接、书签）
- ✅ 带搜索和多个筛选器的表格
- ✅ 希望减少样板代码

**优势**：

- 零胶水代码（无需手动同步 URL）
- 自动页码重置（筛选变化时）
- 内置防抖搜索（500ms）
- 强制最佳实践
- 代码量减少 47%

**示例**：

```typescript
// Before: 3 个 Hook + 手动连线
const { urlFilters, setUrlFilters, resetFilters } = useUsersFilters()
const tableQuery = useUsersQuery({
  pageNumber: urlFilters.page,
  onPaginationChange: (p) => setUrlFilters({ page: p.pageNumber, ... })
})

// After: 1 个 Hook
const { table, filters, loading } = useDataTable({ ... })
```

#### 使用 `useTablePagination`（底层）

**适用场景**：

- ⚠️ 客户端分页（无需服务端请求）
- ⚠️ 不需要 URL 状态管理
- ⚠️ 高度自定义的分页逻辑
- ⚠️ 非标准的 API 响应格式

**优势**：

- 更细粒度的控制
- 可以完全自定义状态管理
- 不依赖 `nuqs`

**示例**：

```typescript
const tableQuery = useTablePagination({
  queryKey: ["users"],
  queryFn: async ({ pageNumber, pageSize }) => {
    return customApiCall(pageNumber, pageSize);
  },
  columns,
  // 完全手动控制
});
```

### 1. 无状态同步问题

**解决的问题**：之前，我们有 `columnChecks` 数组和 `columnVisibility` 对象。改变其中一个不会自动更新另一个。

**解决方案**：只存在 `table.getState().columnVisibility`。UI 直接从中读取。

### 2. 类型安全

```typescript
// 表格实例提供完整的类型信息
const { table } = useTableContext<User>();

// TypeScript 知道数据类型
table.getRowModel().rows.forEach((row) => {
  const user: User = row.original; // ✅ 类型正确
});
```

### 3. 可扩展性

添加新功能非常简单：

```typescript
// 想要添加导出功能？
export function ExportButton() {
  const { table } = useTableContext()

  const handleExport = () => {
    const allData = table.getRowModel().rows.map(row => row.original)
    exportToCSV(allData)
  }

  return <Button onClick={handleExport}>导出</Button>
}
```

### 4. 可测试性

```typescript
// 易于测试 - 只需创建一个表格实例
const table = useReactTable({
  data: mockData,
  columns: mockColumns,
  getCoreRowModel: getCoreRowModel(),
})

render(
  <TableProvider table={table} loading={false} empty={false}>
    <DataTableToolbar />
  </TableProvider>
)
```

## 常见模式

### 模式 0：使用 `useDataTable`（推荐）

**适用场景**：标准的 CRUD 列表页面，需要 URL 状态管理

```typescript
// 一个 Hook 搞定所有逻辑
const { table, filters, loading, empty, refetch, pagination } = useDataTable<User>({
  queryKey: ["users"],
  queryFn: (params) => getUsers(params as unknown as GetUsersParams),
  columns: usersTableColumns,
  filterParsers: {
    username: parseAsString,
    email: parseAsString,
    status: parseAsString.withDefault("all"),
  },
  defaultFilters: {
    status: "all",
  },
})

// 在 JSX 中使用
return (
  <TableProvider table={table} loading={loading} empty={empty} pagination={pagination}>
    <DataTableFilterBar
      onReset={filters.reset}
      onRefresh={refetch}
    >
      {/* 筛选器自动重置页码 */}
      <Select
        value={filters.state.status}
        onValueChange={(v) => filters.set("status", v)}
      />
    </DataTableFilterBar>
    <DataTable table={table} />
  </TableProvider>
)
```

### 模式 6：需要内部滚动的固定高度卡片

当页面容器固定高度（如弹窗、侧边抽屉、卡片）时，显式给 `DataTable` 设置 `maxHeight`：

```typescript
<DataTable
  table={table}
  loading={loading}
  empty={empty}
  emptyText="暂无数据"
  maxHeight="calc(100vh - 320px)"
/>
```

> 仅在确实需要内部滚动时才使用 `maxHeight`。

### 模式 7：表头吸顶

表头会自动吸顶（`top: 0`），无需额外配置。筛选区会随页面滚动。

### 模式 1：受控的列可见性

```typescript
const [columnVisibility, setColumnVisibility] = useState({});

const table = useTablePagination({
  // ...
  columnVisibility,
  onColumnVisibilityChange: setColumnVisibility,
});
```

### 模式 2：持久化状态

```typescript
const [columnVisibility, setColumnVisibility] = useState(() => {
  const stored = localStorage.getItem("table-columns");
  return stored ? JSON.parse(stored) : {};
});

useEffect(() => {
  localStorage.setItem("table-columns", JSON.stringify(columnVisibility));
}, [columnVisibility]);
```

### 模式 3：批量操作

```typescript
const { table } = useTableContext();

const handleBulkDelete = () => {
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => row.original.id);

  deleteUsers(selectedIds);
};
```

### 模式 4：搜索与自动重置页码

```typescript
const { table, globalFilter, setGlobalFilter } = useTablePagination({
  // ...
});

// 当用户输入搜索关键词时，Hook 会自动将页码重置为 1
const handleSearch = (value: string) => {
  setGlobalFilter(value); // 自动触发 setPage(1)
};
```

### 模式 5：跨页行选择

```typescript
const { table } = useTablePagination({
  // ...
  getRowId: (row) => row.id, // 必需：提供稳定的行 ID
  // TanStack Table v8 会自动保留跨页选择
});

// 用户可以在第 1 页选中行，翻到第 2 页，选择仍然保留
const selectedRows = table.getSelectedRowModel().rows;
```

## 应避免的反模式

### ❌ 不要创建并行状态

```typescript
// 不好：重复表格状态
const [myColumnVisibility, setMyColumnVisibility] = useState({});
const { table } = useTableContext();

// 现在你有两个数据源了！
```

### ❌ 不要绕过表格实例

```typescript
// 不好：手动过滤数据
const filteredData = data.filter((item) => item.status === "active");

// 好的做法：使用表格的过滤功能
table.setColumnFilters([{ id: "status", value: "active" }]);
```

### ❌ 不要传递冗余的 Props

```typescript
// 不好：传递表格中已有的数据
<MyComponent
  table={table}
  data={table.getRowModel().rows}  // 冗余！
  columns={table.getAllColumns()}  // 冗余！
/>

// 好的做法：只传递表格实例
<MyComponent table={table} />
```

### ❌ 不要忘记防御性编程

```typescript
// 不好：假设数据总是存在
const table = useReactTable({
  data: apiResponse.data, // 可能是 undefined
});

// 好的做法：始终提供默认值
const table = useReactTable({
  data: apiResponse.data ?? [],
});
```

### ❌ 不要忽略跨页选择的配置

```typescript
// 不好：没有提供 getRowId，跨页选择会失败
const table = useTablePagination({
  // ...
});

// 好的做法：提供稳定的行 ID
const table = useTablePagination({
  // ...
  getRowId: (row) => row.id, // TanStack Table 会自动保留跨页选择
});
```

## 性能考虑

### 1. 记忆化

Hook 使用 `useMemo` 处理派生值：

```typescript
const pagination = useMemo(
  () => ({
    pageNumber,
    pageSize,
    totalElements: pageData.pageInfo?.totalElements ?? 0,
    totalPages: pageData.pageInfo?.totalPages ?? 0,
  }),
  [pageNumber, pageSize, pageData.pageInfo],
);
```

### 2. 占位数据

使用 TanStack Query 的 `placeholderData` 防止加载闪烁：

```typescript
const query = useQuery({
  queryKey: [...],
  queryFn: ...,
  placeholderData: keepPreviousData,  // ← 获取时保留旧数据
})
```

### 3. 手动分页

启用服务端分页以避免加载所有数据：

```typescript
const table = useReactTable({
  data: pageData.data ?? [], // 防御性编程
  manualPagination: true, // ← 不在客户端分页
  pageCount: pagination.totalPages,
});
```

### 4. 自动重置控制

精确控制何时重置状态，避免不必要的重新渲染：

```typescript
const table = useReactTable({
  // ...
  autoResetPageIndex: false, // 手动控制页码重置
  // 注意：TanStack Table v8 在提供 getRowId 时会自动保留跨页选择
});
```

## 关键优化点总结

### 1. 自动重置页码逻辑

**问题**：用户在第 5 页搜索，结果只有 1 页数据，但页码仍是 5，导致空表格。

**解决**：在 Hook 中监听 `globalFilter` 变化，自动重置页码为 1。

```typescript
useEffect(() => {
  if (globalFilter) {
    setPage(1); // 搜索时自动回到第一页
  }
}, [globalFilter, setPage]);
```

### 2. 数据默认值防崩

**问题**：API 请求未返回时，`data` 可能是 `undefined`，导致 TanStack Table 崩溃。

**解决**：始终确保 `data` 是数组。

```typescript
const table = useReactTable({
  data: pageData.data ?? [], // 永远保证是数组
});
```

### 3. 泛型透传

**问题**：在组件中使用 `useTableContext` 时，`row.original` 类型变成 `unknown`。

**解决**：确保 `TableProvider` 和 `useTableContext` 都是泛型组件。

```typescript
export function TableProvider<TData>({ ... }: TableProviderProps<TData>) { ... }
export function useTableContext<TData>() { ... }
```

### 4. 跨页行选择

**问题**：用户在第 1 页选中行，翻到第 2 页后选择丢失。

**解决**：配置 `getRowId` 和 `autoResetPageIndex: false`。

```typescript
const table = useReactTable({
  getRowId: (row) => row.id, // 提供稳定的行 ID
  autoResetPageIndex: false, // 防止数据变化时重置页码
  // 注意：TanStack Table v8 会自动保留跨页选择，只要提供了 getRowId
});
```

## 复杂场景验证

### 场景：持久化列设置 + 服务端排序 + 跨页行选择

1. **持久化列设置**：
   - 用户隐藏 "Email" 列 → `columnVisibility` 更新 → `useEffect` 写入 `localStorage`
   - 刷新页面 → Hook 从 `localStorage` 读取初始值
   - ✅ 架构支持（模式 2）

2. **服务端排序**：
   - 用户点击 "Created At" 表头 → `sorting` 状态更新
   - `sorting` 作为 `queryKey` 一部分 → 触发 `react-query` 重新请求
   - ✅ 架构支持（Hook 层负责）

3. **跨页行选择**：
   - 用户在第 1 页选中 Row A → 翻到第 2 页
   - 配置 `getRowId` → TanStack Table 自动保留选择
   - ✅ 架构支持（已配置）

## 未来增强

在保持架构的同时可能的改进：

1. **列重排序**：通过 `onColumnOrderChange` 添加拖放支持
2. **列调整大小**：通过 `onColumnSizingChange` 实现
3. **行展开**：使用 `getExpandedRowModel` 支持嵌套数据
4. **虚拟滚动**：为大型数据集集成 `@tanstack/react-virtual`
5. **列固定**：通过 `onColumnPinningChange` 添加固定列

所有这些功能都可以在不破坏单一数据源原则的情况下添加。
