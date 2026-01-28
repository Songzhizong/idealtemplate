import { useQuery } from "@tanstack/react-query"
import type { ColumnDef, RowSelectionState, Updater } from "@tanstack/react-table"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { PageInfo } from "@/types/pagination"
import { type TableColumnCheck, useBaseTable } from "./use-base-table"

export type { TableColumnCheck } from "./use-base-table"

export interface UseTableQueryOptions<TData, TResponse = PageInfo<TData>> {
	/**
	 * Query key for TanStack Query
	 */
	queryKey: unknown[]
	/**
	 * API function to fetch data
	 */
	queryFn: (params: { pageNumber: number; pageSize: number }) => Promise<TResponse>
	/**
	 * Transform response to table data
	 */
	transform: (response: TResponse) => TData[]
	/**
	 * Columns definition
	 */
	columns: ColumnDef<TData>[]
	/**
	 * Get column checks for visibility control
	 */
	getColumnChecks?: (columns: ColumnDef<TData>[]) => TableColumnCheck[]
	/**
	 * Unique table ID for storing settings
	 */
	tableId?: string
	/**
	 * Initial page number
	 * @default 1
	 */
	initialPage?: number
	/**
	 * Initial page size
	 * @default 10
	 */
	initialPageSize?: number
	/**
	 * Callback when data is fetched
	 */
	onFetched?: (response: TResponse) => void | Promise<void>
}

/**
 * Table hook with TanStack Query integration (non-paginated)
 * Refactored to use useBaseTable for consistent column visibility logic
 */
export function useTableQuery<TData, TResponse = TData[]>(
	options: Omit<UseTableQueryOptions<TData, TResponse>, "transform"> & {
		transform: (response: TResponse) => TData[]
	},
) {
	const {
		queryKey,
		queryFn,
		transform,
		columns: baseColumns,
		getColumnChecks,
		tableId,
		onFetched,
	} = options

	// Use baseTable for shared logic
	const baseTable = useBaseTable({
		columns: baseColumns,
		...(getColumnChecks && { getColumnChecks }),
		...(tableId && { tableId }),
	})

	// Fetch data without pagination params
	const query = useQuery({
		queryKey,
		queryFn: () => queryFn({ pageNumber: 1, pageSize: 999999 }),
	})

	const data = useMemo(() => {
		if (!query.data) return []
		return transform(query.data)
	}, [query.data, transform])

	// Row selection state
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

	const handleRowSelectionChange = useCallback(
		(updater: RowSelectionState | Updater<RowSelectionState>) => {
			setRowSelection((prev) => (typeof updater === "function" ? updater(prev) : updater))
		},
		[],
	)

	useEffect(() => {
		baseTable.setEmpty(data.length === 0)
		if (query.data) {
			onFetched?.(query.data)
		}
	}, [data.length, query.data, onFetched, baseTable])

	return {
		loading: query.isLoading,
		data,
		rowSelection,
		onRowSelectionChange: handleRowSelectionChange,
		refetch: query.refetch,
		isError: query.isError,
		error: query.error,
		...baseTable,
	}
}
