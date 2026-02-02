# 表格使用示例

## 🚀 推荐方式：使用 `useDataTable` Hook（零胶水代码）

### 核心优势

- **零胶水代码**：无需手动同步 URL、无需手动重置页码
- **类型安全**：筛选状态完全类型化
- **自动防抖搜索**：内置搜索防抖
- **自动页码重置**：筛选变化时自动重置到第 1 页
- **单一数据源**：URL 状态驱动一切
- **页面滚动 + Sticky**：表头吸顶、分页器吸底保持上下文，不出现“双滚动条”

### 完整示例：带服务端分页的用户表格

#### 1. 定义列配置

```typescript
// features/users/components/users-table-columns.tsx
import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { User } from "../types"

export const usersTableColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "username",
    header: "用户名",
    meta: {
      label: "用户名", // Used in column toggle
    },
  },
  {
    accessorKey: "email",
    header: "邮箱",
    meta: {
      label: "邮箱",
    },
  },
  {
    accessorKey: "status",
    header: "状态",
    meta: {
      label: "状态",
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <Badge variant={status === "active" ? "default" : "secondary"}>{status}</Badge>
    },
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm">编辑</Button>
    ),
    enableHiding: false,
  },
]
```

#### 2. 在页面组件中使用（一个 Hook 搞定所有逻辑）

```typescript
// features/users/components/users-page.tsx
import { Plus } from "lucide-react"
import { parseAsString } from "nuqs"
import { useCallback } from "react"
import { PageContainer } from "@/components/common"
import {
  DataTable,
  DataTableContainer,
  DataTableFilterBar,
  DataTablePagination,
  TableProvider,
} from "@/components/table"
import { Button } from "@/components/ui/button"
import { useDataTable } from "@/hooks"
import { getUsers } from "../api/get-users"
import { UsersFilterForm } from "./users-filter-form"
import { usersTableColumns } from "./users-table-columns"

export function UsersPage() {
  // 🔥 一个 Hook 搞定：URL、分页、API、搜索、防抖
  const { table, filters, loading, empty, fetching, refetch, pagination } = useDataTable({
    queryKey: ["users"],
    queryFn: getUsers, // API 函数直接接收 URL 参数对象
    columns: usersTableColumns,
    // 定义业务筛选字段及其解析器
    filterParsers: {
      username: parseAsString,
      email: parseAsString,
      phone: parseAsString,
      status: parseAsString.withDefault("all"),
      mfaEnabled: parseAsString.withDefault("all"),
      userGroups: parseAsString.withDefault("all"),
    },
    // 默认值（用于重置）
    defaultFilters: {
      status: "all",
      mfaEnabled: "all",
      userGroups: "all",
    },
  })

  const handleSearch = useCallback(async () => {
    await refetch()
  }, [refetch])

  const handleReset = useCallback(() => {
    filters.reset() // 自动重置所有筛选条件和页码
  }, [filters])

  const handleRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return (
    <PageContainer>
      <div className="space-y-6">
        <TableProvider
          table={table}
          loading={loading}
          empty={empty}
          pagination={pagination}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        >
          <DataTableContainer
            toolbar={
              <DataTableFilterBar
                onSearch={handleSearch}
                onReset={handleReset}
                onRefresh={handleRefresh}
                actions={
                  <Button size="sm" className="h-9">
                    <Plus className="mr-2 h-4 w-4" />
                    新增
                  </Button>
                }
              >
                <UsersFilterForm
                  urlFilters={filters.state}
                  onSelectChange={(key, value) => filters.set(key, value)}
                />
              </DataTableFilterBar>
            }
            table={
              <DataTable
                table={table}
                loading={loading}
                empty={empty}
                emptyText="暂无用户数据"
                fetching={fetching}
              />
            }
            pagination={<DataTablePagination />}
          />
        </TableProvider>
      </div>
    </PageContainer>
  )
}
```

#### 布局说明（建议必读）

- 默认是**页面滚动**，并通过 Sticky 保持上下文：
  - 表头吸顶（`top: 0`）
  - 分页器吸底
- 避免在表格外层加 `overflow-*`，否则 sticky 失效。

