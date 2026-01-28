import type { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table"
import { useCallback, useState } from "react"
import { useLoading } from "@/hooks/use-loading"
import { type TableColumnCheck, useBaseTable } from "./use-base-table"

export type { TableColumnCheck } from "./use-base-table"

export interface UseTableOptions<TData> {
	/**
	 * Columns definition
	 */
	columns: ColumnDef<TData>[]
	/**
	 * Initial data
	 */
	initialData?: TData[]
	/**
	 * Get column checks for visibility control
	 */
	getColumnChecks?: (columns: ColumnDef<TData>[]) => TableColumnCheck[]
	/**
	 * Unique table ID for storing settings
	 */
	tableId?: string
	/**
	 * Whether to fetch data immediately
	 * @default true
	 */
	immediate?: boolean
}

/**
 * Core table hook for managing table state
 * Uses useBaseTable for shared column visibility logic
 */
export function useTable<TData>(options: UseTableOptions<TData>) {
	const { columns: baseColumns, initialData = [], getColumnChecks, tableId } = options

	const { loading, startLoading, endLoading } = useLoading()
	const baseTable = useBaseTable({
		columns: baseColumns,
		...(getColumnChecks && { getColumnChecks }),
		...(tableId && { tableId }),
	})

	const [data, setData] = useState<TData[]>(initialData)

	// Row selection state
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

	const handleRowSelectionChange = useCallback(
		(updater: RowSelectionState | Updater<RowSelectionState>) => {
			setRowSelection((prev) => (typeof updater === "function" ? updater(prev) : updater))
		},
		[],
	)

	return {
		loading,
		startLoading,
		endLoading,
		data,
		setData,
		rowSelection,
		onRowSelectionChange: handleRowSelectionChange,
		...baseTable,
	}
}
