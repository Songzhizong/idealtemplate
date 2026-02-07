import { type CSSProperties, type ReactNode, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { DataTableInstance } from "../core"
import { type DataTableLayoutOptions, DataTableProvider } from "./context"

export interface DataTableRootProps<TData, TFilterSchema> {
  dt: DataTableInstance<TData, TFilterSchema>
  height?: string
  className?: string
  layout?: DataTableLayoutOptions
  children: ReactNode
}

function resolveOffset(
  value: boolean | { topOffset?: number } | { bottomOffset?: number } | undefined,
): number | undefined {
  if (!value || value === true) return undefined
  if ("topOffset" in value) return value.topOffset
  if ("bottomOffset" in value) return value.bottomOffset
  return undefined
}

export function DataTableRoot<TData, TFilterSchema>({
  dt,
  height,
  className,
  layout,
  children,
}: DataTableRootProps<TData, TFilterSchema>) {
  const scrollContainer = layout?.scrollContainer ?? "window"
  const topOffset = resolveOffset(layout?.stickyHeader)
  const bottomOffset = resolveOffset(layout?.stickyPagination)

  const style = useMemo(() => {
    const next: CSSProperties & Record<string, string> = {}
    if (height) {
      next.height = height
    }
    if (topOffset != null) {
      next["--dt-sticky-top"] = `${topOffset}px`
    }
    if (bottomOffset != null) {
      next["--dt-sticky-bottom"] = `${bottomOffset}px`
    }
    return next
  }, [height, topOffset, bottomOffset])

  return (
    <DataTableProvider dt={dt} {...(layout ? { layout } : {})}>
      <div
        className={cn(
          "flex min-h-0 flex-col overflow-clip",
          " [&>*:first-child]:rounded-t-[inherit] [&>*:last-child]:rounded-b-[inherit]",
          scrollContainer === "root" && "h-full",
          className,
        )}
        style={style}
      >
        {children}
      </div>
    </DataTableProvider>
  )
}
