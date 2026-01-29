import type {
	ColumnDef,
	RowSelectionState,
	SortingState,
	Updater,
	VisibilityState,
} from "@tanstack/react-table"
import type { ReactNode } from "react"
import type { PaginationState } from "@/components/table"
import { DataTableContainer, DataTablePagination, TableProvider } from "@/components/table"
import { DataTable } from "./data-table"

export interface PaginatedTableProps<TData> {
	/**
	 * Table columns
	 */
	columns: ColumnDef<TData>[]
	/**
	 * Table data
	 */
	data: TData[]
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
	 * Enable row selection
	 */
	enableRowSelection?: boolean
	/**
	 * Row selection state
	 */
	rowSelection?: RowSelectionState
	/**
	 * Row selection change handler
	 */
	onRowSelectionChange?: (selection: RowSelectionState | Updater<RowSelectionState>) => void
	/**
	 * Get row ID
	 */
	getRowId?: (row: TData) => string
	/**
	 * Column checks for visibility control
	 */
	columnChecks: Array<{ key: string; title: string; checked: boolean }>
	/**
	 * Update column checks
	 */
	setColumnChecks: (checks: Array<{ key: string; title: string; checked: boolean }>) => void
	/**
	 * Reset columns to default
	 */
	resetColumns?: () => void
	/**
	 * Column visibility state (TanStack Table format)
	 */
	columnVisibility?: VisibilityState
	/**
	 * Column visibility change handler
	 */
	onColumnVisibilityChange?: (visibility: VisibilityState | Updater<VisibilityState>) => void
	/**
	 * Column order state (TanStack Table format)
	 */
	columnOrder?: string[]
	/**
	 * Sorting state (TanStack Table format)
	 */
	sorting?: SortingState
	/**
	 * Sorting change handler
	 */
	onSortingChange?: (sorting: SortingState | Updater<SortingState>) => void
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
 * Complete paginated table with fixed header/pagination and scrollable body
 * Uses TableProvider to share state via context, reducing prop drilling
 * Enhanced to support TanStack Table's columnVisibility state
 */
export function PaginatedTable<TData>({
	columns,
	data,
	loading,
	fetching = false,
	empty,
	emptyText,
	pagination,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 20, 50, 100],
	showTotal = true,
	enableRowSelection = false,
	rowSelection,
	onRowSelectionChange,
	getRowId,
	columnChecks,
	setColumnChecks,
	resetColumns,
	columnVisibility,
	onColumnVisibilityChange,
	columnOrder,
	sorting,
	onSortingChange,
	toolbar,
	emptyState,
	loadingState,
	height,
	className,
}: PaginatedTableProps<TData>) {
	return (
		<TableProvider
			columnChecks={columnChecks}
			setColumnChecks={setColumnChecks}
			{...(resetColumns && { resetColumns })}
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
						columns={columns}
						data={data}
						loading={loading}
						fetching={fetching}
						empty={empty}
						emptyText={emptyText}
						enableRowSelection={enableRowSelection}
						{...(rowSelection && { rowSelection })}
						{...(onRowSelectionChange && { onRowSelectionChange })}
						{...(columnVisibility && { columnVisibility })}
						{...(onColumnVisibilityChange && { onColumnVisibilityChange })}
						{...(columnOrder && { columnOrder })}
						{...(sorting && { sorting })}
						{...(onSortingChange && { onSortingChange })}
						{...(getRowId && { getRowId })}
						{...(emptyState && { emptyState })}
						{...(loadingState && { loadingState })}
						className="border-0"
					/>
				}
				pagination={<DataTablePagination />}
				height={height}
				{...(className && { className })}
			/>
		</TableProvider>
	)
}
