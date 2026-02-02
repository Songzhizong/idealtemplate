import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
	value?: DateRange | undefined
	onChange: (range: DateRange | undefined) => void
	placeholder?: string
	className?: string
	clearable?: boolean
}

export function DateRangePicker({
	value,
	onChange,
	placeholder = "选择时间范围",
	className,
	clearable = true,
}: DateRangePickerProps) {
	const label = value?.from
		? value.to
			? `${format(value.from, "yyyy-MM-dd", { locale: zhCN })} - ${format(value.to, "yyyy-MM-dd", {
					locale: zhCN,
				})}`
			: `${format(value.from, "yyyy-MM-dd", { locale: zhCN })} -`
		: placeholder

	return (
		<Popover>
			<div className="relative inline-flex">
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"h-9 w-64 justify-start text-left font-normal whitespace-nowrap pr-8",
							!value?.from && "text-muted-foreground",
							className,
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						<span className="truncate">{label}</span>
					</Button>
				</PopoverTrigger>
				{value?.from && clearable ? (
					<button
						type="button"
						aria-label="清除时间范围"
						className="absolute right-2 top-1/2 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/60"
						onClick={(event) => {
							event.stopPropagation()
							onChange(undefined)
						}}
					>
						<X className="size-3" />
					</button>
				) : null}
			</div>
			<PopoverContent className="w-auto p-0">
				<Calendar
					mode="range"
					numberOfMonths={2}
					selected={value}
					onSelect={onChange}
					required={false}
				/>
			</PopoverContent>
		</Popover>
	)
}
