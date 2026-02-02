import { ChevronDown, ChevronUp, RefreshCw, X } from "lucide-react"
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { DataTableColumnToggle, useTableContext } from "@/components/table"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface DataTableFilterBarProps {
	/**
	 * Main filter content (usually always visible)
	 */
	children?: ReactNode
	/**
	 * Extra filters shown when expanded
	 */
	extraFilters?: ReactNode
	/**
	 * Additional action buttons (like "New", "Export")
	 */
	actions?: ReactNode
	/**
	 * Search callback
	 */
	onSearch?: () => void | Promise<void>
	/**
	 * Trigger search immediately when these values change
	 */
	autoSearchDeps?: readonly unknown[]
	/**
	 * Trigger search with debounce when these values change
	 */
	debouncedSearchDeps?: readonly unknown[]
	/**
	 * Debounce delay for auto search (ms)
	 * @default 500
	 */
	debounceMs?: number
	/**
	 * Reset callback
	 */
	onReset?: () => void
	/**
	 * Whether there are active filters for showing the clear action
	 */
	hasActiveFilters?: boolean
	/**
	 * Clear filters label
	 */
	clearLabel?: string
	/**
	 * Refresh callback
	 */
	onRefresh?: () => void | Promise<void>
	/**
	 * Additional class names
	 */
	className?: string
	/**
	 * Initial expanded state
	 */
	defaultExpanded?: boolean
	/**
	 * Hide column toggle
	 */
	hideColumnToggle?: boolean
}

/**
 * A flexible filter bar for complex search scenarios.
 * Supports a main search area and a collapsible extra filters area.
 */
export function DataTableFilterBar({
	children,
	extraFilters,
	actions,
	onSearch,
	autoSearchDeps,
	debouncedSearchDeps,
	debounceMs = 500,
	onReset,
	hasActiveFilters = false,
	clearLabel = "清除筛选",
	onRefresh,
	className,
	defaultExpanded = false,
	hideColumnToggle = false,
}: DataTableFilterBarProps) {
	const { table } = useTableContext()
	const [isExpanded, setIsExpanded] = useState(defaultExpanded)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const isRefreshingRef = useRef(false)
	const onSearchRef = useRef(onSearch)
	const autoSearchFirstRun = useRef(true)
	const debouncedSearchFirstRun = useRef(true)

	useEffect(() => {
		onSearchRef.current = onSearch
	}, [onSearch])

	const triggerSearch = useCallback(async () => {
		if (!onSearchRef.current || isRefreshingRef.current) return
		isRefreshingRef.current = true
		setIsRefreshing(true)
		try {
			await onSearchRef.current()
		} finally {
			isRefreshingRef.current = false
			setIsRefreshing(false)
		}
	}, [])

	const debouncedSearch = useDebouncedCallback(() => {
		void triggerSearch()
	}, debounceMs)

	const handleRefresh = async () => {
		if (!onRefresh || isRefreshingRef.current) return
		isRefreshingRef.current = true
		setIsRefreshing(true)
		try {
			await onRefresh()
		} finally {
			isRefreshingRef.current = false
			setIsRefreshing(false)
		}
	}

	const autoSearchEnabled = autoSearchDeps !== undefined
	const debouncedSearchEnabled = debouncedSearchDeps !== undefined

	useEffect(() => {
		const depsLength = autoSearchDeps?.length ?? 0
		if (!onSearchRef.current || !autoSearchEnabled || depsLength === 0) return
		if (autoSearchFirstRun.current) {
			autoSearchFirstRun.current = false
			return
		}
		void triggerSearch()
	}, [autoSearchDeps, autoSearchEnabled, triggerSearch])

	useEffect(() => {
		const depsLength = debouncedSearchDeps?.length ?? 0
		if (!onSearchRef.current || !debouncedSearchEnabled || depsLength === 0) return
		if (debouncedSearchFirstRun.current) {
			debouncedSearchFirstRun.current = false
			return
		}
		debouncedSearch()
		return () => {
			debouncedSearch.cancel()
		}
	}, [debouncedSearchDeps, debouncedSearchEnabled, debouncedSearch])

	const hasAutoSearch = (autoSearchDeps?.length ?? 0) > 0 || (debouncedSearchDeps?.length ?? 0) > 0

	const handleReset = async () => {
		onReset?.()
		if (!hasAutoSearch) {
			await triggerSearch()
		}
	}

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				{/* Query Area (Left) */}
				<div className="flex flex-1 flex-wrap items-center gap-2">
					<div className="flex flex-wrap items-center gap-2">{children}</div>

					{/* Search Actions - Now following query fields */}
					<div className="flex items-center gap-2">
						{extraFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsExpanded(!isExpanded)}
								className="h-9 px-2 text-muted-foreground hover:text-foreground"
							>
								{isExpanded ? (
									<>
										收起 <ChevronUp className="ml-1 h-4 w-4" />
									</>
								) : (
									<>
										展开 <ChevronDown className="ml-1 h-4 w-4" />
									</>
								)}
							</Button>
						)}
					</div>
				</div>

				{/* Functional Actions (Right) */}
				<div className="flex items-center gap-2">
					{actions}

					{(onRefresh || !hideColumnToggle || (onReset && hasActiveFilters)) && (
						<>
							<Separator orientation="vertical" className="mx-1 h-6" />
							<div className="flex items-center gap-2">
								{onRefresh && (
									<Button
										variant="outline"
										size="sm"
										className="h-9 w-9 p-0"
										onClick={handleRefresh}
										disabled={isRefreshing}
									>
										<RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
									</Button>
								)}
								{!hideColumnToggle && <DataTableColumnToggle table={table} />}
								{onReset && hasActiveFilters && (
									<Button
										variant="ghost"
										size="sm"
										onClick={handleReset}
										className="h-7 px-2 text-muted-foreground hover:text-foreground"
										disabled={isRefreshing}
									>
										<X className="mr-1 h-3 w-3" />
										{clearLabel}
									</Button>
								)}
							</div>
						</>
					)}
				</div>
			</div>

			{/* Collapsible extra filters */}
			{isExpanded && extraFilters && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-in fade-in slide-in-from-top-2 duration-200">
					{extraFilters}
				</div>
			)}
		</div>
	)
}
