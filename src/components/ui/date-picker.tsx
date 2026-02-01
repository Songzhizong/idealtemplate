import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
	value?: Date | undefined
	onChange: (date: Date | undefined) => void
	placeholder?: string
	className?: string
}

export function DatePicker({
	value,
	onChange,
	placeholder = "选择日期",
	className,
}: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"h-9 w-40 justify-start text-left font-normal",
						!value && "text-muted-foreground",
						className,
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value ? format(value, "yyyy-MM-dd", { locale: zhCN }) : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar mode="single" selected={value} onSelect={onChange} required={false} />
			</PopoverContent>
		</Popover>
	)
}
