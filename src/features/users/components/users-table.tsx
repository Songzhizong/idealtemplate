import type { ColumnDef } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { DataTableFilterBar, PaginatedTable, useTablePagination } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { getUsers, type User, UserGroupEnum, UserStatusEnum } from "@/features/users"

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
				<div className="flex justify-center">
					<Badge variant={status === "active" ? "default" : "secondary"} className="font-normal">
						{UserStatusEnum[status]}
					</Badge>
				</div>
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
				<div className="flex justify-center">
					<Badge variant={enabled ? "default" : "secondary"} className="font-normal">
						{enabled ? "已启用" : "未启用"}
					</Badge>
				</div>
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

			return <div className="text-center text-sm text-muted-foreground">{displayText}</div>
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
			<div className="flex items-center justify-center gap-2">
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
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const [mfaFilter, setMfaFilter] = useState<string>("all")
	const [groupFilter, setGroupFilter] = useState<string>("all")

	// Input refs (uncontrolled for better performance)
	const inputRef = useRef<HTMLInputElement>(null)
	const emailInputRef = useRef<HTMLInputElement>(null)
	const phoneInputRef = useRef<HTMLInputElement>(null)

	const memoizedColumns = useMemo(() => columns, [])

	const table = useTablePagination({
		queryKey: ["users"],
		queryFn: (params) =>
			getUsers({
				...params,
				username: inputRef.current?.value || "",
				status: statusFilter,
				mfaEnabled: mfaFilter,
				email: emailInputRef.current?.value || "",
				phone: phoneInputRef.current?.value || "",
				userGroup: groupFilter,
			}),
		transform: (response) => response,
		columns: memoizedColumns,
		initialPageSize: 10,
		tableId: "users-table",
		enableServerSorting: true, // 启用服务端排序
	})

	const handleSearch = () => {
		// Just trigger a refetch, the queryFn will use the latest input states
		void table.refetch()
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSearch()
		}
	}

	const handleReset = () => {
		if (inputRef.current) inputRef.current.value = ""
		if (emailInputRef.current) emailInputRef.current.value = ""
		if (phoneInputRef.current) phoneInputRef.current.value = ""
		setStatusFilter("all")
		setMfaFilter("all")
		setGroupFilter("all")
		// After resetting state, we need to refetch
		// Since setState is async, we might need a way to ensure refetch uses new values.
		// Actually, useTablePagination's refetch will use whatever is in queryFn at that moment.
		setTimeout(() => void table.refetch(), 0)
	}

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
				toolbar={
					<DataTableFilterBar
						onSearch={handleSearch}
						onReset={handleReset}
						onRefresh={() => void table.refetch()}
						actions={
							<Button variant="default" size="sm" className="h-9">
								<Plus className="mr-1 h-4 w-4" />
								新增
							</Button>
						}
						extraFilters={
							<>
								<div className="flex flex-col gap-2">
									<Input
										placeholder="搜索手机号..."
										ref={phoneInputRef}
										className="h-9"
										onKeyDown={handleKeyDown}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Input
										placeholder="搜索邮箱..."
										ref={emailInputRef}
										className="h-9"
										onKeyDown={handleKeyDown}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Select
										value={groupFilter}
										onValueChange={(v) => {
											setGroupFilter(v)
											setTimeout(() => void table.refetch(), 0)
										}}
									>
										<SelectTrigger className="h-9">
											<SelectValue placeholder="全部用户组" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">全部用户组</SelectItem>
											{Object.entries(UserGroupEnum).map(([key, value]) => (
												<SelectItem key={key} value={key}>
													{value}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex flex-col gap-2">
									<Select
										value={mfaFilter}
										onValueChange={(v) => {
											setMfaFilter(v)
											setTimeout(() => void table.refetch(), 0)
										}}
									>
										<SelectTrigger className="h-9">
											<SelectValue placeholder="MFA 状态" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">全部</SelectItem>
											<SelectItem value="enabled">已启用</SelectItem>
											<SelectItem value="disabled">未启用</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</>
						}
					>
						<div className="flex items-center gap-3">
							<Input
								placeholder="搜索 ID / 名称 / 账号..."
								ref={inputRef}
								className="h-9 w-64 lg:w-80"
								onKeyDown={handleKeyDown}
							/>
							<Select
								value={statusFilter}
								onValueChange={(v) => {
									setStatusFilter(v)
									setTimeout(() => void table.refetch(), 0)
								}}
							>
								<SelectTrigger className="h-9 w-32">
									<SelectValue placeholder="状态" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">全部状态</SelectItem>
									<SelectItem value="active">正常</SelectItem>
									<SelectItem value="inactive">未启用</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</DataTableFilterBar>
				}
			/>
		</div>
	)
}
