import type { ColumnDef } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { DataTableToolbar, PaginatedTable } from "@/components/common"
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
import { getUsers, type User, UserGroupEnum, UserStatusEnum } from "@/features/users"
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
		enableSorting: false, // 禁用排序
		cell: ({ row }) => {
			const group = row.original.userGroup as keyof typeof UserGroupEnum
			return (
				<Badge variant="outline" className="font-normal">
					{UserGroupEnum[group] || row.original.userGroup}
				</Badge>
			)
		},
	},
	{
		accessorKey: "phone",
		header: "联系方式",
		size: 180,
		cell: ({ row }) => (
			<div className="space-y-1">
				<div className="flex items-center gap-1 text-sm">
					<span className="text-muted-foreground">📱</span>
					<span>{row.original.phone}</span>
				</div>
				<div className="flex items-center gap-1 text-sm text-muted-foreground">
					<span>✉️</span>
					<span className="truncate">{row.original.email}</span>
				</div>
			</div>
		),
	},
	{
		accessorKey: "status",
		header: "状态",
		size: 100,
		meta: {
			align: "center",
		},
		cell: ({ row }) => {
			const status = row.original.status
			return (
				<Badge variant={status === "active" ? "default" : "secondary"} className="font-normal">
					{UserStatusEnum[status]}
				</Badge>
			)
		},
	},
	{
		accessorKey: "mfaEnabled",
		header: "MFA",
		size: 100,
		meta: {
			align: "center",
		},
		cell: ({ row }) => {
			const enabled = row.original.mfaEnabled
			return (
				<Badge variant={enabled ? "default" : "secondary"} className="font-normal">
					{enabled ? "已启用" : "未启用"}
				</Badge>
			)
		},
	},
	{
		accessorKey: "lastVisit",
		header: "最近访问",
		size: 120,
		meta: {
			align: "center",
		},
		cell: ({ row }) => {
			const date = new Date(row.original.lastVisit)
			const now = new Date()
			const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

			let displayText: string
      if (diffDays === 0) {
				displayText = "今天"
			} else if (diffDays === 1) {
				displayText = "昨天"
			} else if (diffDays < 7) {
				displayText = `${diffDays}天前`
			} else {
				displayText = date.toLocaleDateString("zh-CN")
			}

			return <div className="text-sm text-muted-foreground">{displayText}</div>
		},
	},
	{
		id: "actions",
		header: "操作",
		size: 120,
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
						<Button
							variant="ghost"
							size="sm"
							className="h-auto p-0 text-primary hover:bg-transparent"
						>
							更多
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem>查看详情</DropdownMenuItem>
						<DropdownMenuItem>重置密码</DropdownMenuItem>
						<DropdownMenuItem>修改权限</DropdownMenuItem>
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
	const [mfaFilter, setMfaFilter] = useState<string>("all")

	const memoizedColumns = useMemo(() => columns, [])

	const table = useTablePagination({
		queryKey: ["users", searchValue, statusFilter, mfaFilter],
		queryFn: getUsers,
		transform: (response) => response,
		columns: memoizedColumns,
		initialPageSize: 10,
		tableId: "users-table",
		enableServerSorting: true, // 启用服务端排序
	})

	return (
		<div className="flex h-full flex-col gap-4 p-6">
			{/* Table */}
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
						filterPlaceholder="ID / 名称 / 账号 / 手机 / 邮箱"
						filterValue={searchValue}
						onFilterChange={setSearchValue}
						onRefresh={async () => {
							await table.refetch()
						}}
						filters={
							<>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="h-9 w-30">
										<SelectValue placeholder="状态" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">状态</SelectItem>
										<SelectItem value="active">正常</SelectItem>
										<SelectItem value="inactive">未启用</SelectItem>
									</SelectContent>
								</Select>
								<Select value={mfaFilter} onValueChange={setMfaFilter}>
									<SelectTrigger className="h-9 w-30">
										<SelectValue placeholder="MFA" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">MFA</SelectItem>
										<SelectItem value="enabled">已启用</SelectItem>
										<SelectItem value="disabled">未启用</SelectItem>
									</SelectContent>
								</Select>
								<Button variant="outline" size="sm" className="h-9">
									更多筛选
								</Button>
							</>
						}
						actions={
							<Button variant="default" size="sm" className="h-9">
								<Plus className="mr-1 h-4 w-4" />
								新增
							</Button>
						}
					/>
				}
			/>
		</div>
	)
}
