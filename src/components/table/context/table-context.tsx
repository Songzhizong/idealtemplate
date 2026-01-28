import type { Table } from "@tanstack/react-table"
import { createContext, type ReactNode, useContext } from "react"
import type { PaginationState, TableColumnCheck } from "@/components/table"

export interface TableContextValue<TData = unknown> {
	/**
	 * TanStack Table instance
	 */
	table?: Table<TData>
	/**
	 * Column visibility checks
	 */
	columnChecks: TableColumnCheck[]
	/**
	 * Update column visibility
	 */
	setColumnChecks: (checks: TableColumnCheck[]) => void
	/**
	 * Reset columns to default
	 */
	resetColumns?: () => void
	/**
	 * Loading state
	 */
	loading: boolean
	/**
	 * Empty state
	 */
	empty: boolean
	/**
	 * Pagination state (optional, for paginated tables)
	 */
	pagination?: PaginationState
	/**
	 * Page change handler (optional, for paginated tables)
	 */
	onPageChange?: (page: number) => void
	/**
	 * Page size change handler (optional, for paginated tables)
	 */
	onPageSizeChange?: (pageSize: number) => void
	/**
	 * Page size options (optional, for paginated tables)
	 */
	pageSizeOptions?: number[]
	/**
	 * Show total count (optional, for paginated tables)
	 */
	showTotal?: boolean
}

const TableContext = createContext<TableContextValue | null>(null)

export interface TableProviderProps<TData = unknown> extends TableContextValue<TData> {
	children: ReactNode
}

/**
 * Table context provider for sharing state between table components
 * Reduces prop drilling and makes it easier to extend functionality
 * Enhanced with pagination support
 */
export function TableProvider<TData = unknown>({ children, ...value }: TableProviderProps<TData>) {
	return (
		<TableContext.Provider value={value as TableContextValue}>{children}</TableContext.Provider>
	)
}

/**
 * Hook to access table context
 */
export function useTableContext<TData = unknown>() {
	const context = useContext(TableContext)
	if (!context) {
		throw new Error("useTableContext must be used within TableProvider")
	}
	return context as TableContextValue<TData>
}
