import React, { type ReactNode, useLayoutEffect, useRef, useState } from "react"
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
	 * If not provided, it will try to fill the available space (flex-1)
	 */
	height?: string
	/**
	 * Additional class names
	 */
	className?: string
}

/**
 * Container component that supports page scroll with sticky header/pagination.
 * Use DataTable `maxHeight` when you need an internal scroll area.
 */
export function DataTableContainer({
	toolbar,
	table,
	pagination,
	height,
	className,
}: DataTableContainerProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const toolbarRef = useRef<HTMLDivElement>(null)
	const [toolbarHeight, setToolbarHeight] = useState(0)

	useLayoutEffect(() => {
		if (toolbarRef.current) {
			const updateHeight = () => {
				if (toolbarRef.current) {
					// getBoundingClientRect ensures we get the precise visual height including borders and padding
					setToolbarHeight(toolbarRef.current.getBoundingClientRect().height)
				}
			}

			// Measure immediately
			updateHeight()

			const resizeObserver = new ResizeObserver(() => {
				updateHeight()
			})

			resizeObserver.observe(toolbarRef.current)
			return () => resizeObserver.disconnect()
		}
	}, [])

	return (
		<div
			ref={containerRef}
			className={cn("flex flex-col", !height && "min-h-0 flex-1", className)}
			style={
				{
					"--data-table-sticky-offset": `${toolbarHeight}px`,
				} as React.CSSProperties
			}
		>
			<div
				className={cn(
					"flex flex-col rounded-lg border border-table-border bg-card",
					// Only use overflow-hidden when we have a fixed height (internal scroll)
					// Otherwise, let the sticky elements stick to the viewport
					height ? "overflow-hidden" : "min-h-0 flex-1",
				)}
				style={height ? { height } : undefined}
			>
				{toolbar && (
					<div
						ref={toolbarRef}
						className={cn(
							"shrink-0 p-4 bg-card z-20",
							// When no height (window scroll), toolbar sticks to top
							!height && "sticky top-0 rounded-t-lg border-b border-table-border",
						)}
					>
						{toolbar}
					</div>
				)}
				{table}
				{pagination && (
					<div
						className={cn(
							"sticky bottom-0 z-10 shrink-0 border-t border-table-border bg-card p-4",
							!height && "rounded-b-lg",
						)}
					>
						{pagination}
					</div>
				)}
			</div>
		</div>
	)
}
