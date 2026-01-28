# 表格组件使用指南

本文档详细介绍项目中表格组件的使用方法，包括基础用法、高级特性和最佳实践。

## 目录

- [架构概览](#架构概览)
- [快速开始](#快速开始)
- [核心概念](#核心概念)
- [列定义](#列定义)
- [分页功能](#分页功能)
- [排序功能](#排序功能)
- [列可见性控制](#列可见性控制)
- [工具栏配置](#工具栏配置)
- [完整示例](#完整示例)
- [API 参考](#api-参考)

---

## 架构概览

表格系统由以下核心部分组成：

```
┌─────────────────────────────────────────┐
│         Feature Component               │
│      (users-table.tsx)                  │
└──────────────┬──────────────────────────┘
               │
               ├─► useTablePagination Hook
               │   (数据获取 + 状态管理)
               │
               └─► PaginatedTable Component
                   (UI 渲染)
                   │
                   ├─► DataTableContainer
                   ├─► DataTable
                   ├─► DataTableToolbar
                   ├─► DataTablePagination
                   └─► DataTableColumnToggle
```

### 目录结构

```
src/components/table/
├── components/          # UI 组件
│   ├── data-table.tsx
│   ├── data-table-toolbar.tsx
│   ├── data-table-pagination.tsx
│   ├── data-table-column-toggle.tsx
│   ├── data-table-container.tsx
│   ├── paginated-table.tsx
│   ├── table-compound.tsx
│   └── index.ts
├── hooks/               # 表格 Hooks
│   ├── use-base-table.ts
│   ├── use-table.ts
│   ├── use-table-pagination.ts
│   ├── use-table-query.ts
│   ├── use-table-operate.ts
│   └── index.ts
├── context/             # 上下文
│   ├── table-context.tsx
│   └── index.ts
└── index.ts             # 统一导出
```

### 核心组件

- **useTablePagination**: 数据获取和状态管理 Hook
- **PaginatedTable**: 完整的分页表格组件
- **DataTable**: 基础表格渲染组件
- **DataTableToolbar**: 工具栏（搜索、筛选、操作）
- **DataTablePagination**: 分页控制器
- **DataTableColumnToggle**: 列可见性控制

### 导入路径

所有表格组件和 Hooks 统一从以下路径导入：

```typescript
// 推荐：从 @/components/table 导入
import { PaginatedTable, DataTableToolbar, TableCompound } from "@/components/table"
import { useTablePagination, useTable } from "@/components/table"

// 或从 @/hooks 导入（已重新导出）
import { useTablePagination, useTable } from "@/hooks"

// 向后兼容：从 @/components/common 导入（仍然有效）
import { PaginatedTable } from "@/components/common"
```

---

## 快速开始

### 1. 定义 API 接口


```typescript
// features/users/api/get-users.ts
import { api } from "@/lib/api-client"
import { createPageInfoSchema, type PageInfo } from "@/types/pagination"
import { type User, UserSchema } from "../types"

const UserPageSchema = createPageInfoSchema(UserSchema)

export interface GetUsersParams {
	pageNumber: number
	pageSize: number
	sorting?: {
		field: string
		order: "asc" | "desc"
	}
}

export async function getUsers(params: GetUsersParams): Promise<PageInfo<User>> {
	const searchParams: Record<string, string | number> = {
		pageNumber: params.pageNumber,
		pageSize: params.pageSize,
	}

	if (params.sorting) {
		searchParams.sortField = params.sorting.field
		searchParams.sortOrder = params.sorting.order
	}

	const response = await api
		.get("users", { searchParams })
		.json()

	return UserPageSchema.parse(response)
}
```

### 2. 定义列配置

```typescript
// features/users/components/users-table.tsx
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import type { User } from "../types"
import type { TableColumnMeta } from "@/hooks"

const columns: ColumnDef<User>[] = [
	{
		accessorKey: "username",
		header: "用户名",
		size: 200,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="font-medium">{row.original.username}</div>
		),
	},
	{
		accessorKey: "status",
		header: "状态",
		size: 100,
		enableSorting: false,
		meta: {
			align: "center",
		},
		cell: ({ row }) => (
			<Badge variant={row.original.status === "active" ? "default" : "secondary"}>
				{row.original.status}
			</Badge>
		),
	},
]
```

### 3. 使用 Hook 和组件

```typescript
import { useState } from "react"
import { PaginatedTable, DataTableToolbar } from "@/components/table"
import { useTablePagination } from "@/hooks"

export function UsersTable() {
	const [searchValue, setSearchValue] = useState("")

	const table = useTablePagination({
		queryKey: ["users", searchValue],
		queryFn: getUsers,
		columns,
		initialPageSize: 10,
		tableId: "users-table",
		enableServerSorting: true,
	})

	return (
		<PaginatedTable
			columns={table.columns}
			data={table.data}
			loading={table.loading}
			fetching={table.fetching}
			empty={table.empty}
			emptyText="暂无数据"
			pagination={table.pagination}
			onPageChange={table.setPage}
			onPageSizeChange={table.setPageSize}
			sorting={table.sorting}
			onSortingChange={table.setSorting}
			columnChecks={table.columnChecks}
			setColumnChecks={table.setColumnChecks}
			columnVisibility={table.columnVisibility}
			toolbar={
				<DataTableToolbar
					filterPlaceholder="搜索用户"
					filterValue={searchValue}
					onFilterChange={setSearchValue}
					onRefresh={table.refetch}
				/>
			}
		/>
	)
}
```

---

## 核心概念

### 1. 服务端 vs 客户端

**服务端模式**（推荐）：
- 分页、排序、筛选在服务端处理
- 适合大数据量场景
- 使用 `useTablePagination` + `enableServerSorting: true`

**客户端模式**：
- 一次性加载所有数据，前端处理
- 适合小数据量场景
- 使用 `useTableQuery`

### 2. 状态管理

表格状态分为以下几类：

| 状态类型  | 管理方式           | 说明                   |
|-------|----------------|----------------------|
| 服务端数据 | TanStack Query | 自动缓存、重新验证            |
| 分页状态  | Hook 内部        | pageNumber, pageSize |
| 排序状态  | Hook 内部        | sorting              |
| 列可见性  | localStorage   | 持久化用户偏好              |
| 行选择   | Hook 内部        | rowSelection         |

### 3. 数据流

```
用户操作 → Hook 更新状态 → TanStack Query 重新请求 → API 返回数据 → 组件重新渲染
```

---

## 列定义

### 基础列配置


```typescript
{
	accessorKey: "username",      // 数据字段名
	header: "用户名",              // 表头显示文本
	size: 200,                    // 列宽（px）
	enableSorting: true,          // 是否启用排序
	enableHiding: true,           // 是否可隐藏（默认 true）
	cell: ({ row }) => { ... },   // 单元格渲染函数
}
```

### 列宽度

使用 `size` 属性定义列宽（单位：px）：

```typescript
{
	accessorKey: "username",
	size: 200,  // 固定宽度 200px
}
```

**注意**：表格使用 `table-layout: fixed`，所有列必须定义 `size`。

### 列对齐

使用 `meta.align` 控制对齐方式：

```typescript
import type { TableColumnMeta } from "@/hooks"

{
	accessorKey: "amount",
	header: "金额",
	meta: {
		align: "right",  // "left" | "center" | "right"
	} as TableColumnMeta,
	cell: ({ row }) => <div>¥{row.original.amount}</div>,
}
```

### 自定义单元格

```typescript
{
	accessorKey: "user",
	header: "用户信息",
	cell: ({ row }) => (
		<div className="space-y-1">
			<div className="font-medium text-primary">
				{row.original.username}
			</div>
			<div className="text-sm text-muted-foreground">
				{row.original.email}
			</div>
		</div>
	),
}
```

### 操作列

```typescript
{
	id: "actions",
	header: "操作",
	size: 120,
	enableSorting: false,
	enableHiding: false,
	meta: {
		align: "center",
	},
	cell: ({ row }) => (
		<div className="flex items-center gap-2">
			<Button variant="ghost" size="sm">编辑</Button>
			<Button variant="ghost" size="sm">删除</Button>
		</div>
	),
}
```

### 状态列（Badge）

```typescript
{
	accessorKey: "status",
	header: "状态",
	size: 100,
	meta: {
		align: "center",
	},
	cell: ({ row }) => {
		const statusMap = {
			active: { variant: "default", label: "正常" },
			inactive: { variant: "secondary", label: "禁用" },
		}
		const config = statusMap[row.original.status]
		return <Badge variant={config.variant}>{config.label}</Badge>
	},
}
```

---

## 分页功能

### 基础配置


```typescript
const table = useTablePagination({
	// ...
	initialPageSize: 10,           // 初始每页条数
	initialPage: 1,                // 初始页码
})

<PaginatedTable
	pagination={table.pagination}
	onPageChange={table.setPage}
	onPageSizeChange={table.setPageSize}
	pageSizeOptions={[10, 20, 50, 100]}  // 每页条数选项
	showTotal={true}                      // 显示总数
/>
```

### 分页状态

```typescript
interface PaginationState {
	pageNumber: number      // 当前页码（从 1 开始）
	pageSize: number        // 每页条数
	totalElements: number   // 总记录数
	totalPages: number      // 总页数
}
```

### 手动控制分页

```typescript
// 跳转到指定页
table.setPage(3)

// 修改每页条数（会重置到第 1 页）
table.setPageSize(20)

// 上一页
table.previousPage()

// 下一页
table.nextPage()
```

---

## 排序功能

### 启用服务端排序

```typescript
const table = useTablePagination({
	// ...
	enableServerSorting: true,  // 启用服务端排序
})

<PaginatedTable
	sorting={table.sorting}
	onSortingChange={table.setSorting}
/>
```

### 列排序配置

```typescript
{
	accessorKey: "username",
	header: "用户名",
	enableSorting: true,   // 启用排序（默认 true）
}

{
	accessorKey: "actions",
	header: "操作",
	enableSorting: false,  // 禁用排序
}
```

### 排序状态

```typescript
// 排序状态格式
type SortingState = Array<{
	id: string       // 列 ID
	desc: boolean    // 是否降序
}>

// 示例：按用户名升序
[{ id: "username", desc: false }]

// 示例：按创建时间降序
[{ id: "createdAt", desc: true }]
```

### API 接收的排序参数

```typescript
interface SortingParams {
	field: string           // 排序字段
	order: "asc" | "desc"   // 排序方向
}

// Hook 会自动转换：
// { id: "username", desc: false } → { field: "username", order: "asc" }
```

### 默认排序

```typescript
const [sorting, setSorting] = useState<SortingState>([
	{ id: "createdAt", desc: true }  // 默认按创建时间降序
])

const table = useTablePagination({
	// ... 其他配置
})

// 手动设置排序
table.setSorting([{ id: "username", desc: false }])
```

---

## 列可见性控制

### 自动持久化


列可见性设置会自动保存到 `localStorage`，使用 `tableId` 作为键：

```typescript
const table = useTablePagination({
	// ...
	tableId: "users-table",  // 唯一标识，用于持久化
})
```

### 列可见性组件

```typescript
<PaginatedTable
	columnChecks={table.columnChecks}
	setColumnChecks={table.setColumnChecks}
	resetColumns={table.resetColumns}
	columnVisibility={table.columnVisibility}
	toolbar={
		<DataTableToolbar>
			<DataTableColumnToggle />
		</DataTableToolbar>
	}
/>
```

### 禁止隐藏某列

```typescript
{
	accessorKey: "username",
	header: "用户名",
	enableHiding: false,  // 不允许隐藏
}
```

### 自定义列标题

```typescript
const table = useTablePagination({
	// ...
	getColumnChecks: (columns) => {
		return columns
			.filter((col) => col.id !== "select" && col.id !== "actions")
			.map((col) => ({
				key: col.id || "",
				title: col.header?.toString() || "",
				checked: true,
			}))
	},
})
```

---

## 工具栏配置

### 基础工具栏

```typescript
<DataTableToolbar
	filterPlaceholder="搜索用户"
	filterValue={searchValue}
	onFilterChange={setSearchValue}
	onRefresh={table.refetch}
/>
```

### 带筛选器的工具栏

```typescript
<DataTableToolbar
	filterPlaceholder="搜索"
	filterValue={searchValue}
	onFilterChange={setSearchValue}
	onRefresh={table.refetch}
	filters={
		<>
			<Select value={statusFilter} onValueChange={setStatusFilter}>
				<SelectTrigger className="h-9 w-[120px]">
					<SelectValue placeholder="状态" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">全部</SelectItem>
					<SelectItem value="active">正常</SelectItem>
					<SelectItem value="inactive">禁用</SelectItem>
				</SelectContent>
			</Select>
		</>
	}
	actions={
		<Button variant="default" size="sm">
			<Plus className="mr-1 h-4 w-4" />
			新增
		</Button>
	}
/>
```

### 工具栏插槽

| 插槽                  | 说明     | 示例             |
|---------------------|--------|----------------|
| `filterPlaceholder` | 搜索框占位符 | "搜索用户"         |
| `filterValue`       | 搜索值    | searchValue    |
| `onFilterChange`    | 搜索变化回调 | setSearchValue |
| `onRefresh`         | 刷新回调   | table.refetch  |
| `filters`           | 筛选器区域  | Select 组件      |
| `actions`           | 操作按钮区域 | 新增按钮           |

---

## 完整示例

### 用户管理表格


```typescript
// features/users/components/users-table.tsx
import type { ColumnDef } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { DataTableToolbar, PaginatedTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { getUsers, type User } from "@/features/users"
import { useTablePagination } from "@/hooks"

const columns: ColumnDef<User>[] = [
	{
		accessorKey: "username",
		header: "用户",
		size: 200,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="space-y-1">
				<div className="font-medium text-primary">{row.original.username}</div>
				<div className="text-sm text-muted-foreground">{row.original.email}</div>
			</div>
		),
	},
	{
		accessorKey: "userGroup",
		header: "用户组",
		size: 120,
		enableSorting: false,
		cell: ({ row }) => (
			<Badge variant="outline" className="font-normal">
				{row.original.userGroup}
			</Badge>
		),
	},
	{
		accessorKey: "status",
		header: "状态",
		size: 100,
		enableSorting: true,
		meta: {
			align: "center",
		},
		cell: ({ row }) => (
			<Badge variant={row.original.status === "active" ? "default" : "secondary"}>
				{row.original.status === "active" ? "正常" : "禁用"}
			</Badge>
		),
	},
	{
		id: "actions",
		header: "操作",
		size: 120,
		enableSorting: false,
		enableHiding: false,
		meta: {
			align: "center",
		},
		cell: () => (
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="sm" className="h-auto p-0 text-primary hover:bg-transparent">
					编辑
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-auto p-0 text-primary hover:bg-transparent">
							更多
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>查看详情</DropdownMenuItem>
						<DropdownMenuItem>重置密码</DropdownMenuItem>
						<DropdownMenuItem className="text-destructive">删除</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		),
	},
]

export function UsersTable() {
	const [searchValue, setSearchValue] = useState("")
	const [statusFilter, setStatusFilter] = useState<string>("all")

	const memoizedColumns = useMemo(() => columns, [])

	const table = useTablePagination({
		queryKey: ["users", searchValue, statusFilter],
		queryFn: getUsers,
		columns: memoizedColumns,
		initialPageSize: 10,
		tableId: "users-table",
		enableServerSorting: true,
	})

	return (
		<div className="flex h-full flex-col gap-4 p-6">
			<PaginatedTable
				columns={table.columns}
				data={table.data}
				loading={table.loading}
				fetching={table.fetching}
				empty={table.empty}
				emptyText="暂无数据"
				pagination={table.pagination}
				onPageChange={table.setPage}
				onPageSizeChange={table.setPageSize}
				pageSizeOptions={[10, 20, 30, 50, 100]}
				showTotal={true}
				enableRowSelection={false}
				columnChecks={table.columnChecks}
				setColumnChecks={table.setColumnChecks}
				resetColumns={table.resetColumns}
				columnVisibility={table.columnVisibility}
				columnOrder={table.columnOrder}
				sorting={table.sorting}
				onSortingChange={table.setSorting}
				height="calc(100vh - 240px)"
				toolbar={
					<DataTableToolbar
						filterPlaceholder="搜索用户"
						filterValue={searchValue}
						onFilterChange={setSearchValue}
						onRefresh={async () => {
							await table.refetch()
						}}
						filters={
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="h-9 w-[120px]">
									<SelectValue placeholder="状态" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">全部状态</SelectItem>
									<SelectItem value="active">正常</SelectItem>
									<SelectItem value="inactive">禁用</SelectItem>
								</SelectContent>
							</Select>
						}
						actions={
							<Button variant="default" size="sm" className="h-9">
								<Plus className="mr-1 h-4 w-4" />
								新增用户
							</Button>
						}
					/>
				}
			/>
		</div>
	)
}
```

---

## API 参考

### useTablePagination

分页表格数据管理 Hook。

**导入路径：**
```typescript
import { useTablePagination } from "@/hooks"
// 或
import { useTablePagination } from "@/components/table"
```

#### 参数

```typescript
interface UseTablePaginationOptions<TData, TResponse> {
	queryKey: unknown[]                    // TanStack Query 缓存键
	queryFn: (params: {                    // API 请求函数
		pageNumber: number
		pageSize: number
		sorting?: SortingParams
		filters?: FilterParams
	}) => Promise<TResponse>
	transform?: (response: TResponse) => PageInfo<TData>  // 响应转换函数（可选）
	columns: ColumnDef<TData>[]            // 列定义
	getColumnChecks?: (columns: ColumnDef<TData>[]) => TableColumnCheck[]
	tableId?: string                       // 表格唯一标识（用于持久化）
	initialPage?: number                   // 初始页码（默认 1）
	initialPageSize?: number               // 初始每页条数（默认 10）
	enableServerSorting?: boolean          // 启用服务端排序（默认 false）
	enableServerFiltering?: boolean        // 启用服务端筛选（默认 false）
	onFetched?: (response: TResponse) => void | Promise<void>
	onPaginationChange?: (params: { pageNumber: number; pageSize: number }) => void | Promise<void>
}
```

**注意：** `transform` 参数是可选的。如果 API 返回的数据已经是 `PageInfo<TData>` 格式，可以省略此参数。

#### 返回值

```typescript
{
	// 数据状态
	loading: boolean                       // 首次加载状态
	fetching: boolean                      // 刷新加载状态
	data: TData[]                          // 表格数据
	empty: boolean                         // 是否为空
	isError: boolean                       // 是否错误
	error: Error | null                    // 错误对象

	// 分页控制
	pagination: PaginationState            // 分页状态
	setPage: (page: number) => void        // 设置页码
	setPageSize: (size: number) => void    // 设置每页条数
	nextPage: () => void                   // 下一页
	previousPage: () => void               // 上一页

	// 排序控制
	sorting: SortingState                  // 排序状态
	setSorting: (sorting: SortingState | Updater<SortingState>) => void

	// 筛选控制
	filters: FilterParams                  // 筛选参数
	setFilters: (filters: FilterParams) => void

	// 列控制
	columns: ColumnDef<TData>[]            // 列定义
	columnChecks: TableColumnCheck[]       // 列可见性检查
	setColumnChecks: (checks: TableColumnCheck[]) => void
	resetColumns: () => void               // 重置列设置
	columnVisibility: VisibilityState      // 列可见性状态
	columnOrder: ColumnOrderState          // 列顺序状态

	// 行选择
	rowSelection: RowSelectionState        // 行选择状态
	onRowSelectionChange: (selection: RowSelectionState | Updater<RowSelectionState>) => void

	// 其他
	refetch: () => Promise<QueryObserverResult>  // 手动刷新
}
```

### PaginatedTable

完整的分页表格组件。

**导入路径：**
```typescript
import { PaginatedTable } from "@/components/table"
// 或（向后兼容）
import { PaginatedTable } from "@/components/common"
```

#### Props

```typescript
interface PaginatedTableProps<TData> {
	// 必需
	columns: ColumnDef<TData>[]
	data: TData[]
	loading: boolean
	empty: boolean
	emptyText: string
	pagination: PaginationState
	onPageChange: (page: number) => void
	onPageSizeChange: (pageSize: number) => void
	columnChecks: TableColumnCheck[]
	setColumnChecks: (checks: TableColumnCheck[]) => void

	// 可选
	fetching?: boolean
	pageSizeOptions?: number[]
	showTotal?: boolean
	enableRowSelection?: boolean
	rowSelection?: RowSelectionState
	onRowSelectionChange?: (selection: RowSelectionState | Updater<RowSelectionState>) => void
	getRowId?: (row: TData) => string
	resetColumns?: () => void
	columnVisibility?: VisibilityState
	onColumnVisibilityChange?: (visibility: VisibilityState | Updater<VisibilityState>) => void
	columnOrder?: string[]
	sorting?: SortingState
	onSortingChange?: (sorting: SortingState | Updater<SortingState>) => void
	toolbar?: ReactNode
	emptyState?: ReactNode
	loadingState?: ReactNode
	height?: string
	className?: string
}
```

### DataTableToolbar

表格工具栏组件。

**导入路径：**
```typescript
import { DataTableToolbar } from "@/components/table"
```

#### Props

```typescript
interface DataTableToolbarProps {
	filterPlaceholder?: string             // 搜索框占位符
	filterValue?: string                   // 搜索值
	onFilterChange?: (value: string) => void
	onRefresh?: () => void | Promise<void>
	filters?: ReactNode                    // 筛选器插槽
	actions?: ReactNode                    // 操作按钮插槽
}
```

### ColumnDef

列定义类型（来自 TanStack Table）。

```typescript
import type { ColumnDef } from "@tanstack/react-table"
import type { TableColumnMeta } from "@/hooks"

interface ColumnDef<TData> {
	id?: string                            // 列 ID（自定义列必需）
	accessorKey?: string                   // 数据字段名
	header: string | ((props: HeaderContext<TData>) => ReactNode)
	cell?: (props: CellContext<TData>) => ReactNode
	size?: number                          // 列宽（px）
	minSize?: number                       // 最小宽度
	maxSize?: number                       // 最大宽度
	enableSorting?: boolean                // 启用排序（默认 true）
	enableHiding?: boolean                 // 允许隐藏（默认 true）
	meta?: TableColumnMeta                 // 扩展元数据
}

// 扩展的列元数据
interface TableColumnMeta {
	label?: string                         // 列设置中显示的名称
	hideInSetting?: boolean                // 是否在列设置中隐藏
	align?: "left" | "center" | "right"    // 对齐方式
	fixed?: "left" | "right"               // 固定列位置（未来支持）
	width?: number | string                // 列宽（未来支持）
}
```

---

## 最佳实践

### 1. 列定义使用 useMemo

避免不必要的重新渲染：

```typescript
const columns = useMemo<ColumnDef<User>[]>(() => [
	{
		accessorKey: "username",
		header: "用户名",
		// ...
	},
], [])
```

### 2. 合理设置 queryKey

确保筛选参数包含在 queryKey 中：

```typescript
const table = useTablePagination({
	queryKey: ["users", searchValue, statusFilter, roleFilter],
	// ...
})
```

### 3. 使用语义化主题变量

```typescript
// ✅ 正确
<div className="bg-background text-foreground border-border">

// ❌ 错误
<div className="bg-white text-black border-gray-200">
```

### 4. 状态列使用 Badge

```typescript
// ✅ 正确
<Badge variant={status === "active" ? "default" : "secondary"}>
	{statusLabel}
</Badge>

// ❌ 错误
<div className="bg-green-500 text-white">
	{statusLabel}
</div>
```

### 5. 操作列禁用排序和隐藏

```typescript
{
	id: "actions",
	header: "操作",
	enableSorting: false,
	enableHiding: false,
	// ...
}
```

### 6. 使用 tableId 持久化设置

```typescript
const table = useTablePagination({
	tableId: "users-table",  // 唯一标识
	// ...
})
```

### 7. 合理设置列宽

```typescript
// 文本列：150-250px
{ accessorKey: "username", size: 200 }

// 状态列：80-120px
{ accessorKey: "status", size: 100 }

// 操作列：100-150px
{ id: "actions", size: 120 }
```

### 8. 异步刷新处理

```typescript
<DataTableToolbar
	onRefresh={async () => {
		await table.refetch()
		// 可以添加成功提示
	}}
/>
```

---

## 常见问题

### Q1: 表头和内容宽度不一致？

**原因**：列定义中没有设置 `size` 属性。

**解决**：为所有列添加 `size` 属性：

```typescript
{
	accessorKey: "username",
	size: 200,  // 必需
}
```

### Q2: 排序不生效？

**检查清单**：
1. 是否启用了 `enableServerSorting: true`
2. 是否传递了 `sorting` 和 `onSortingChange`
3. API 是否正确处理排序参数
4. 列定义中是否设置了 `enableSorting: true`

### Q3: 列可见性设置不保存？

**原因**：没有设置 `tableId`。

**解决**：

```typescript
const table = useTablePagination({
	tableId: "unique-table-id",  // 添加唯一标识
	// ...
})
```

### Q4: 如何实现多列排序？

当前实现仅支持单列排序。如需多列排序，需要修改 `useTablePagination` 的 `sortingParams` 逻辑。

### Q5: 如何自定义空状态？

```typescript
<PaginatedTable
	emptyState={
		<TableRow>
			<TableCell colSpan={columns.length} className="h-24 text-center">
				<div className="flex flex-col items-center gap-2">
					<EmptyIcon className="h-12 w-12 text-muted-foreground" />
					<p className="text-muted-foreground">暂无数据</p>
					<Button variant="outline" size="sm">创建第一条记录</Button>
				</div>
			</TableCell>
		</TableRow>
	}
/>
```

### Q6: 如何实现行选择？

```typescript
const table = useTablePagination({
	// ...
})

<PaginatedTable
	enableRowSelection={true}
	rowSelection={table.rowSelection}
	onRowSelectionChange={table.onRowSelectionChange}
	getRowId={(row) => row.id}
/>

// 获取选中的行
const selectedRows = table.data.filter((_, index) =>
	table.rowSelection[index]
)
```

### Q7: 如何实现客户端排序？

使用 `useTableQuery` 代替 `useTablePagination`，或者不启用 `enableServerSorting`。

---

## 性能优化

### 1. 列定义 Memoization

```typescript
const columns = useMemo(() => [...], [])
```

### 2. TanStack Query 缓存

```typescript
const table = useTablePagination({
	queryKey: ["users", filters],  // 相同 key 会使用缓存
	// ...
})
```

### 3. 虚拟滚动（大数据量）

对于超大数据量，考虑使用 `@tanstack/react-virtual`：

```typescript
import { useVirtualizer } from "@tanstack/react-virtual"

// 在 DataTable 中集成虚拟滚动
```

### 4. 防抖搜索

```typescript
import { useDebouncedValue } from "@/hooks/use-debounced-value"

const [searchInput, setSearchInput] = useState("")
const debouncedSearch = useDebouncedValue(searchInput, 300)

const table = useTablePagination({
	queryKey: ["users", debouncedSearch],  // 使用防抖值
	// ...
})
```

---

## 扩展功能

### 行展开

```typescript
{
	id: "expander",
	header: "",
	size: 50,
	cell: ({ row }) => (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => row.toggleExpanded()}
		>
			{row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
		</Button>
	),
}
```

### 批量操作

```typescript
const selectedCount = Object.keys(table.rowSelection).length

{selectedCount > 0 && (
	<div className="flex items-center gap-2">
		<span className="text-sm text-muted-foreground">
			已选择 {selectedCount} 项
		</span>
		<Button variant="destructive" size="sm">
			批量删除
		</Button>
	</div>
)}
```

### 导出功能

```typescript
const handleExport = () => {
	const csv = table.data.map(row =>
		Object.values(row).join(",")
	).join("\n")

	const blob = new Blob([csv], { type: "text/csv" })
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = "export.csv"
	a.click()
}

<Button onClick={handleExport}>导出</Button>
```

---

## 总结

表格组件系统提供了：

- ✅ 服务端分页、排序、筛选
- ✅ 列可见性控制和持久化
- ✅ 灵活的工具栏配置
- ✅ 完整的 TypeScript 类型支持
- ✅ 与 TanStack Query 深度集成
- ✅ 响应式设计和主题支持

遵循本指南，你可以快速构建功能完善、性能优异的数据表格。

---

**相关文档**：
- [表格组件 README](../src/components/table/README.md) - 快速开始和使用示例
- [列设置持久化说明](./table-column-settings.md) - 列可见性持久化机制
- [TanStack Table 官方文档](https://tanstack.com/table/latest)
- [TanStack Query 官方文档](https://tanstack.com/query/latest)
