# 表格组件速查手册 (Cheatsheet)

本手册旨在帮助开发人员和 AI 快速掌握项目中表格组件的使用。

## 📦 核心组件

项目提供两种使用模式：**快捷模式** (PaginatedTable) 和 **灵活模式** (TableCompound)。

### 1. 快捷模式 (PaginatedTable)
适用于标准的分页列表，配置简单，一站式解决。

```tsx
import { PaginatedTable, useTablePagination } from "@/components/table"

export function UserList() {
  const table = useTablePagination({
    queryKey: ["users"],
    queryFn: ({ pageNumber, pageSize }) => getUsers({ page: pageNumber, size: pageSize }),
    columns,
    tableId: "user-list", // 用于持久化列配置
  })

  return (
    <PaginatedTable
      {...table}
      columns={columns}
      emptyText="暂无用户"
      onPageChange={table.setPage}
      onPageSizeChange={table.setPageSize}
    />
  )
}
```

### 2. 灵活模式 (TableCompound)
适用于需要自定义工具栏、布局或多个组件组合的场景。

```tsx
import { TableCompound, useTablePagination } from "@/components/table"

export function ComplexList() {
  const table = useTablePagination({ /* ...config */ })

  return (
    <TableCompound.Root {...table}>
      <TableCompound.Container 
        toolbar={<TableCompound.Toolbar left={<div>左侧自定义</div>} />}
        pagination={<TableCompound.Pagination />}
      >
        <TableCompound.Table 
          columns={columns} 
          onRowClick={(row) => console.log(row)} 
        />
      </TableCompound.Container>
    </TableCompound.Root>
  )
}
```

---

## 🛠 核心 Hook：`useTablePagination`

`useTablePagination` 是表格的状态中心，它处理：
- **数据获取**: 集成 TanStack Query。
- **分页控制**: 当前页、页码大小。
- **列控制**: 显示/隐藏、顺序、持久化（需 `tableId`）。
- **选择**: 行选择状态。

### 返回值常用属性
- `data`: 当前页数据。
- `loading` / `fetching`: 加载状态。
- `pagination`: `{ pageNumber, pageSize, totalElements, ... }`。
- `setPage`, `setPageSize`: 切换分页函数。
- `columnChecks`, `setColumnChecks`: 用于 `DataTableColumnToggle`。
- `rowSelection`, `onRowSelectionChange`: 用于行选择。

---

## 📐 列定义 (Column Definition)

列定义遵循 [TanStack Table V8](https://tanstack.com/table/v8) 规范，并进行了增强。

### TableColumnMeta
通过 `column.meta` 扩展功能：
- `label`: 在列显隐设置中显示的名称。
- `hideInSetting`: 是否在列设置中隐藏。

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "姓名",
    meta: { label: "用户姓名" } // 增强元数据
  },
  // ...
]
```

---

## 💡 AI 使用指南

1. **优先推荐**: 只要是带分页的列表，优先推荐使用 `useTablePagination`。
2. **选择列**: 如果需要首列复选框，使用 `createSelectionColumn()` 辅助函数。
3. **元数据**: 必须为 columns 提供 `meta.label`，否则 `DataTableColumnToggle` 将无法显示正确的中文列名。
4. **ID 指定**: 为 `useTablePagination` 提供唯一的 `tableId`，以便用户刷新页面后保留列显隐首选项。
5. **高度调整**: `TableCompound.Container` 默认高度为 `calc(100vh - 300px)`，可根据页面布局调整。