#### 3. 筛选表单组件

```typescript
// features/users/components/users-filter-form.tsx
import { DataTableSearch } from "@/components/table/components/data-table-search"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UsersFilterFormProps {
  urlFilters: {
    username?: string
    email?: string
    phone?: string
    status?: string
    mfaEnabled?: string
    userGroups?: string
  }
  onSelectChange: (key: string, value: string) => void
}

export function UsersFilterForm({ urlFilters, onSelectChange }: UsersFilterFormProps) {
  return (
    <div className="flex items-center gap-2">
      {/* 搜索框 - 使用 DataTableSearch 自动管理 URL */}
      {/* ⚠️ 注意：queryKey 必须与 useDataTable 的 filterParsers 中的 key 一致 */}
      <DataTableSearch
        queryKey="username"
        placeholder="搜索用户名..."
        className="w-64"
      />

      {/* 下拉筛选 - 自动重置页码 */}
      <Select
        value={urlFilters.status || "all"}
        onValueChange={(value) => onSelectChange("status", value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部</SelectItem>
          <SelectItem value="active">正常</SelectItem>
          <SelectItem value="inactive">未启用</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

### 对比：Before vs After

#### 🔴 Before（旧方式 - 需要 3 个 Hook + 手动连线）

```typescript
// ❌ 需要手动创建 useUsersFilters Hook
const { urlFilters, setUrlFilters, resetFilters, getApiFilters } =
  useUsersFilters();

// ❌ 需要手动创建 useUsersQuery Hook
const tableQuery = useUsersQuery({
  columns: usersTableColumns,
  initialFilters: getApiFilters(),
  pageNumber: urlFilters.page,
  pageSize: urlFilters.pageSize,
  onPaginationChange: (params) => {
    // ❌ 手动同步 URL
    setUrlFilters({
      page: params.pageNumber,
      pageSize: params.pageSize,
    });
  },
});

// ❌ 手动处理搜索和重置
const handleSearch = useCallback(async () => {
  await tableQuery.refetch();
}, [tableQuery]);

const handleReset = useCallback(() => {
  resetFilters(); // ❌ 需要在 resetFilters 内部手动写 page: 1
}, [resetFilters]);
```

#### 🟢 After（新方式 - 一个 Hook 搞定）

```typescript
// ✅ 一行代码搞定所有逻辑
const { table, filters, loading, empty, refetch, pagination } = useDataTable({
  queryKey: ["users"],
  queryFn: getUsers,
  columns: usersTableColumns,
  filterParsers: {
    status: parseAsString.withDefault("all"),
    role: parseAsString.withDefault("all"),
  },
  defaultFilters: {
    status: "all",
    role: "all",
  },
})

// ✅ 筛选器直接用，自动重置页码
<Select value={filters.state.status} onValueChange={(v) => filters.set("status", v)} />

// ✅ 重置按钮直接用
<Button onClick={filters.reset}>重置</Button>
```

---

## 高级用法

### 0. 固定高度容器下启用内部滚动

当表格位于固定高度的容器（如弹窗、卡片、侧边栏）时，使用 `maxHeight` 开启内部滚动：

```typescript
<DataTable
  table={table}
  loading={loading}
  empty={empty}
  emptyText="暂无数据"
  maxHeight="calc(100vh - 320px)"
/>
```

> 仅在固定高度容器中使用 `maxHeight`，否则会产生“双滚动条”。

### 1. 在自定义组件中访问表格实例

```typescript
import { useTableContext } from "@/components/table"
import { Button } from "@/components/ui/button"

