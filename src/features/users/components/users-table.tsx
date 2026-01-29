import type { ColumnDef } from "@tanstack/react-table"
import { Plus } from "lucide-react"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { useEffect, useMemo } from "react"
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
import { Switch } from "@/components/ui/switch"
import { getUsers, type User, UserGroupEnum } from "@/features/users"
import { useThemeStore } from "@/hooks/use-theme-store"

// 用户组颜色映射函数
const getUserGroupColor = (group: string, chartColors: string[]) => {
	const groupKeys = Object.keys(UserGroupEnum)
	const index = groupKeys.indexOf(group)
	return chartColors[index % chartColors.length] || chartColors[0]
}

const columns: ColumnDef<User>[] = [
	{
		accessorKey: "username",
		header: "用户",
		size: 200,
		enableSorting: true,
		cell: ({ row }) => (
			<div className="space-y-1">
				<div className="font-medium text-foreground">{row.original.username}</div>
				<div className="text-sm text-muted-foreground">{row.original.email}</div>
			</div>
		),
	},
	{
		accessorKey: "userGroups",
		header: "用户组",
		size: 180,
		enableSorting: false,
		cell: ({ row }) => {
			const { getActivePreset, getEffectiveMode } = useThemeStore()
			const preset = getActivePreset()
			const mode = getEffectiveMode()
			const chartColors = preset?.schemes[mode]?.charts.categorical || []

			return (
				<div className="flex flex-wrap gap-1">
					{row.original.userGroups.map((group) => {
						const groupKey = group as keyof typeof UserGroupEnum
						const color = getUserGroupColor(group, chartColors)
						return (
							<Badge
								key={group}
								variant="outline"
								className="font-normal border-0"
								style={{
									backgroundColor: `${color}15`,
									color: color,
								}}
							>
								{UserGroupEnum[groupKey] || group}
							</Badge>
						)
					})}
				</div>
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
					<Switch
						checked={status === "active"}
						disabled
						className="data-[state=checked]:bg-success data-[state=unchecked]:bg-muted"
					/>
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
					<Badge
						variant={enabled ? "default" : "secondary"}
						className={`font-normal ${
							enabled
								? "bg-success text-success-foreground hover:bg-success/90"
								: "bg-muted text-muted-foreground"
						}`}
					>
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
	// URL state management with nuqs
	const [queryParams, setQueryParams] = useQueryStates({
		// Search filters
		username: parseAsString.withDefault(""),
		email: parseAsString.withDefault(""),
		phone: parseAsString.withDefault(""),
		status: parseAsString.withDefault("all"),
		mfaEnabled: parseAsString.withDefault("all"),
		userGroups: parseAsString.withDefault("all"),
		// Pagination
		page: parseAsInteger.withDefault(1),
		pageSize: parseAsInteger.withDefault(10),
		// Sorting
		sortBy: parseAsString.withDefault(""),
		sortOrder: parseAsString.withDefault(""),
	})

	const memoizedColumns = useMemo(() => columns, [])

	const table = useTablePagination({
		queryKey: ["users", queryParams],
		queryFn: (params) => {
			const getUsersParams = {
				pageNumber: params.pageNumber,
				pageSize: params.pageSize,
			} as const

			// Only add optional parameters if they have values
			const optionalParams: Record<string, string> = {}
			if (queryParams.username) optionalParams.username = queryParams.username
			if (queryParams.status !== "all") optionalParams.status = queryParams.status
			if (queryParams.mfaEnabled !== "all") optionalParams.mfaEnabled = queryParams.mfaEnabled
			if (queryParams.email) optionalParams.email = queryParams.email
			if (queryParams.phone) optionalParams.phone = queryParams.phone
			if (queryParams.userGroups !== "all") optionalParams.userGroups = queryParams.userGroups

			return getUsers({
				...getUsersParams,
				...optionalParams,
				...(params.sorting && { sorting: params.sorting }),
			})
		},
		transform: (response) => response,
		columns: memoizedColumns,
		initialPageSize: queryParams.pageSize,
		initialPage: queryParams.page,
		tableId: "users-table",
		enableServerSorting: true,
	})

	// Sync URL params with table state
	useEffect(() => {
		if (table.pagination.pageNumber !== queryParams.page) {
			setQueryParams({ page: table.pagination.pageNumber })
		}
	}, [table.pagination.pageNumber, queryParams.page, setQueryParams])

	useEffect(() => {
		if (table.pagination.pageSize !== queryParams.pageSize) {
			setQueryParams({ pageSize: table.pagination.pageSize })
		}
	}, [table.pagination.pageSize, queryParams.pageSize, setQueryParams])

	// Sync sorting with URL
	useEffect(() => {
		const currentSort = table.sorting[0]
		const urlSortBy = currentSort?.id || ""
		const urlSortOrder = currentSort?.desc ? "desc" : "asc"

		if (urlSortBy !== queryParams.sortBy || (urlSortBy && urlSortOrder !== queryParams.sortOrder)) {
			setQueryParams({
				sortBy: urlSortBy,
				sortOrder: urlSortBy ? urlSortOrder : "",
			})
		}
	}, [table.sorting, queryParams.sortBy, queryParams.sortOrder, setQueryParams])

	const handleSearch = () => {
		// Reset to first page when searching
		if (queryParams.page !== 1) {
			setQueryParams({ page: 1 })
		}
		void table.refetch()
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSearch()
		}
	}

	const handleReset = () => {
		setQueryParams({
			username: "",
			email: "",
			phone: "",
			status: "all",
			mfaEnabled: "all",
			userGroups: "all",
			page: 1,
			sortBy: "",
			sortOrder: "",
		})
	}

	const handlePageChange = (page: number) => {
		setQueryParams({ page })
		table.setPage(page)
	}

	const handlePageSizeChange = (pageSize: number) => {
		setQueryParams({ pageSize, page: 1 }) // Reset to first page when changing page size
		table.setPageSize(pageSize)
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
				onPageChange={handlePageChange}
				onPageSizeChange={handlePageSizeChange}
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
										value={queryParams.phone}
										onChange={(e) => setQueryParams({ phone: e.target.value })}
										className="h-9"
										onKeyDown={handleKeyDown}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Input
										placeholder="搜索邮箱..."
										value={queryParams.email}
										onChange={(e) => setQueryParams({ email: e.target.value })}
										className="h-9"
										onKeyDown={handleKeyDown}
									/>
								</div>
								<div className="flex flex-col gap-2">
									<Select
										value={queryParams.userGroups}
										onValueChange={(v) => setQueryParams({ userGroups: v, page: 1 })}
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
										value={queryParams.mfaEnabled}
										onValueChange={(v) => setQueryParams({ mfaEnabled: v, page: 1 })}
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
								value={queryParams.username}
								onChange={(e) => setQueryParams({ username: e.target.value })}
								className="h-9 w-64 lg:w-80"
								onKeyDown={handleKeyDown}
							/>
							<Select
								value={queryParams.status}
								onValueChange={(v) => setQueryParams({ status: v, page: 1 })}
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
