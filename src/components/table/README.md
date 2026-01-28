# Table Components

表格组件库,提供完整的数据表格解决方案,支持分页、排序、筛选、列可见性控制等功能。

## 目录结构

```
src/components/table/
├── components/          # UI 组件
│   ├── data-table.tsx                  # 核心表格组件
│   ├── data-table-toolbar.tsx          # 工具栏(搜索、筛选、操作)
│   ├── data-table-pagination.tsx       # 分页组件
│   ├── data-table-column-toggle.tsx    # 列可见性控制
│   ├── data-table-container.tsx        # 容器布局
│   ├── paginated-table.tsx             # 完整分页表格
│   ├── table-compound.tsx              # 复合组件模式
│   └── index.ts
├── hooks/               # 表格相关 Hooks
│   ├── use-base-table.ts               # 基础表格逻辑
│   ├── use-table.ts                    # 简单表格 Hook
│   ├── use-table-pagination.ts         # 分页表格 Hook
│   ├── use-table-query.ts              # 查询表格 Hook
│   ├── use-table-operate.ts            # CRUD 操作 Hook
│   └── index.ts
├── context/             # 上下文
│   ├── table-context.tsx               # 表格状态共享
│   └── index.ts
└── index.ts             # 统一导出
```

## 使用方式

### 1. 简单分页表格 (推荐)

```typescript
import { PaginatedTable } from "@/components/table"
import { useTablePagination } from "@/hooks"

function UsersTable() {
	const table = useTablePagination({
		queryKey: ["users"],
		queryFn: getUsers,
		columns,
		initialPageSize: 10,
		tableId: "users-table", // 用于持久化列设置
		enableServerSorting: true,
	})

	return (
		<PaginatedTable
			{...table}
			toolbar={
				<DataTableToolbar
					filterPlaceholder="搜索用户..."
					filterValue={searchValue}
					onFilterChange={setSearchValue}
					onRefresh={table.refetch}
				/>
			}
		/>
	)
}
```

### 2. 复合组件模式 (灵活布局)

```typescript
import { TableCompound } from "@/components/table"
import { useTablePagination } from "@/hooks"

function CustomTable() {
	const table = useTablePagination({
		queryKey: ["data"],
		queryFn: fetchData,
		columns,
	})

	return (
		<TableCompound.Root {...table}>
			<TableCompound.Container height="calc(100vh - 300px)">
				<TableCompound.Toolbar
					filterPlaceholder="搜索..."
					actions={
						<Button onClick={handleAdd}>
							<Plus className="mr-2 h-4 w-4" />
							新增
						</Button>
					}
				/>
				<TableCompound.Table
					columns={columns}
					data={table.data}
					loading={table.loading}
					empty={table.empty}
					emptyText="暂无数据"
					columnVisibility={table.columnVisibility}
				/>
				<TableCompound.Pagination />
			</TableCompound.Container>
		</TableCompound.Root>
	)
}
```

### 3. 列配置

```typescript
import type { ColumnDef } from "@tanstack/react-table"
import type { TableColumnMeta } from "@/hooks"

const columns: ColumnDef<User>[] = [
	{
		accessorKey: "name",
		header: "姓名",
		meta: {
			label: "用户姓名", // 列设置中显示的名称
		} as TableColumnMeta,
	},
	{
		accessorKey: "email",
		header: "邮箱",
		meta: {
			label: "电子邮箱",
			align: "center", // 对齐方式
		} as TableColumnMeta,
	},
	{
		id: "actions",
		header: "操作",
		meta: {
			hideInSetting: true, // 不在列设置中显示
		} as TableColumnMeta,
	},
]
```

## Hooks API

### useTablePagination

完整的分页表格 Hook,集成 TanStack Query。

```typescript
const table = useTablePagination({
	queryKey: ["users"],
	queryFn: getUsers,
	columns,
	initialPage: 1,
	initialPageSize: 10,
	tableId: "users-table", // 可选,用于持久化设置
	enableServerSorting: true, // 启用服务端排序
	enableServerFiltering: true, // 启用服务端筛选
})
```

返回值:
- `data`: 表格数据
- `loading`: 加载状态
- `fetching`: 刷新状态
- `pagination`: 分页信息
- `setPage`: 设置页码
- `setPageSize`: 设置每页条数
- `columnChecks`: 列可见性状态
- `setColumnChecks`: 更新列可见性
- `columnVisibility`: TanStack Table 格式的列可见性
- `sorting`: 排序状态
- `setSorting`: 设置排序
- `refetch`: 刷新数据

### useTable

简单表格 Hook,适用于客户端数据。

```typescript
const table = useTable({
	columns,
	initialData: [],
	tableId: "simple-table",
})
```

### useTableOperate

CRUD 操作 Hook。

```typescript
const operate = useTableOperate({
	data: table.data,
	idKey: "id",
	onRefresh: table.refetch,
})

// 使用
operate.handleAdd()
operate.handleEdit(id)
operate.handleView(id)
```

## 特性

- ✅ 服务端分页、排序、筛选
- ✅ 列可见性控制(拖拽排序)
- ✅ 持久化列设置(localStorage)
- ✅ 行选择
- ✅ 固定表头和分页
- ✅ 加载和空状态
- ✅ 国际化支持
- ✅ 完全类型安全
- ✅ 复合组件模式

## 导入路径

所有表格相关的组件和 Hooks 都可以从以下路径导入:

```typescript
// 直接从 table 模块导入
import { PaginatedTable, DataTableToolbar, TableCompound } from "@/components/table"

// 或从 hooks 导入(已重新导出)
import { useTablePagination, useTable } from "@/hooks"

// 或从 common 导入(已重新导出,向后兼容)
import { PaginatedTable } from "@/components/common"
```