export function BulkActions() {
  const { table } = useTableContext()

  const selectedRows = table.getSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0

  const handleBulkDelete = () => {
    const ids = selectedRows.map(row => row.original.id)
    // 调用删除 API
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={!hasSelection}
      onClick={handleBulkDelete}
    >
      删除 ({selectedRows.length})
    </Button>
  )
}
```

### 2. 使用行选择

```typescript
export function UsersPageWithSelection() {
  const { table, filters, loading, empty } = useDataTable({
    queryKey: ["users"],
    queryFn: getUsers,
    columns: usersTableColumns,
    filterParsers: { status: parseAsString },
  })

  // 通过表格实例访问选中的行
  const selectedRows = table.getSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleExport = () => {
    const selectedData = selectedRows.map(row => row.original)
    // 导出逻辑
  }

  return (
    <div>
      {selectedCount > 0 && (
        <div className="mb-4">
          已选择 {selectedCount} 项
          <Button onClick={handleExport}>导出</Button>
        </div>
      )}

      <DataTable table={table} loading={loading} empty={empty} />
    </div>
  )
}
```

### 3. 自定义空状态/加载状态

```typescript
<DataTable
  table={table}
  loading={loading}
  empty={empty}
  emptyText="暂无数据"
  emptyState={
    <div className="flex flex-col items-center justify-center py-12">
      <EmptyIcon className="h-16 w-16 text-muted-foreground" />
      <p className="mt-4 text-lg font-medium">暂无用户</p>
      <p className="text-sm text-muted-foreground">点击新增按钮创建第一个用户</p>
      <Button className="mt-4">新增用户</Button>
    </div>
  }
/>
```

---

## 传统方式（不推荐）：手动管理 URL 和分页

如果你需要更细粒度的控制，仍然可以使用底层的 `useTablePagination` Hook。但这需要手动处理 URL 同步和页码重置。

### 1. 创建自定义 Filter Hook

```typescript
// features/users/hooks/use-users-filters.ts
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useCallback } from "react";

const filtersParser = {
  username: parseAsString.withDefault(""),
  status: parseAsString.withDefault("all"),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
};

export function useUsersFilters() {
  const [urlFilters, setUrlFilters] = useQueryStates(filtersParser);

  // ⚠️ 关键：更新筛选条件时同步重置页码
  const updateSelectFilter = (key: string, value: string) => {
    setUrlFilters({ [key]: value, page: 1 });
  };

  const resetFilters = () => {
    setUrlFilters({ username: "", status: "all", page: 1, pageSize: 10 });
  };

  return { urlFilters, setUrlFilters, updateSelectFilter, resetFilters };
}
```

### 2. 创建自定义 Query Hook

```typescript
// features/users/hooks/use-users-query.ts
import type { ColumnDef } from "@tanstack/react-table";
import { useTablePagination } from "@/components/table";
import { getUsers } from "../api/get-users";
import type { User } from "../types";

export function useUsersQuery({
  columns,
  initialFilters = {},
  pageNumber,
  pageSize,
  onPaginationChange,
}) {
  return useTablePagination<User>({
    queryKey: ["users", initialFilters],
    queryFn: async ({ pageNumber, pageSize, sorting, filters }) => {
      return getUsers({
        pageNumber,
        pageSize,
        ...initialFilters,
        ...filters,
        ...(sorting && { sorting }),
      });
    },
    columns,
    enableServerSorting: true,
    pageNumber,
    pageSize,
    onPaginationChange,
  });
}
```

### 3. 在组件中手动连线

```typescript
// features/users/components/users-page.tsx
export function UsersPage() {
  const { urlFilters, setUrlFilters, resetFilters } = useUsersFilters()

  const tableQuery = useUsersQuery({
    columns: usersTableColumns,
    initialFilters: urlFilters,
    pageNumber: urlFilters.page,
    pageSize: urlFilters.pageSize,
    onPaginationChange: (params) => {
      // ⚠️ 手动同步 URL
      setUrlFilters({
        page: params.pageNumber,
        pageSize: params.pageSize,
      })
    },
  })

  const handleReset = useCallback(() => {
    resetFilters()
    // URL 变更后，React Query 会自动触发 refetch
  }, [resetFilters])

  return (
    <TableProvider table={tableQuery.table} loading={tableQuery.loading}>
      <DataTableFilterBar onReset={handleReset}>
        {/* 筛选表单 */}
      </DataTableFilterBar>
      <DataTable table={tableQuery.table} />
    </TableProvider>
  )
}
```

**⚠️ 注意**：这种方式需要手动处理很多细节，容易出错。**强烈推荐使用 `useDataTable` Hook**。
