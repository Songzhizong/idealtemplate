import {
	type ColumnDef,
	type ColumnOrderState,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type RowSelectionState,
	type SortingState,
	type Table as TanStackTable,
	type Updater,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import type React from "react"
import { type ReactNode, useRef, useState } from "react"
import type { PaginationState } from "@/components/table"
import { Button } from "@/components/ui/button"
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
	fetching?: boolean | undefined
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
	 * Get row ID
	 */
	getRowId?: (row: TData) => string
	/**
	 * Additional class names
	 */
	className?: string | undefined
	/**
	 * Optional max height for internal scroll area (enables body scrolling)
	 */
	maxHeight?: string | undefined
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
	 * Pagination state (optional, for client-side pagination or controlled state)
	 */
	pagination?: PaginationState
	/**
	 * Custom empty state component
	 */
	emptyState?: ReactNode | undefined
	/**
	 * Custom loading state component
	 */
	loadingState?: ReactNode | undefined
}

export interface DataTableContentProps<TData> {
	table: TanStackTable<TData>
	loading: boolean
	fetching?: boolean | undefined
	empty: boolean
	emptyText: string
	className?: string | undefined
	maxHeight?: string | undefined
	emptyState?: ReactNode | undefined
	loadingState?: ReactNode | undefined
}

export function DataTableContent<TData>({
	table,
	loading,
	fetching = false,
	empty,
	emptyText,
	className,
	maxHeight,
	emptyState,
	loadingState,
}: DataTableContentProps<TData>) {
	const totalColumns = table.getAllColumns().length
	const headerRef = useRef<HTMLDivElement>(null)
	const bodyRef = useRef<HTMLDivElement>(null)
	const tableBodyWrapperClassName = cn(
		"flex-1 min-h-0 w-full overflow-x-auto",
		maxHeight && "overflow-y-auto",
	)

	const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
		if (headerRef.current) {
			headerRef.current.scrollLeft = e.currentTarget.scrollLeft
		}
	}

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
		<div className={cn("relative flex w-full flex-1 min-h-0 flex-col", className)}>
			{fetching && !loading && (
				<div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
					<div className="flex items-center gap-2 rounded-lg bg-card px-4 py-3 shadow-lg border border-border">
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<span className="text-sm text-foreground">刷新中...</span>
					</div>
				</div>
			)}

			<div
				ref={headerRef}
				className="sticky top-(--data-table-sticky-offset,0px) z-10 overflow-hidden border-b border-table-border bg-table-header"
			>
				<Table className="table-fixed">
					<TableHeader className="bg-transparent border-none shadow-none [&_tr]:border-b-0">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
								{headerGroup.headers.map((header) => {
									const canSort = header.column.getCanSort()
									const isSorted = header.column.getIsSorted()
									const size = header.getSize()
									const align = (
										header.column.columnDef.meta as { align?: "left" | "center" | "right" }
									)?.align

									return (
										<TableHead
											key={header.id}
											style={{
												width: `${size}px`,
												minWidth: `${size}px`,
											}}
											className={cn(
												align === "center" && "text-center",
												align === "right" && "text-right",
											)}
										>
											{header.isPlaceholder ? null : canSort ? (
												<Button
													variant="ghost"
													size="sm"
													className="px-0 h-8 data-[state=open]:bg-accent"
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

			<div
				ref={bodyRef}
				onScroll={handleBodyScroll}
				className={tableBodyWrapperClassName}
				style={maxHeight ? { maxHeight } : undefined}
			>
				<Table className="table-fixed">
					<TableBody>
						{loading
							? loadingState || defaultLoadingState
							: empty || table.getRowModel().rows?.length === 0
								? emptyState || defaultEmptyState
								: table.getRowModel().rows.map((row) => (
										<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
											{row.getVisibleCells().map((cell) => {
												const size = cell.column.getSize()
												const align = (
													cell.column.columnDef.meta as {
														align?: "left" | "center" | "right"
													}
												)?.align
												return (
													<TableCell
														key={cell.id}
														style={{
															width: `${size}px`,
															minWidth: `${size}px`,
														}}
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

function InternalDataTable<TData>({
	columns: propColumns,
	data: propData,
	loading,
	fetching,
	empty,
	emptyText,
	className,
	maxHeight,
	emptyState,
	loadingState,
	rowSelection: controlledRowSelection,
	onRowSelectionChange,
	getRowId,
	sorting: controlledSorting,
	onSortingChange,
	columnVisibility: controlledColumnVisibility,
	onColumnVisibilityChange,
	columnOrder: controlledColumnOrder,
	onColumnOrderChange,
	pagination: controlledPagination,
}: DataTableProps<TData>) {
	const [internalSorting, setInternalSorting] = useState<SortingState>([])
	const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({})
	const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>({})
	const [internalColumnOrder, setInternalColumnOrder] = useState<ColumnOrderState>([])

	const sorting = controlledSorting ?? internalSorting
	const handleSortingChange = (updater: Updater<SortingState>) => {
		onSortingChange?.(updater)
		if (!controlledSorting) {
			setInternalSorting(updater)
		}
	}

	const rowSelection = controlledRowSelection ?? internalRowSelection
	const handleRowSelectionChange = (updater: Updater<RowSelectionState>) => {
		onRowSelectionChange?.(updater)
		if (!controlledRowSelection) {
			setInternalRowSelection(updater)
		}
	}

	const columnVisibility = controlledColumnVisibility ?? internalColumnVisibility
	const handleColumnVisibilityChange = (updater: Updater<VisibilityState>) => {
		onColumnVisibilityChange?.(updater)
		if (!controlledColumnVisibility) {
			setInternalColumnVisibility(updater)
		}
	}

	const columnOrder = controlledColumnOrder ?? internalColumnOrder
	const handleColumnOrderChange = (updater: Updater<ColumnOrderState>) => {
		onColumnOrderChange?.(updater)
		if (!controlledColumnOrder) {
			setInternalColumnOrder(updater)
		}
	}

	const columns = propColumns || []
	const data = propData || []

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: handleSortingChange,
		onRowSelectionChange: handleRowSelectionChange,
		onColumnVisibilityChange: handleColumnVisibilityChange,
		onColumnOrderChange: handleColumnOrderChange,
		...(getRowId && { getRowId }),
		state: {
			sorting,
			rowSelection,
			columnVisibility,
			columnOrder,
			...(controlledPagination
				? {
						pagination: {
							pageIndex: controlledPagination.pageNumber - 1,
							pageSize: controlledPagination.pageSize,
						},
					}
				: {}),
		},
		enableRowSelection: true,
	})

	return (
		<DataTableContent
			table={table}
			loading={loading}
			fetching={fetching}
			empty={empty}
			emptyText={emptyText}
			className={className}
			maxHeight={maxHeight}
			emptyState={emptyState}
			loadingState={loadingState}
		/>
	)
}

export function DataTable<TData>({ table, ...props }: DataTableProps<TData>) {
	const { loading, fetching, empty, emptyText, className, maxHeight, emptyState, loadingState } =
		props
	if (table) {
		return (
			<DataTableContent
				table={table}
				loading={loading}
				fetching={fetching}
				empty={empty}
				emptyText={emptyText}
				className={className}
				maxHeight={maxHeight}
				emptyState={emptyState}
				loadingState={loadingState}
			/>
		)
	}

	return <InternalDataTable {...props} />
}
