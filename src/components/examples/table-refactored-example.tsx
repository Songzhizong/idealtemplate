import type { ColumnDef } from "@tanstack/react-table"
import { Plus, RefreshCw } from "lucide-react"
import { TableCompound } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TableColumnMeta } from "@/hooks"
import { useTablePagination } from "@/hooks"

/**
 * Example data type
 */
interface User {
	id: string
	name: string
	email: string
	role: string
	status: "active" | "inactive" | "pending"
}

/**
 * Mock API function
 */
async function fetchUsers() {
	// Simulate API call
	return {
		content: [
			{
				id: "1",
				name: "John Doe",
				email: "john@example.com",
				role: "Admin",
				status: "active" as const,
			},
			{
				id: "2",
				name: "Jane Smith",
				email: "jane@example.com",
				role: "User",
				status: "active" as const,
			},
			{
				id: "3",
				name: "Bob Johnson",
				email: "bob@example.com",
				role: "User",
				status: "inactive" as const,
			},
		],
		pageNumber: 1,
		pageSize: 10,
		totalElements: 3,
		totalPages: 1,
	}
}

/**
 * Example 1: Using the new compound component pattern
 * Demonstrates flexible composition and custom layouts
 */
export function TableCompoundExample() {
	// Define columns with enhanced metadata
	const columns: ColumnDef<User>[] = [
		{
			accessorKey: "name",
			header: "Name",
			meta: {
				label: "User Name", // Better label for column toggle
			} as TableColumnMeta,
		},
		{
			accessorKey: "email",
			header: "Email",
			meta: {
				label: "Email Address",
			} as TableColumnMeta,
		},
		{
			accessorKey: "role",
			header: "Role",
			meta: {
				label: "User Role",
			} as TableColumnMeta,
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => {
				const status = row.original.status
				const variant =
					status === "active" ? "default" : status === "inactive" ? "secondary" : "outline"
				return <Badge variant={variant}>{status}</Badge>
			},
			meta: {
				label: "Account Status",
			} as TableColumnMeta,
		},
		{
			id: "actions",
			header: "Actions",
			cell: () => (
				<Button variant="ghost" size="sm">
					Edit
				</Button>
			),
			meta: {
				hideInSetting: true, // Don't show in column toggle
			} as TableColumnMeta,
		},
	]

	// Use the table hook
	const tableState = useTablePagination({
		queryKey: ["users-compound"],
		queryFn: fetchUsers,
		columns,
	})

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-foreground">Compound Component Example</h2>
			</div>

			{/* New compound component pattern - maximum flexibility */}
			<TableCompound.Root
				columnChecks={tableState.columnChecks}
				setColumnChecks={tableState.setColumnChecks}
				loading={tableState.loading}
				empty={tableState.empty}
				pagination={tableState.pagination}
				onPageChange={tableState.setPage}
				onPageSizeChange={tableState.setPageSize}
			>
				<TableCompound.Container height="calc(100vh - 300px)">
					{/* Custom toolbar with actions */}
					<TableCompound.Toolbar
						filterPlaceholder="Search users..."
						actions={
							<div className="flex items-center gap-2">
								<Button size="sm" onClick={() => tableState.refetch()}>
									<RefreshCw className="mr-2 h-4 w-4" />
									Refresh
								</Button>
								<Button size="sm">
									<Plus className="mr-2 h-4 w-4" />
									Add User
								</Button>
							</div>
						}
					/>

					{/* Table content */}
					<TableCompound.Table
						columns={columns}
						data={tableState.data}
						loading={tableState.loading}
						empty={tableState.empty}
						emptyText="No users found"
						enableRowSelection
						rowSelection={tableState.rowSelection}
						onRowSelectionChange={tableState.onRowSelectionChange}
						columnVisibility={tableState.columnVisibility}
					/>

					{/* Pagination with i18n */}
					<TableCompound.Pagination
						text={{
							total: (count) => `Total ${count} users`,
							perPage: "per page",
							firstPage: "First page",
							previousPage: "Previous page",
							nextPage: "Next page",
							lastPage: "Last page",
						}}
					/>
				</TableCompound.Container>
			</TableCompound.Root>
		</div>
	)
}

/**
 * Example 2: Using column metadata for better configuration
 * Shows how to use the new TableColumnMeta interface
 */
export function TableMetadataExample() {
	const columns: ColumnDef<User>[] = [
		{
			id: "select",
			// Selection column should be hidden from settings
			meta: {
				hideInSetting: true,
			} as TableColumnMeta,
		},
		{
			accessorKey: "name",
			header: "Name",
			meta: {
				label: "Full Name",
				// Future: fixed: "left" for pinned columns
			} as TableColumnMeta,
		},
		{
			accessorKey: "email",
			header: "Email",
			meta: {
				label: "Email Address",
				// Future: width: 300 for fixed width
			} as TableColumnMeta,
		},
	]

	const tableState = useTablePagination({
		queryKey: ["users-metadata"],
		queryFn: fetchUsers,
		columns,
	})

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold text-foreground">Column Metadata Example</h2>
			<p className="text-sm text-muted-foreground">
				Notice how the selection column doesn't appear in the column toggle menu
			</p>

			<TableCompound.Root {...tableState}>
				<TableCompound.Container>
					<TableCompound.Toolbar />
					<TableCompound.Table
						columns={columns}
						data={tableState.data}
						loading={tableState.loading}
						empty={tableState.empty}
						emptyText="No data"
						columnVisibility={tableState.columnVisibility}
					/>
					<TableCompound.Pagination />
				</TableCompound.Container>
			</TableCompound.Root>
		</div>
	)
}

/**
 * Example 3: Internationalization support
 * Shows how to customize text for different languages
 */
export function TableI18nExample() {
	const columns: ColumnDef<User>[] = [
		{
			accessorKey: "name",
			header: "姓名",
			meta: { label: "用户姓名" } as TableColumnMeta,
		},
		{
			accessorKey: "email",
			header: "邮箱",
			meta: { label: "电子邮箱" } as TableColumnMeta,
		},
		{
			accessorKey: "role",
			header: "角色",
			meta: { label: "用户角色" } as TableColumnMeta,
		},
	]

	const tableState = useTablePagination({
		queryKey: ["users-i18n"],
		queryFn: fetchUsers,
		columns,
	})

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold text-foreground">国际化示例 (i18n Example)</h2>

			<TableCompound.Root {...tableState}>
				<TableCompound.Container>
					<TableCompound.Toolbar filterPlaceholder="搜索用户..." />
					<TableCompound.Table
						columns={columns}
						data={tableState.data}
						loading={tableState.loading}
						empty={tableState.empty}
						emptyText="暂无数据"
						columnVisibility={tableState.columnVisibility}
					/>
					{/* Chinese i18n text */}
					<TableCompound.Pagination
						text={{
							total: (count) => `共 ${count} 条`,
							perPage: "/ 页",
							firstPage: "首页",
							previousPage: "上一页",
							nextPage: "下一页",
							lastPage: "末页",
						}}
					/>
				</TableCompound.Container>
			</TableCompound.Root>
		</div>
	)
}
