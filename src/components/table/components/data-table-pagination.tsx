import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useTableContext } from "@/components/table"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

export interface DataTablePaginationProps {
	className?: string
	/**
	 * i18n text overrides
	 */
	text?: {
		total?: (count: number) => string
		perPage?: string
		firstPage?: string
		previousPage?: string
		nextPage?: string
		lastPage?: string
	}
}

/**
 * Pagination component that consumes state from TableContext
 * Reduces prop drilling by reading pagination state from context
 * Enhanced with i18n support
 */
export function DataTablePagination({ className, text }: DataTablePaginationProps) {
	const {
		pagination,
		onPageChange,
		onPageSizeChange,
		pageSizeOptions = [10, 20, 50, 100],
		showTotal = true,
	} = useTableContext()

	if (!pagination || !onPageChange || !onPageSizeChange) {
		throw new Error("DataTablePagination requires pagination context")
	}

	const { pageNumber, pageSize, totalElements, totalPages } = pagination

	const canPreviousPage = pageNumber > 1
	const canNextPage = pageNumber < totalPages

	// Default i18n text (Chinese)
	const defaultText = {
		total: (count: number) => `共 ${count} 条`,
		perPage: "条/页",
		firstPage: "第一页",
		previousPage: "最后页",
		nextPage: "下一页",
		lastPage: "上一页",
	}

	const i18n = { ...defaultText, ...text }

	return (
		<div className={`flex items-center justify-between px-2 ${className || ""}`}>
			<div className="flex-1 text-sm text-muted-foreground">
				{showTotal && <span>{i18n.total(totalElements)}</span>}
			</div>
			<div className="flex items-center gap-6 lg:gap-8">
				<div className="flex items-center gap-2">
					<Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
						<SelectTrigger className="h-8 w-25">
							<SelectValue placeholder={pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{pageSizeOptions.map((size) => (
								<SelectItem key={size} value={`${size}`}>
									{size} {i18n.perPage}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => onPageChange(1)}
						disabled={!canPreviousPage}
					>
						<span className="sr-only">{i18n.firstPage}</span>
						<ChevronsLeft className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => onPageChange(pageNumber - 1)}
						disabled={!canPreviousPage}
					>
						<span className="sr-only">{i18n.previousPage}</span>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="flex items-center gap-1 text-sm">
						<span>{pageNumber}</span>
					</div>
					<Button
						variant="outline"
						className="h-8 w-8 p-0"
						onClick={() => onPageChange(pageNumber + 1)}
						disabled={!canNextPage}
					>
						<span className="sr-only">{i18n.nextPage}</span>
						<ChevronRight className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => onPageChange(totalPages)}
						disabled={!canNextPage}
					>
						<span className="sr-only">{i18n.lastPage}</span>
						<ChevronsRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	)
}
