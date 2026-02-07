import { flexRender, type Row } from "@tanstack/react-table"
import { AlertCircle, X } from "lucide-react"
import type { ReactElement, ReactNode } from "react"
import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { type DataTableI18nOverrides, mergeDataTableI18n, useDataTableConfig } from "./config"
import { useDataTableInstance, useDataTableLayout } from "./context"
import { DataTableDragSortBody } from "./table/drag-sort-body"
import {
  getAnalyticsMeta,
  getDensity,
  getDragSortMeta,
  getErrorMessage,
  getMetaAlign,
  getMetaClass,
  getTreeAllowNesting,
  getTreeIndentSize,
  getVirtualizationMeta,
} from "./table/helpers"
import { useHorizontalScrollSync } from "./table/use-horizontal-scroll-sync"
import { useTableBodyRows } from "./table/use-table-body"

export interface DataTableTableProps<TData> {
  className?: string
  renderEmpty?: () => ReactNode
  renderError?: (error: unknown, retry?: () => void | Promise<void>) => ReactNode
  renderSubComponent?: (row: Row<TData>) => ReactNode
  i18n?: DataTableI18nOverrides
}

const SKELETON_ROW_KEYS = ["dt-skeleton-1", "dt-skeleton-2", "dt-skeleton-3"]

