import {
	type ColumnDef,
	type ColumnOrderState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type RowSelectionState,
	type SortingState,
	type Table as TanStackTable,
	type Updater,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { type ReactNode, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface DataTableProps<TData> {
	/**
	 * External table instance (optional)
	 * If provided, internal table creation is skipped
	 */
	table?: TanStackTable<TData>
	/**
	 * Columns definition (required if table is not provided)
	 */
	columns?: ColumnDef<TData>[]
	/**
	 * Table data (required if table is not provided)
	 */
	data?: TData[]
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
	 * Row selection state (only used if table is not provided)
	 */
	rowSelection?: RowSelectionState
	/**
	 * Row selection change handler (only used if table is not provided)
	 */
	onRowSelectionChange?: (selection: RowSelectionState | Updater<RowSelectionState>) => void
	/**
	 * Enable row selection
	 */
	enableRowSelection: boolean
	/**
	 * Get row ID
	 */
	getRowId?: (row: TData) => string
	/**
	 * Additional class names
	 */
	className?: string
	/**
	 * Max height for scrollable area
	 */
	maxHeight?: string
	/**
	 * Sorting state (only used if table is not provided)
	 */
	sorting?: SortingState
	/**
	 * Sorting change handler (only used if table is not provided)
	 */
	onSortingChange?: (sorting: SortingState | Updater<SortingState>) => void
	/**
	 * Column visibility state (only used if table is not provided)
	 */
	columnVisibility?: VisibilityState
	/**
	 * Column visibility change handler (only used if table is not provided)
	 */
	onColumnVisibilityChange?: (visibility: VisibilityState | Updater<VisibilityState>) => void
	/**
	 * Column order state (only used if table is not provided)
	 */
	columnOrder?: ColumnOrderState
	/**
	 * Column order change handler (only used if table is not provided)
	 */
	onColumnOrderChange?: (order: ColumnOrderState | Updater<ColumnOrderState>) => void
	/**
	 * Custom empty state component
	 */
	emptyState?: ReactNode
	/**
	 * Custom loading state component
	 */
	loadingState?: ReactNode
}

/**
 * Helper function to create selection column
 * Extracted to allow flexibility in column composition
 */
export function createSelectionColumn<TData>(): ColumnDef<TData> {
	return {
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	}
}

export function DataTable<TData>({
	table: externalTable,
	columns: propColumns,
	data: propData,
	loading,
	fetching = false,
	empty,
	emptyText,
	rowSelection: controlledRowSelection,
	onRowSelectionChange,
	enableRowSelection,
	getRowId,
	className,
	maxHeight,
	sorting: controlledSorting,
	onSortingChange,
	columnVisibility: controlledColumnVisibility,
	onColumnVisibilityChange,
	columnOrder: controlledColumnOrder,
	onColumnOrderChange,
	emptyState,
	loadingState,
}: DataTableProps<TData>) {
	const [internalSorting, setInternalSorting] = useState<SortingState>([])
	const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})
	const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})
	const [internalColumnOrder, setInternalColumnOrder] = useState<ColumnOrderState>([])

	const sorting = controlledSorting ?? internalSorting
	const setSorting = onSortingChange ?? setInternalSorting
	const rowSelection = controlledRowSelection ?? internalRowSelection
	const setRowSelection = onRowSelectionChange ?? setInternalRowSelection
	const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility
	const setColumnVisibility = onColumnVisibilityChange ?? setInternalColumnVisibility
	const columnOrder = controlledColumnOrder ?? internalColumnOrder
	const setColumnOrder = onColumnOrderChange ?? setInternalColumnOrder

	const columns = propColumns || []
	const data = propData || []

	// Compose columns with selection column if enabled
	const tableColumns = useMemo<ColumnDef<TData>[]>(() => {
		if (enableRowSelection) {
			return [createSelectionColumn<TData>(), ...columns]
		}
		return columns
	}, [enableRowSelection, columns])

	const internalTable = useReactTable({
		data,
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		onColumnVisibilityChange: setColumnVisibility,
		onColumnOrderChange: setColumnOrder,
		...(getRowId && { getRowId }),
		state: {
			sorting,
			rowSelection,
			columnVisibility,
			columnOrder,
		},
		enableRowSelection,
	})

	const table = externalTable || internalTable
	const totalColumns = table.getAllColumns().length

	// Default loading state
	const defaultLoadingState = (
		<TableRow>
			<TableCell colSpan={totalColumns} className="h-24 text-center">
				<div className="flex items-center justify-center">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<span className="ml-2 text-muted-foreground">Loading...</span>
				</div>
			</TableCell>
		</TableRow>
	)

	// Default empty state
	const defaultEmptyState = (
		<TableRow>
			<TableCell colSpan={totalColumns} className="h-24 text-center text-muted-foreground">
				{emptyText}
			</TableCell>
		</TableRow>
	)

	return (
		<div className={cn("relative flex flex-col flex-1 min-h-0", className)}>
			{fetching && !loading && (
				<div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
					<div className="flex items-center gap-2 rounded-lg bg-card px-4 py-3 shadow-lg border border-border">
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<span className="text-sm text-foreground">刷新中...</span>
					</div>
				</div>
			)}
			{/* Fixed Header */}
			<div className="shrink-0 overflow-hidden rounded-t-lg">
				<Table className="table-fixed">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const canSort = header.column.getCanSort()
									const isSorted = header.column.getIsSorted()
									const width = header.getSize()
									const align = (
										header.column.columnDef.meta as { align?: "left" | "center" | "right" }
									)?.align

									return (
										<TableHead
											key={header.id}
											style={{ width: `${width}px` }}
											className={cn(
												align === "center" && "text-center",
												align === "right" && "text-right",
											)}
										>
											{header.isPlaceholder ? null : canSort ? (
												<Button
													variant="ghost"
													size="sm"
													className="-ml-3 h-8 data-[state=open]:bg-accent"
													onClick={() => header.column.toggleSorting()}
												>
													{flexRender(header.column.columnDef.header, header.getContext())}
													{isSorted === "desc" ? (
														<ArrowDown className="ml-2 h-4 w-4" />
													) : isSorted === "asc" ? (
														<ArrowUp className="ml-2 h-4 w-4" />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</Button>
											) : (
												flexRender(header.column.columnDef.header, header.getContext())
											)}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
				</Table>
			</div>
			{/* Scrollable Body */}
			<div className="flex-1 overflow-auto min-h-0">
				<Table className="table-fixed">
					<TableBody>
						{loading
							? loadingState || defaultLoadingState
							: empty || table.getRowModel().rows?.length === 0
								? emptyState || defaultEmptyState
								: table.getRowModel().rows.map((row) => (
										<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
											{row.getVisibleCells().map((cell) => {
												const width = cell.column.getSize()
												const align = (
													cell.column.columnDef.meta as {
														align?: "left" | "center" | "right"
													}
												)?.align
												return (
													<TableCell
														key={cell.id}
														style={{ width: `${width}px` }}
														className={cn(
															align === "center" && "text-center",
															align === "right" && "text-right",
														)}
													>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												)
											})}
										</TableRow>
									))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
