import type { ColumnDef } from "@tanstack/react-table"
import { DataTableToolbar, PaginatedTable } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTablePagination } from "@/hooks"
import type { PageInfo } from "@/types/pagination"

// Example data type
interface User {
	id: string
	name: string
	email: string
	role: string
	status: "active" | "inactive"
	createdAt: string
}

// Mock API function
async function getUsers({
	pageNumber,
	pageSize,
}: {
	pageNumber: number
	pageSize: number
}): Promise<PageInfo<User>> {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500))

	// Generate mock data
	const totalElements = 100
	const totalPages = Math.ceil(totalElements / pageSize)
	const start = (pageNumber - 1) * pageSize
	const end = Math.min(start + pageSize, totalElements)

	const content: User[] = Array.from({ length: end - start }, (_, i) => ({
		id: `${start + i + 1}`,
		name: `User ${start + i + 1}`,
		email: `user${start + i + 1}@example.com`,
		role: ["Admin", "User", "Manager"][Math.floor(Math.random() * 3)] as string,
		status: Math.random() > 0.3 ? "active" : "inactive",
		createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
	}))

	return {
		content,
		pageNumber,
		pageSize,
		totalElements,
		totalPages,
	}
}

// Column definitions
const columns: ColumnDef<User>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
	},
	{
		accessorKey: "email",
		header: "Email",
		cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => {
			const role = row.getValue("role") as string
			return (
				<Badge variant="outline" className="font-normal">
					{role}
				</Badge>
			)
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => {
			const status = row.getValue("status") as string
			return (
				<Badge variant={status === "active" ? "default" : "secondary"} className="font-normal">
					{status}
				</Badge>
			)
		},
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"))
			return <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<div className="flex gap-2">
				<Button variant="ghost" size="sm" onClick={() => console.log("Edit", row.original.id)}>
					Edit
				</Button>
				<Button variant="ghost" size="sm" onClick={() => console.log("Delete", row.original.id)}>
					Delete
				</Button>
			</div>
		),
	},
]

/**
 * Example paginated table with all features:
 * - Fixed header and pagination
 * - Scrollable body
 * - Row selection
 * - Column visibility toggle
 * - Search/filter toolbar
 * - Loading and empty states
 */
export function TableExample() {
	const table = useTablePagination({
		queryKey: ["users-example"],
		queryFn: getUsers,
		transform: (response) => response,
		columns,
		initialPageSize: 10,
	})

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Users</h2>
					<p className="text-muted-foreground">Manage your users with a powerful table</p>
				</div>
				<Button onClick={() => console.log("Add user")}>Add User</Button>
			</div>

			<PaginatedTable
				columns={table.columns}
				data={table.data}
				loading={table.loading}
				empty={table.empty}
				emptyText="No users found"
				pagination={table.pagination}
				onPageChange={table.setPage}
				onPageSizeChange={table.setPageSize}
				pageSizeOptions={[10, 20, 30, 50, 100]}
				showTotal={true}
				enableRowSelection={true}
				rowSelection={table.rowSelection}
				onRowSelectionChange={table.onRowSelectionChange}
				columnChecks={table.columnChecks}
				setColumnChecks={table.setColumnChecks}
				columnVisibility={table.columnVisibility}
				getRowId={(row) => row.id}
				toolbar={
					<DataTableToolbar
						filterPlaceholder="Search users..."
						actions={
							<div className="flex gap-2">
								<Button variant="outline" size="sm">
									Export
								</Button>
								<Button variant="outline" size="sm">
									Filter
								</Button>
							</div>
						}
					/>
				}
				height="calc(100vh - 280px)"
			/>
		</div>
	)
}
