import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SortableHeader<TData>({ column, label }: { column: Column<TData>; label: string }) {
	const canSort = column.getCanSort()
	const sorted = column.getIsSorted()
	const icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown
	const Icon = canSort ? icon : ArrowUpDown

	return (
		<button
			type="button"
			className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1 px-2")}
			onClick={column.getToggleSortingHandler()}
			disabled={!canSort}
		>
			<span>{label}</span>
			<Icon className="h-3.5 w-3.5 text-muted-foreground" />
		</button>
	)
}
