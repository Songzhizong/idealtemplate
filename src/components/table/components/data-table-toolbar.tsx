import { RefreshCw } from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { DataTableColumnToggle, useTableContext } from "@/components/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface DataTableToolbarProps {
	/**
	 * Search input placeholder
	 */
	filterPlaceholder?: string
	/**
	 * Search value
	 */
	filterValue?: string
	/**
	 * Search change handler
	 */
	onFilterChange?: (value: string) => void
	/**
	 * Refresh handler
	 */
	onRefresh?: () => void | Promise<void>
	/**
	 * Additional action buttons (slot pattern)
	 */
	actions?: ReactNode
	/**
	 * Custom filter components (slot pattern)
	 */
	filters?: ReactNode
	/**
	 * Additional class names
	 */
	className?: string
	/**
	 * Hide column toggle
	 */
	hideColumnToggle?: boolean
}

/**
 * 带有搜索和列可视化开关的表格工具栏组件 使用 TableContext 访问表状态，减少了 prop 钻孔
 *
 * 注意：对于支持扩展/折叠的复杂多字段过滤，请改用 `DataTableFilterBar`
 */
export function DataTableToolbar({
	filterPlaceholder = "Search...",
	filterValue = "",
	onFilterChange,
	onRefresh,
	actions,
	filters,
	className,
	hideColumnToggle = false,
}: DataTableToolbarProps) {
	const { columnChecks, setColumnChecks, resetColumns } = useTableContext()
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

	return (
		<div className={`flex items-center justify-between gap-2 ${className || ""}`}>
			<div className="flex flex-1 items-center gap-2">
				{onFilterChange && (
					<Input
						placeholder={filterPlaceholder}
						value={filterValue}
						onChange={(e) => onFilterChange(e.target.value)}
						className="h-9 w-50 lg:w-75"
					/>
				)}
				{filters}
			</div>
			<div className="flex items-center gap-2">
				{actions}
				{onRefresh && (
					<Button
						variant="outline"
						size="sm"
						className="h-8"
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
		</div>
	)
}
