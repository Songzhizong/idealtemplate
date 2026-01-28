import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface DataTableContainerProps {
	/**
	 * Toolbar content (filters, search, actions)
	 */
	toolbar?: ReactNode
	/**
	 * Table content
	 */
	table: ReactNode
	/**
	 * Pagination content
	 */
	pagination?: ReactNode
	/**
	 * Container height (e.g., "calc(100vh - 200px)")
	 */
	height: string
	/**
	 * Additional class names
	 */
	className?: string
}

/**
 * Container component that provides fixed header/pagination with scrollable table body
 * Similar to NaiveUI table layout behavior
 */
export function DataTableContainer({
	toolbar,
	table,
	pagination,
	height,
	className,
}: DataTableContainerProps) {
	return (
		<div className={cn("flex flex-col gap-4", className)}>
			{toolbar && <div className="shrink-0">{toolbar}</div>}
			<div
				className="flex flex-col rounded-lg border border-[hsl(var(--table-border))] bg-background overflow-hidden"
				style={{ height }}
			>
				{table}
				{pagination && (
					<div className="shrink-0 border-t border-[hsl(var(--table-border))] bg-[hsl(var(--table-header-bg))] p-4">
						{pagination}
					</div>
				)}
			</div>
		</div>
	)
}
