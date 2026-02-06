import type { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"
import type {
	DataTableColumnDef,
	DataTableDragSort,
	DataTableFeatureRuntime,
	DataTableFeatures,
	DataTableSelection,
	DataTableTree,
	PinningFeatureOptions,
	TableStateSnapshot,
} from "../types"
import { useColumnSizingFeature } from "./column-sizing"
import { useColumnVisibilityFeature } from "./column-visibility"
import { useDensityFeature } from "./density"
import { useDragSortFeature } from "./drag-sort"
import { useExpansionFeature } from "./expansion"
import { usePinningFeature } from "./pinning"
import { useSelectionFeature } from "./selection"
import { useTreeFeature } from "./tree"

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getColumnId<TData>(column: DataTableColumnDef<TData>): string | null {
	if (isRecord(column) && typeof column.id === "string") return column.id
	if (isRecord(column) && typeof column.accessorKey === "string") return column.accessorKey
	return null
}

function getLeafColumnDefs<TData>(
	columns: DataTableColumnDef<TData>[],
): DataTableColumnDef<TData>[] {
	const leaf: DataTableColumnDef<TData>[] = []
	const stack = [...columns]
	while (stack.length > 0) {
		const current = stack.shift()
		if (!current) continue
		if (isRecord(current) && Array.isArray(current.columns)) {
			stack.unshift(...(current.columns as DataTableColumnDef<TData>[]))
			continue
		}
		leaf.push(current)
	}
	return leaf
}

function getColumnMeta(column: ColumnDef<unknown>): Record<string, unknown> | undefined {
	if (!isRecord(column)) return undefined
	return isRecord(column.meta) ? (column.meta as Record<string, unknown>) : undefined
}

function getBooleanMeta(
	meta: Record<string, unknown> | undefined,
	key: string,
): boolean | undefined {
	const value = meta?.[key]
	return typeof value === "boolean" ? value : undefined
}

function getNumberValue(value: unknown): number | undefined {
	return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function mergePinnedColumns(args: {
	feature: PinningFeatureOptions | undefined
	metaPinnedLeft: string[]
	metaPinnedRight: string[]
}): PinningFeatureOptions | undefined {
	if (args.feature?.enabled === false) return args.feature
	const left = Array.from(new Set([...(args.feature?.left ?? []), ...args.metaPinnedLeft]))
	const right = Array.from(new Set([...(args.feature?.right ?? []), ...args.metaPinnedRight]))
	if (args.feature || left.length > 0 || right.length > 0) {
		return {
			...args.feature,
			left,
			right,
		}
	}
	return undefined
}

export function useFeatureRuntimes<TData, TFilterSchema>(args: {
	features: DataTableFeatures<TData, TFilterSchema> | undefined
	columns: DataTableColumnDef<TData>[]
	getRowId: ((row: TData) => string) | undefined
	rows: TData[]
	snapshot: TableStateSnapshot<TFilterSchema>
	total: number | undefined
}): {
	runtimes: Array<DataTableFeatureRuntime<TData, TFilterSchema>>
	selection: DataTableSelection<TData>
	tree: DataTableTree
	dragSort: DataTableDragSort
} {
	const leafColumns = useMemo(() => getLeafColumnDefs(args.columns), [args.columns])

	const hideableColumnIds = useMemo(() => {
		return leafColumns
			.filter((column) => {
				const meta = getColumnMeta(column as ColumnDef<unknown>)
				const metaHideable = getBooleanMeta(meta, "hideable")
				const enableHiding = isRecord(column) ? column.enableHiding : undefined
				if (metaHideable === false) return false
				if (enableHiding === false) return false
				return true
			})
			.map((col) => getColumnId(col))
			.filter((id): id is string => Boolean(id))
	}, [leafColumns])

	const sizingColumns = useMemo(() => {
		return leafColumns
			.map((column) => {
				const id = getColumnId(column)
				if (!id) return null
				const meta = getColumnMeta(column as ColumnDef<unknown>)
				const metaResizable = getBooleanMeta(meta, "resizable")
				const enableResizing = isRecord(column) ? column.enableResizing : undefined
				const resizable = metaResizable !== false && enableResizing !== false
				return {
					id,
					resizable,
					size: getNumberValue(isRecord(column) ? column.size : undefined),
					minSize: getNumberValue(isRecord(column) ? column.minSize : undefined),
					maxSize: getNumberValue(isRecord(column) ? column.maxSize : undefined),
				}
			})
			.filter((item): item is NonNullable<typeof item> => Boolean(item))
	}, [leafColumns])

	const metaPinned = useMemo(() => {
		const left: string[] = []
		const right: string[] = []
		for (const column of leafColumns) {
			const id = getColumnId(column)
			if (!id) continue
			const meta = getColumnMeta(column as ColumnDef<unknown>)
			const pinned = meta?.pinned
			if (pinned === "left") left.push(id)
			if (pinned === "right") right.push(id)
		}
		return { left, right }
	}, [leafColumns])

	const {
		tree,
		runtime: treeRuntime,
		getSubRows,
	} = useTreeFeature<TData, TFilterSchema>({
		feature: args.features?.tree,
		getRowId: args.getRowId,
		rows: args.rows,
	})

	const { selection, runtime: selectionRuntime } = useSelectionFeature<TData, TFilterSchema>({
		feature: args.features?.selection,
		getRowId: args.getRowId,
		getSubRows,
		rows: args.rows,
		snapshot: args.snapshot,
		total: args.total,
	})

	const { runtime: columnVisibilityRuntime } = useColumnVisibilityFeature<TData, TFilterSchema>({
		feature: args.features?.columnVisibility,
		columnIds: hideableColumnIds,
	})

	const { runtime: columnSizingRuntime } = useColumnSizingFeature<TData, TFilterSchema>({
		feature: args.features?.columnSizing,
		columns: sizingColumns,
	})

	const { runtime: pinningRuntime } = usePinningFeature<TData, TFilterSchema>({
		feature: mergePinnedColumns({
			feature: args.features?.pinning,
			metaPinnedLeft: metaPinned.left,
			metaPinnedRight: metaPinned.right,
		}),
	})

	const { runtime: expansionRuntime } = useExpansionFeature<TData, TFilterSchema>({
		feature: args.features?.expansion,
	})

	const { runtime: densityRuntime } = useDensityFeature<TData, TFilterSchema>({
		feature: args.features?.density,
	})

	const { dragSort, runtime: dragSortRuntime } = useDragSortFeature<TData, TFilterSchema>({
		feature: args.features?.dragSort,
		getRowId: args.getRowId,
		getSubRows,
		rows: args.rows,
	})

	const runtimes = useMemo(
		() =>
			[
				selectionRuntime,
				columnVisibilityRuntime,
				columnSizingRuntime,
				pinningRuntime,
				expansionRuntime,
				treeRuntime,
				densityRuntime,
				dragSortRuntime,
			] as Array<DataTableFeatureRuntime<TData, TFilterSchema>>,
		[
			selectionRuntime,
			columnVisibilityRuntime,
			columnSizingRuntime,
			pinningRuntime,
			expansionRuntime,
			treeRuntime,
			densityRuntime,
			dragSortRuntime,
		],
	)

	return {
		runtimes,
		selection,
		tree,
		dragSort,
	}
}
