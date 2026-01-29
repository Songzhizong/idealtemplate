import type { ColumnDef, RowSelectionState, Updater, VisibilityState } from "@tanstack/react-table"
import type { ReactNode } from "react"
import type { PaginationState } from "@/components/table"
import {
	DataTableContainer,
	DataTableFilterBar,
	DataTablePagination,
	DataTableToolbar,
	TableProvider,
} from "@/components/table"
import { DataTable } from "./data-table"

/**
 * Compound component pattern for flexible table composition
 * Allows developers to compose table with custom layouts
 *
 * @example
 * ```tsx
 * <TableCompound.Root value={tableState}>
 *   <TableCompound.Container>
 *     <TableCompound.Toolbar />
 *     <TableCompound.Table />
 *     <TableCompound.Pagination />
 *   </TableCompound.Container>
 * </TableCompound.Root>
 * ```
 */

interface TableRootProps<_TData> {
	children: ReactNode
	columnChecks: Array<{ key: string; title: string; checked: boolean }>
	setColumnChecks: (checks: Array<{ key: string; title: string; checked: boolean }>) => void
	loading: boolean
	empty: boolean
	pagination?: PaginationState
	onPageChange?: (page: number) => void
	onPageSizeChange?: (pageSize: number) => void
	pageSizeOptions?: number[]
	showTotal?: boolean
}

function TableRoot<TData>({
	children,
	columnChecks,
	setColumnChecks,
	loading,
	empty,
	pagination,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions,
	showTotal,
}: TableRootProps<TData>) {
	const providerProps = {
		columnChecks,
		setColumnChecks,
		loading,
		empty,
		...(pagination && { pagination }),
		...(onPageChange && { onPageChange }),
		...(onPageSizeChange && { onPageSizeChange }),
		...(pageSizeOptions && { pageSizeOptions }),
		...(showTotal !== undefined && { showTotal }),
	}

	return <TableProvider {...providerProps}>{children}</TableProvider>
}

interface TableContainerProps {
	children: ReactNode
	height?: string
	className?: string
	toolbar?: ReactNode
	pagination?: ReactNode
}

function TableContainer({
	children,
	height,
	className,
	toolbar,
	pagination,
}: TableContainerProps) {
	// If toolbar and pagination are provided as props, use DataTableContainer
	if (toolbar !== undefined || pagination !== undefined) {
		const containerProps = {
			table: children,
			height,
			...(toolbar !== undefined && { toolbar }),
			...(pagination !== undefined && { pagination }),
			...(className && { className }),
		}
		return <DataTableContainer {...containerProps} />
	}

	// Otherwise, render children directly (for manual composition)
	return (
		<div
			className={cn(className, !height && "min-h-0 flex-1 flex flex-col")}
			style={height ? { height } : undefined}
		>
			{children}
		</div>
	)
}

interface TableContentProps<TData> {
	columns: ColumnDef<TData>[]
	data: TData[]
	loading: boolean
	empty: boolean
	emptyText: string
	enableRowSelection?: boolean
	rowSelection?: RowSelectionState
	onRowSelectionChange?: (selection: RowSelectionState | Updater<RowSelectionState>) => void
	columnVisibility?: VisibilityState
	onColumnVisibilityChange?: (visibility: VisibilityState | Updater<VisibilityState>) => void
	getRowId?: (row: TData) => string
	emptyState?: ReactNode
	loadingState?: ReactNode
	className?: string
}

function TableContent<TData>({
	columns,
	data,
	loading,
	empty,
	emptyText,
	enableRowSelection = false,
	rowSelection,
	onRowSelectionChange,
	columnVisibility,
	onColumnVisibilityChange,
	getRowId,
	emptyState,
	loadingState,
	className,
}: TableContentProps<TData>) {
	const tableProps = {
		columns,
		data,
		loading,
		empty,
		emptyText,
		enableRowSelection,
		...(rowSelection && { rowSelection }),
		...(onRowSelectionChange && { onRowSelectionChange }),
		...(columnVisibility && { columnVisibility }),
		...(onColumnVisibilityChange && { onColumnVisibilityChange }),
		...(getRowId && { getRowId }),
		...(emptyState && { emptyState }),
		...(loadingState && { loadingState }),
		...(className && { className }),
	}

	return <DataTable {...tableProps} />
}

interface TableToolbarProps {
	filterPlaceholder?: string
	filterValue?: string
	onFilterChange?: (value: string) => void
	actions?: ReactNode
	filters?: ReactNode
	className?: string
	hideColumnToggle?: boolean
}

function TableToolbar(props: TableToolbarProps) {
	return <DataTableToolbar {...props} />
}

interface TablePaginationProps {
	className?: string
	text?: {
		total?: (count: number) => string
		perPage?: string
		firstPage?: string
		previousPage?: string
		nextPage?: string
		lastPage?: string
	}
}

function TablePagination(props: TablePaginationProps) {
	return <DataTablePagination {...props} />
}

import type { DataTableFilterBarProps } from "./data-table-filter-bar"

function TableFilterBar(props: DataTableFilterBarProps) {
	return <DataTableFilterBar {...props} />
}

/**
 * Compound component exports
 */
export const TableCompound = {
	Root: TableRoot,
	Container: TableContainer,
	Table: TableContent,
	Toolbar: TableToolbar,
	Pagination: TablePagination,
	FilterBar: TableFilterBar,
}
