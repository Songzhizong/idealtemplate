import { ChevronDown, ChevronUp, RefreshCw, RotateCcw, Search } from "lucide-react"
import { type ReactNode, useState } from "react"
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
	 * Reset callback
	 */
	onReset?: () => void
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
	onReset,
	onRefresh,
	className,
	defaultExpanded = false,
	hideColumnToggle = false,
}: DataTableFilterBarProps) {
	const { columnChecks, setColumnChecks, resetColumns } = useTableContext()
	const [isExpanded, setIsExpanded] = useState(defaultExpanded)
	const [isRefreshing, setIsRefreshing] = useState(false)

	const handleRefresh = async () => {
		if (!onRefresh || isRefreshing) return
		setIsRefreshing(true)
		try {
			await onRefresh()
		} finally {
			setIsRefreshing(false)
		}
	}

	const handleSearch = async () => {
		if (!onSearch || isRefreshing) return
		setIsRefreshing(true)
		try {
			await onSearch()
		} finally {
			setIsRefreshing(false)
		}
	}

	const handleReset = async () => {
		onReset?.()
		await handleSearch()
	}

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				{/* Query Area (Left) */}
				<div className="flex flex-1 flex-wrap items-center gap-2">
					<div className="flex flex-wrap items-center gap-2">{children}</div>

					<Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />

					{/* Search Actions - Now following query fields */}
					<div className="flex items-center gap-2">
						<Button
							variant="default"
							size="sm"
							onClick={handleSearch}
							className="h-9 px-4"
							disabled={isRefreshing}
						>
							<Search className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
							查询
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleReset}
							className="h-9 px-4"
							disabled={isRefreshing}
						>
							<RotateCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
							重置
						</Button>
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

					{(onRefresh || !hideColumnToggle) && (
						<>
							{(actions || true) && <Separator orientation="vertical" className="mx-1 h-6" />}
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
								{!hideColumnToggle && (
									<DataTableColumnToggle
										columns={columnChecks}
										onColumnsChange={setColumnChecks}
										onReset={resetColumns}
									/>
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
