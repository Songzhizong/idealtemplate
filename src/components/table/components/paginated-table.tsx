import type { Table } from "@tanstack/react-table"
import type { ReactNode } from "react"
import type { PaginationState } from "@/components/table"
import { DataTableContainer, DataTablePagination, TableProvider } from "@/components/table"
import { DataTable } from "./data-table"

export interface PaginatedTableProps<TData> {
	/**
	 * TanStack Table instance (required - single source of truth)
	 */
	table: Table<TData>
	/**
	 * Loading state
	 */
	loading: boolean
	/**
	 * Fetching state (for refresh)
	 */
	fetching?: boolean
	/**
	 * Empty state
	 */
	empty: boolean
	/**
	 * Empty text
	 */
	emptyText: string
	/**
	 * Pagination state
	 */
	pagination: PaginationState
	/**
	 * Page change handler
	 */
	onPageChange: (page: number) => void
	/**
	 * Page size change handler
	 */
	onPageSizeChange: (pageSize: number) => void
	/**
	 * Page size options
	 */
	pageSizeOptions?: number[]
	/**
	 * Show total count
	 */
	showTotal?: boolean
	/**
	 * Toolbar content (filters, search, actions) - Slot pattern
	 */
	toolbar?: ReactNode
	/**
	 * Custom empty state component
	 */
	emptyState?: ReactNode
	/**
	 * Custom loading state component
	 */
	loadingState?: ReactNode
	/**
	 * Container height. If not provided, it will try to fill the available space (flex-1)
	 */
	height?: string
	/**
	 * Additional class names
	 */
	className?: string
}

/**
 * Complete paginated table with sticky header/pagination and optional internal scroll
 * Uses TableProvider to share table instance via context
 * All state management (column visibility, sorting, selection) goes through table instance
 */
export function PaginatedTable<TData>({
	table,
	loading,
	fetching = false,
	empty,
	emptyText,
	pagination,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 20, 50, 100],
	showTotal = true,
	toolbar,
	emptyState,
	loadingState,
	height,
	className,
}: PaginatedTableProps<TData>) {
	return (
		<TableProvider
			table={table}
			loading={loading}
			empty={empty}
			pagination={pagination}
			onPageChange={onPageChange}
			onPageSizeChange={onPageSizeChange}
			pageSizeOptions={pageSizeOptions}
			showTotal={showTotal}
		>
			<DataTableContainer
				toolbar={toolbar}
				table={
					<DataTable
						table={table}
						loading={loading}
						fetching={fetching}
						empty={empty}
						emptyText={emptyText}
						{...(emptyState && { emptyState })}
						{...(loadingState && { loadingState })}
						className="border-0"
					/>
				}
				pagination={<DataTablePagination />}
				{...(height && { height })}
				{...(className && { className })}
			/>
		</TableProvider>
	)
}
