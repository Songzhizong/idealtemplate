# 表格列设置功能

## 功能概述

表格列设置功能允许用户自定义表格的列显示和顺序，并将设置持久化存储到 localStorage。

## 主要特性

### 1. 列显示/隐藏
- 点击表格右上角的"列设置"按钮
- 在下拉菜单中勾选/取消勾选列来控制显示
- 设置实时生效

### 2. 列拖拽排序
- 在列设置下拉菜单中，每一行都可以拖拽
- 拖拽图标（⋮⋮）提示可拖拽
- 拖拽时显示视觉反馈（半透明和边框高亮）
- 释放后立即应用新的列顺序

### 3. 独立存储
- 每个表格通过 `tableId` 参数独立存储设置
- 设置保存在 localStorage 中，刷新页面后保持
- 存储格式：`table-settings-{tableId}`

### 4. 重置功能
- 点击"重置"按钮恢复到默认列配置
- 清除该表格的 localStorage 存储

## 使用方法

### 基础用法

```typescript
import { useTablePagination } from "@/hooks/use-table-pagination"

const table = useTablePagination({
	queryKey: ["users"],
	queryFn: getUsers,
	transform: (response) => response,
	columns: columns,
	tableId: "users-table", // 必须：唯一的表格 ID
})

// 在组件中使用
<PaginatedTable
	columns={table.columns}
	data={table.data}
	loading={table.loading}
	empty={table.empty}
	emptyText="暂无数据"
	pagination={table.pagination}
	onPageChange={table.setPage}
	onPageSizeChange={table.setPageSize}
	columnChecks={table.columnChecks}
	setColumnChecks={table.setColumnChecks}
	resetColumns={table.resetColumns} // 可选：重置功能
	columnVisibility={table.columnVisibility}
/>
```

### 其他 Hooks

所有表格 hooks 都支持 `tableId` 参数：

```typescript
// useTable
const table = useTable({
	columns: columns,
	tableId: "my-table",
})

// useTableQuery
const table = useTableQuery({
	queryKey: ["data"],
	queryFn: getData,
	transform: (response) => response,
	columns: columns,
	tableId: "query-table",
})

// useTablePagination
const table = useTablePagination({
	queryKey: ["paginated"],
	queryFn: getPaginatedData,
	transform: (response) => response,
	columns: columns,
	tableId: "paginated-table",
})
```

## 技术实现

### 存储结构

```typescript
interface TableSettings {
	columnChecks: TableColumnCheck[]
	columnOrder: string[]
}

interface TableColumnCheck {
	key: string
	title: string
	checked: boolean
}
```

### 存储键名

- 格式：`table-settings-{tableId}`
- 示例：`table-settings-users-table`

### 列配置

默认情况下，以下列会被排除在设置之外：
- `id === "select"` (选择框列)
- `id === "actions"` (操作列)
- `meta.hideInSetting === true` (手动标记隐藏的列)

可以通过 `meta.label` 自定义列在设置中的显示名称：

```typescript
const columns: ColumnDef<User>[] = [
	{
		accessorKey: "username",
		header: "用户名",
		meta: {
			label: "用户", // 在列设置中显示为"用户"
		},
	},
]
```

## 注意事项

1. **tableId 必须唯一**：不同表格使用不同的 tableId，避免设置冲突
2. **列 key 稳定性**：列的 `id` 或 `accessorKey` 应保持稳定，避免存储失效
3. **Schema 变更处理**：当列定义变更时，会自动合并新旧配置
4. **存储限制**：localStorage 有大小限制（通常 5-10MB），但列设置数据很小，不会有问题

## 示例

参考 `src/features/users/components/users-table.tsx` 查看完整实现示例。
