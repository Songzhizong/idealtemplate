import type { ColumnDef, VisibilityState } from "@tanstack/react-table"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useBoolean } from "@/hooks/use-boolean"

export interface TableColumnCheck {
	key: string
	title: string
	checked: boolean
}

/**
 * Extended column meta for additional features
 */
export interface TableColumnMeta {
	/**
	 * Display label for column toggle
	 */
	label?: string
	/**
	 * Hide column from visibility settings
	 */
	hideInSetting?: boolean
	/**
	 * Fixed column position
	 */
	fixed?: "left" | "right"
	/**
	 * Column width
	 */
	width?: number | string
}

export interface UseBaseTableOptions<TData> {
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
}

interface TableSettings {
	columnChecks: TableColumnCheck[]
	columnOrder: string[]
}

/**
 * Get default column checks from columns definition
 */
function getDefaultColumnChecks<TData>(
	columns: ColumnDef<TData>[],
	getColumnChecks?: (columns: ColumnDef<TData>[]) => TableColumnCheck[],
): TableColumnCheck[] {
	if (getColumnChecks) {
		return getColumnChecks(columns)
	}
	return columns
		.filter((col) => {
			const meta = col.meta as TableColumnMeta | undefined
			return (
				!meta?.hideInSetting &&
				("accessorKey" in col || "id" in col) &&
				col.id !== "select" &&
				col.id !== "actions"
			)
		})
		.map((col) => {
			const meta = col.meta as TableColumnMeta | undefined
			return {
				key: ("id" in col ? col.id : "accessorKey" in col ? String(col.accessorKey) : "") as string,
				title: meta?.label || ("header" in col ? String(col.header) : ""),
				checked: true,
			}
		})
}

/**
 * Load table settings from localStorage
 */
function loadTableSettings(tableId: string): TableSettings | null {
	try {
		const stored = localStorage.getItem(`table-settings-${tableId}`)
		if (!stored) return null
		const parsed = JSON.parse(stored) as unknown
		// Type guard to ensure parsed data matches TableSettings
		if (
			parsed &&
			typeof parsed === "object" &&
			"columnChecks" in parsed &&
			"columnOrder" in parsed &&
			Array.isArray(parsed.columnChecks) &&
			Array.isArray(parsed.columnOrder)
		) {
			return parsed as TableSettings
		}
		return null
	} catch {
		return null
	}
}

/**
 * Save table settings to localStorage
 */
function saveTableSettings(tableId: string, settings: TableSettings): void {
	try {
		localStorage.setItem(`table-settings-${tableId}`, JSON.stringify(settings))
	} catch {
		// Ignore storage errors
	}
}

/**
 * Base table hook with shared logic for column visibility and empty state
 * Uses TanStack Table's columnVisibility state instead of filtering columns
 * Supports column reordering and persistent storage
 */
export function useBaseTable<TData>(options: UseBaseTableOptions<TData>) {
	const { columns: baseColumns, getColumnChecks, tableId } = options

	const { value: empty, setValue: setEmpty } = useBoolean(false)

	// Get default column checks
	const defaultColumnChecks = useMemo(
		() => getDefaultColumnChecks(baseColumns, getColumnChecks),
		[baseColumns, getColumnChecks],
	)

	// Initialize column checks with stored settings or defaults
	const [columnChecks, setColumnChecks] = useState<TableColumnCheck[]>(() => {
		if (!tableId) return defaultColumnChecks

		const stored = loadTableSettings(tableId)
		if (!stored) return defaultColumnChecks

		// Merge stored settings with current columns (handle schema changes)
		const storedMap = new Map(stored.columnChecks.map((col) => [col.key, col]))
		const merged = defaultColumnChecks.map((col) => {
			const storedCol = storedMap.get(col.key)
			return storedCol ? { ...col, checked: storedCol.checked } : col
		})

		// Apply stored order
		if (stored.columnOrder) {
			const orderMap = new Map(stored.columnOrder.map((key, index) => [key, index]))
			merged.sort((a, b) => {
				const orderA = orderMap.get(a.key) ?? Number.POSITIVE_INFINITY
				const orderB = orderMap.get(b.key) ?? Number.POSITIVE_INFINITY
				return orderA - orderB
			})
		}

		return merged
	})

	// Save settings when columnChecks change
	useEffect(() => {
		if (!tableId) return

		const settings: TableSettings = {
			columnChecks,
			columnOrder: columnChecks.map((col) => col.key),
		}
		saveTableSettings(tableId, settings)
	}, [columnChecks, tableId])

	// Convert columnChecks to TanStack Table's VisibilityState format
	const columnVisibility = useMemo<VisibilityState>(() => {
		return columnChecks.reduce((acc, check) => {
			acc[check.key] = check.checked
			return acc
		}, {} as VisibilityState)
	}, [columnChecks])

	// Convert columnChecks order to TanStack Table's columnOrder format
	const columnOrder = useMemo<string[]>(() => {
		return columnChecks.map((col) => col.key)
	}, [columnChecks])

	// Reset to default settings
	const resetColumns = useCallback(() => {
		setColumnChecks(defaultColumnChecks)
		if (tableId) {
			localStorage.removeItem(`table-settings-${tableId}`)
		}
	}, [defaultColumnChecks, tableId])

	const reloadColumns = useCallback(() => {
		if (getColumnChecks) {
			const checkMap = new Map(columnChecks.map((col) => [col.key, col.checked]))
			const defaultChecks = getColumnChecks(baseColumns)
			setColumnChecks(
				defaultChecks.map((col) => ({
					...col,
					checked: checkMap.get(col.key) ?? col.checked,
				})),
			)
		}
	}, [baseColumns, columnChecks, getColumnChecks])

	return useMemo(
		() => ({
			empty,
			setEmpty,
			columns: baseColumns,
			columnVisibility,
			columnOrder,
			columnChecks,
			setColumnChecks,
			reloadColumns,
			resetColumns,
		}),
		[
			empty,
			setEmpty,
			baseColumns,
			columnVisibility,
			columnOrder,
			columnChecks,
			reloadColumns,
			resetColumns,
		],
	)
}