export function DataTableTable<TData>({
  className,
  renderEmpty,
  renderError,
  renderSubComponent,
  i18n: i18nOverrides,
}: DataTableTableProps<TData>) {
  const dt = useDataTableInstance<TData, unknown>()
  const layout = useDataTableLayout()
  const { i18n: globalI18n } = useDataTableConfig()
  const scrollContainer = layout?.scrollContainer ?? "window"
  const stickyHeader = layout?.stickyHeader ?? false
  const isStickyHeader = stickyHeader === true || typeof stickyHeader === "object"
  const i18n = useMemo(() => {
    return mergeDataTableI18n(globalI18n, i18nOverrides)
  }, [globalI18n, i18nOverrides])

  const tableMeta = dt.table.options.meta
  const density = getDensity(tableMeta)
  const cellDensityClass = density === "comfortable" ? "py-4" : "py-2"
  const treeIndentSize = getTreeIndentSize(tableMeta)
  const treeAllowNesting = getTreeAllowNesting(tableMeta)
  const useRootSplitHeaderBody = scrollContainer === "root" && isStickyHeader
  const useWindowSplitHeaderBody = scrollContainer === "window" && isStickyHeader
  const useSplitHeaderBody = useRootSplitHeaderBody || useWindowSplitHeaderBody

  const wrapperRef = useRef<HTMLDivElement>(null)
  const splitHeaderScrollRef = useRef<HTMLDivElement>(null)
  const splitBodyViewportRef = useRef<HTMLDivElement>(null)
  const syncRafRef = useRef<number | null>(null)
  const syncingTargetRef = useRef<"header" | "body" | null>(null)
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false })

  const leftPinned = dt.table.getLeftLeafColumns()
  const rightPinned = dt.table.getRightLeafColumns()
  const lastLeftPinnedId = leftPinned[leftPinned.length - 1]?.id
  const firstRightPinnedId = rightPinned[0]?.id

  const rowModel = dt.table.getRowModel()
  const columnCount = dt.table.getVisibleLeafColumns().length
  const colSpan = Math.max(1, columnCount)
  const isInitialLoading = dt.activity.isInitialLoading || !dt.activity.preferencesReady
  const isFetching = dt.activity.isFetching

  useHorizontalScrollSync({
    useSplitHeaderBody,
    useRootSplitHeaderBody,
    useWindowSplitHeaderBody,
    wrapperRef,
    splitHeaderScrollRef,
    splitBodyViewportRef,
    syncRafRef,
    syncingTargetRef,
    setScrollEdges,
  })

  const headerClassName = cn("[&_tr]:border-border/50")

  const rowClassName = "border-border/50"
  const dragSortEnabled = dt.dragSort.enabled
  const dragSortMeta = useMemo(() => getDragSortMeta(tableMeta), [tableMeta])
  const allowNestingEnabled = dragSortMeta.allowNesting && dt.tree.enabled && treeAllowNesting
  const virtualizationMeta = useMemo(() => getVirtualizationMeta(tableMeta), [tableMeta])
  const analyticsMeta = useMemo(() => getAnalyticsMeta<TData>(tableMeta), [tableMeta])

  const canVirtualize =
    virtualizationMeta.enabled &&
    scrollContainer === "root" &&
    !dragSortEnabled &&
    !renderSubComponent &&
    !dt.tree.enabled &&
    !analyticsMeta.groupBy

  const renderCells = (row: Row<TData>) => {
    return row.getVisibleCells().map((cell) => {
      const pinned = cell.column.getIsPinned()
      const isPinned = pinned === "left" || pinned === "right"
      const isBoundaryLeft = scrollEdges.left && cell.column.id === lastLeftPinnedId
      const isBoundaryRight = scrollEdges.right && cell.column.id === firstRightPinnedId
      const cellMetaClass = getMetaClass(cell.column.columnDef.meta, "cellClassName")
      const cellAlign = getMetaAlign(cell.column.columnDef.meta, "cell")
      return (
        <TableCell
          key={cell.id}
          style={{
            width: `${cell.column.getSize()}px`,
            minWidth: `${cell.column.getSize()}px`,
            ...(isPinned
              ? pinned === "left"
                ? { position: "sticky", left: `${cell.column.getStart("left")}px` }
                : { position: "sticky", right: `${cell.column.getAfter("right")}px` }
              : {}),
            zIndex: isPinned ? 10 : undefined,
          }}
          className={cn(
            cellDensityClass,
            isPinned && "bg-card",
            isBoundaryLeft &&
              "relative after:absolute after:inset-y-0 after:right-0 after:w-2 after:translate-x-full after:bg-linear-to-r after:from-border/50 after:to-transparent after:pointer-events-none",
            isBoundaryRight &&
              "relative before:absolute before:inset-y-0 before:left-0 before:w-2 before:-translate-x-full before:bg-linear-to-l before:from-border/50 before:to-transparent before:pointer-events-none",
            cellAlign === "center" && "text-center",
            cellAlign === "right" && "text-right",
            cellMetaClass,
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      )
    })
  }

  const renderExpandedRow = (row: Row<TData>): ReactElement | null => {
    if (!renderSubComponent || !row.getIsExpanded()) return null
    return (
      <TableRow key={`${row.id}__expanded`} className={rowClassName}>
        <TableCell colSpan={colSpan} className={cn("bg-muted/30", cellDensityClass)}>
          {renderSubComponent(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderDataRow = (row: Row<TData>) => {
    const baseRow = (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className={cn(rowClassName, "hover:bg-table-row-hover data-[state=selected]:bg-muted/70")}
      >
        {renderCells(row)}
      </TableRow>
    )
    const expandedRow = renderExpandedRow(row)
    return expandedRow ? [baseRow, expandedRow] : [baseRow]
  }

  const regularRows = rowModel.rows.flatMap((row) => renderDataRow(row as Row<TData>))
  const { groupedRows, virtualizedRows, summaryCells } = useTableBodyRows<TData>({
    rows: rowModel.rows as Array<Row<TData>>,
    colSpan,
    rowClassName,
    cellDensityClass,
    canVirtualize,
    wrapperRef: useRootSplitHeaderBody ? splitBodyViewportRef : wrapperRef,
    virtualizationMeta,
    analyticsMeta,
    renderDataRow,
    visibleLeafColumns: dt.table.getVisibleLeafColumns(),
  })

  const dragSortRows = (
    <DataTableDragSortBody<TData>
      dt={dt}
      rows={rowModel.rows as Array<Row<TData>>}
      rowsById={rowModel.rowsById as Record<string, Row<TData>>}
      rowClassName={rowClassName}
      cellDensityClass={cellDensityClass}
      colSpan={colSpan}
      treeIndentSize={treeIndentSize}
      allowNestingEnabled={allowNestingEnabled}
      dragSortMeta={dragSortMeta}
      renderCells={(row) => renderCells(row)}
      renderExpandedRow={renderExpandedRow}
    />
  )

  const isStickyHeaderInTable = isStickyHeader && !useSplitHeaderBody

  const headerRows = dt.table.getHeaderGroups().map((headerGroup) => (
    <TableRow key={headerGroup.id} className={rowClassName}>
      {headerGroup.headers.map((header) => {
        const headerMetaClass = getMetaClass(header.column.columnDef.meta, "headerClassName")
        const headerAlign = getMetaAlign(header.column.columnDef.meta, "header")
        const pinned = header.column.getIsPinned()
        const isPinned = pinned === "left" || pinned === "right"
        return (
          <TableHead
            key={header.id}
            style={{
              width: `${header.getSize()}px`,
              minWidth: `${header.getSize()}px`,
              ...(isStickyHeaderInTable || isPinned
                ? {
                    position: "sticky",
                    ...(isStickyHeaderInTable
                      ? {
                          top: "var(--dt-sticky-top,0px)",
                        }
                      : {}),
                    ...(isPinned
                      ? pinned === "left"
                        ? {
                            left: `${header.column.getStart("left")}px`,
                          }
                        : {
                            right: `${header.column.getAfter("right")}px`,
                          }
                      : {}),
                  }
                : {}),
              zIndex: isStickyHeaderInTable ? (isPinned ? 30 : 15) : isPinned ? 20 : undefined,
            }}
            className={cn(
              "relative",
              (isStickyHeaderInTable || isPinned || useSplitHeaderBody) && "bg-table-header",
              scrollEdges.left &&
                header.column.id === lastLeftPinnedId &&
                "after:absolute after:inset-y-0 after:right-0 after:w-2 after:translate-x-full after:bg-linear-to-r after:from-border/50 after:to-transparent after:pointer-events-none",
              scrollEdges.right &&
                header.column.id === firstRightPinnedId &&
                "before:absolute before:inset-y-0 before:left-0 before:w-2 before:-translate-x-full before:bg-linear-to-l before:from-border/50 before:to-transparent before:pointer-events-none",
              headerAlign === "center" && "text-center",
              headerAlign === "right" && "text-right",
              headerMetaClass,
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "min-w-0 flex-1",
                  headerAlign === "center" && "flex justify-center",
                  headerAlign === "right" && "flex justify-end",
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
              {header.column.getCanResize() && (
                <button
                  type="button"
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  aria-label={i18n.columnResizeHandleLabel}
                  className={cn(
                    "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none border-0 bg-transparent p-0",
                    header.column.getIsResizing() && "bg-primary",
                  )}
                />
              )}
            </div>
          </TableHead>
        )
      })}
    </TableRow>
  ))

  const tableBodyContent =
    dt.status.type === "error"
      ? (() => {
          const customError = renderError?.(dt.status.error, dt.actions.retry)
          return (
            <TableRow className={rowClassName}>
              <TableCell colSpan={colSpan} className="h-24 text-center">
                {customError ?? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>{i18n.errorText}</span>
                    <Button variant="outline" size="sm" onClick={() => dt.actions.retry()}>
                      {i18n.retryText}
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          )
        })()
      : !isInitialLoading && dt.status.type === "empty"
        ? (() => {
            const customEmpty = renderEmpty?.()
            return (
              <TableRow className={rowClassName}>
                <TableCell colSpan={colSpan} className="h-24 text-center text-muted-foreground">
                  {customEmpty ?? i18n.emptyText}
                </TableCell>
              </TableRow>
            )
          })()
        : isInitialLoading
          ? SKELETON_ROW_KEYS.map((key) => (
              <TableRow key={key} className={rowClassName}>
                <TableCell colSpan={colSpan} className={cn("py-4", cellDensityClass)}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ))
          : dragSortEnabled
            ? dragSortRows
            : canVirtualize
              ? virtualizedRows
              : (groupedRows ?? regularRows)

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-col",
        scrollContainer === "root" && "flex-1",
        className,
      )}
    >
      {isFetching && !isInitialLoading && (
        <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground shadow-sm">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>{i18n.refreshingText}</span>
        </div>
      )}
      {dragSortEnabled && dragSortMeta.error ? (
        <div className="absolute right-3 top-3 z-20 flex max-w-90 items-start gap-2 rounded-md border border-destructive/40 bg-background px-2 py-1.5 text-xs text-destructive shadow-sm">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">
            {getErrorMessage(dragSortMeta.error, i18n.dragSort.errorText)}
          </span>
          {dragSortMeta.clearError ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-5 w-5 shrink-0"
              onClick={dragSortMeta.clearError}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      ) : null}
      {useRootSplitHeaderBody ? (
        <>
          <div className="w-full shrink-0 overflow-hidden">
            <div
              ref={splitHeaderScrollRef}
              className="scrollbar-none overflow-x-auto overflow-y-hidden"
            >
              <table data-slot="table" className="w-full caption-bottom text-sm table-fixed">
                <TableHeader className={headerClassName}>{headerRows}</TableHeader>
              </table>
            </div>
          </div>

          <ScrollArea
            className="min-h-0 w-full flex-1"
            viewportRef={splitBodyViewportRef}
            viewportClassName="min-h-0 h-full w-full"
            scrollbars="both"
          >
            <table data-slot="table" className="w-full caption-bottom text-sm table-fixed">
              <TableBody>{tableBodyContent}</TableBody>
              {summaryCells ? (
                <TableFooter>
                  <TableRow className={rowClassName}>
                    {summaryCells.map((value, index) => (
                      <TableCell key={`__summary__${String(index)}`} className={cellDensityClass}>
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableFooter>
              ) : null}
            </table>
          </ScrollArea>
        </>
      ) : useWindowSplitHeaderBody ? (
        <>
          <div
            className="sticky z-15 w-full shrink-0 overflow-hidden border-b border-border/50 bg-table-header"
            style={{ top: "var(--dt-sticky-top,0px)" }}
          >
            <div
              ref={splitHeaderScrollRef}
              className="scrollbar-none overflow-x-hidden overflow-y-hidden"
            >
              <table data-slot="table" className="w-full caption-bottom text-sm table-fixed">
                <TableHeader className={headerClassName}>{headerRows}</TableHeader>
              </table>
            </div>
          </div>

          <div ref={wrapperRef} className="min-h-0 w-full">
            <Table className="table-fixed">
              <TableBody>{tableBodyContent}</TableBody>
              {summaryCells ? (
                <TableFooter>
                  <TableRow className={rowClassName}>
                    {summaryCells.map((value, index) => (
                      <TableCell key={`__summary__${String(index)}`} className={cellDensityClass}>
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableFooter>
              ) : null}
            </Table>
          </div>
        </>
      ) : (
        <div
          ref={wrapperRef}
          className={cn("min-h-0 w-full", scrollContainer === "root" && "flex-1 overflow-y-auto")}
        >
          <Table className="table-fixed">
            <TableHeader className={headerClassName}>{headerRows}</TableHeader>
            <TableBody>{tableBodyContent}</TableBody>
            {summaryCells ? (
              <TableFooter>
                <TableRow className={rowClassName}>
                  {summaryCells.map((value, index) => (
                    <TableCell key={`__summary__${String(index)}`} className={cellDensityClass}>
                      {value}
                    </TableCell>
                  ))}
                </TableRow>
              </TableFooter>
            ) : null}
          </Table>
        </div>
      )}
    </div>
  )
}
