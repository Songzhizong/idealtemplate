import { CalendarDate, getLocalTimeZone } from "@internationalized/date"
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import React from "react"
import {
	Button as AriaButton,
	Calendar as AriaCalendar,
	type CalendarProps as AriaCalendarProps,
	DatePicker as AriaDatePicker,
	DateRangePicker as AriaDateRangePicker,
	type RangeCalendarProps as AriaRangeCalendarProps,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	DateInput,
	DateSegment,
	type DateValue,
	Dialog,
	Group,
	Heading,
	Label,
	Popover,
	RangeCalendar,
} from "react-aria-components"
import { cn } from "@/lib/utils"

// --- Utils ---

function dateToCalendarDate(date: Date): CalendarDate {
	// Construct CalendarDate from local date components to avoid timezone shifts
	return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function calendarDateToDate(date: DateValue): Date {
	// date.toDate(timezone) is available on CalendarDate, ZonedDateTime, CalendarDateTime
	return date.toDate(getLocalTimeZone())
}

// --- Styles ---

const buttonStyles =
	"flex h-9 items-center justify-between rounded-md border border-border/50 bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

const popoverContentStyles =
	"z-50 w-auto rounded-md border border-border/50 bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2"

const calendarStyles = "p-3"
const headerStyles = "flex items-center justify-between space-x-2 pb-4"
const headingStyles = "text-sm font-medium"
const navButtonStyles = cn(
	"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
	"border border-border/40 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
	"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
)

const gridStyles = "w-full border-collapse space-y-1"
const gridHeaderStyles = "text-[0.8rem] text-muted-foreground font-normal"
// const cellStyles = ... // moved to function

const dayButtonStyles = ({
	isSelected,
	isHovered,
	isFocusVisible,
	isOutsideVisibleRange,
}: {
	isSelected: boolean
	isHovered: boolean
	isFocusVisible: boolean
	isOutsideVisibleRange: boolean
}) =>
	cn(
		"h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-md transition-colors",
		isOutsideVisibleRange ? "text-muted-foreground opacity-50" : "text-foreground",
		isHovered && !isSelected && "bg-accent text-accent-foreground",
		isSelected &&
			"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
		isFocusVisible && "ring-2 ring-ring ring-offset-2",
		!isSelected &&
			!isOutsideVisibleRange &&
			!isHovered &&
			"hover:bg-accent hover:text-accent-foreground",
	)

// --- Components ---

interface DatePickerProps {
	value?: Date | undefined
	onChange?: (date: Date | undefined) => void
	placeholder?: string
	className?: string
	triggerClassName?: string
	autoOpen?: boolean
	autoFocusInput?: boolean
	inlineCalendar?: boolean
}

export function DatePicker({
	value,
	onChange,
	className,
	triggerClassName,
	autoOpen = false,
	autoFocusInput = false,
	inlineCalendar = false,
}: DatePickerProps) {
	const [date, setDate] = React.useState<DateValue | null>(value ? dateToCalendarDate(value) : null)
	const [open, setOpen] = React.useState(autoOpen)
	const groupRef = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		if (value) {
			setDate(dateToCalendarDate(value))
		} else {
			setDate(null)
		}
	}, [value])

	React.useEffect(() => {
		if (inlineCalendar) return
		if (!autoOpen) return
		setOpen(true)
	}, [autoOpen, inlineCalendar])

	React.useEffect(() => {
		if (!autoFocusInput) return
		requestAnimationFrame(() => {
			const focusTarget =
				groupRef.current?.querySelector<HTMLElement>("[role='spinbutton']") ??
				groupRef.current?.querySelector<HTMLElement>("[tabindex='0']")
			focusTarget?.focus()
		})
	}, [autoFocusInput])

	const handleChange = (newDate: DateValue | null) => {
		setDate(newDate)
		if (onChange) {
			onChange(newDate ? calendarDateToDate(newDate) : undefined)
		}
	}
	const pickerOpenProps = inlineCalendar ? {} : { isOpen: open, onOpenChange: setOpen }

	return (
		<AriaDatePicker
			className={cn("group flex flex-col gap-1 w-60", className)}
			value={date}
			onChange={handleChange}
			{...pickerOpenProps}
		>
			<Label className="sr-only">Date</Label>
				<Group
					ref={groupRef}
					className={cn(
						buttonStyles,
						"w-full",
						"data-focus-within:ring-2 data-focus-within:ring-ring",
						"m-0.5", // Add margin to ensure focus ring is not clipped
						triggerClassName,
					)}
				>
				<DateInput className="flex flex-1 items-center bg-transparent p-0 text-sm placeholder:text-muted-foreground outline-none">
					{(segment) => (
						<DateSegment
							segment={segment}
							className="px-0.5 tabular-nums outline-none rounded-sm focus:bg-accent focus:text-accent-foreground data-placeholder:text-muted-foreground"
						/>
					)}
				</DateInput>
				<AriaButton className="outline-none text-muted-foreground group-hover:text-foreground transition-colors">
					<CalendarIcon className="h-4 w-4" />
				</AriaButton>
			</Group>
			{inlineCalendar ? (
				<div className="mt-1 rounded-md border border-border/50 bg-popover p-1">
					<MyCalendar />
				</div>
			) : (
				<Popover className={popoverContentStyles}>
					<Dialog className="p-0 outline-none">
						<MyCalendar />
					</Dialog>
				</Popover>
			)}
		</AriaDatePicker>
	)
}

function MyCalendar(props: AriaCalendarProps<DateValue>) {
	return (
		<AriaCalendar {...props} className={calendarStyles}>
			<header className={headerStyles}>
				<AriaButton slot="previous" className={navButtonStyles}>
					<ChevronLeft className="h-4 w-4" />
				</AriaButton>
				<Heading className={headingStyles} />
				<AriaButton slot="next" className={navButtonStyles}>
					<ChevronRight className="h-4 w-4" />
				</AriaButton>
			</header>
			<CalendarGrid className={gridStyles}>
				<CalendarGridHeader>
					{(day) => <CalendarHeaderCell className={gridHeaderStyles}>{day}</CalendarHeaderCell>}
				</CalendarGridHeader>
				<CalendarGridBody>
					{(date) => (
						<CalendarCell
							date={date}
							className={({ isSelected, isHovered, isFocusVisible, isOutsideVisibleRange }) =>
								dayButtonStyles({ isSelected, isHovered, isFocusVisible, isOutsideVisibleRange })
							}
						/>
					)}
				</CalendarGridBody>
			</CalendarGrid>
		</AriaCalendar>
	)
}

interface DateRangePickerProps {
	value?: { from: Date | undefined; to?: Date | undefined } | undefined
	onChange?: (range: { from: Date; to?: Date } | undefined) => void
	placeholder?: string
	className?: string
	triggerClassName?: string
	autoOpen?: boolean
	autoFocusInput?: boolean
	inlineCalendar?: boolean
}

export function DateRangePicker({
	value,
	onChange,
	className,
	triggerClassName,
	autoOpen = false,
	autoFocusInput = false,
	inlineCalendar = false,
}: DateRangePickerProps) {
	const [range, setRange] = React.useState<{ start: DateValue; end: DateValue } | null>(
		value?.from && value?.to
			? { start: dateToCalendarDate(value.from), end: dateToCalendarDate(value.to) }
			: null,
	)
	const [open, setOpen] = React.useState(autoOpen)
	const groupRef = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		if (value?.from && value?.to) {
			setRange({
				start: dateToCalendarDate(value.from),
				end: dateToCalendarDate(value.to),
			})
		} else if (value?.from) {
			setRange({
				start: dateToCalendarDate(value.from),
				end: dateToCalendarDate(value.from),
			})
		} else {
			setRange(null)
		}
	}, [value])

	React.useEffect(() => {
		if (inlineCalendar) return
		if (!autoOpen) return
		setOpen(true)
	}, [autoOpen, inlineCalendar])

	React.useEffect(() => {
		if (!autoFocusInput) return
		requestAnimationFrame(() => {
			const focusTarget =
				groupRef.current?.querySelector<HTMLElement>("[role='spinbutton']") ??
				groupRef.current?.querySelector<HTMLElement>("[tabindex='0']")
			focusTarget?.focus()
		})
	}, [autoFocusInput])

	const handleChange = (newRange: { start: DateValue; end: DateValue } | null) => {
		setRange(newRange)
		if (onChange && newRange) {
			onChange({
				from: calendarDateToDate(newRange.start),
				to: calendarDateToDate(newRange.end),
			})
		} else if (onChange) {
			onChange(undefined)
		}
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		setRange(null)
		onChange?.(undefined)
	}
	const pickerOpenProps = inlineCalendar ? {} : { isOpen: open, onOpenChange: setOpen }

	return (
		<AriaDateRangePicker
			className={cn("group flex flex-col gap-1 w-fit", className)}
			value={range}
			onChange={handleChange}
			{...pickerOpenProps}
		>
			<Label className="sr-only">Date Range</Label>
			<Group
				ref={groupRef}
				className={cn(
					buttonStyles,
					"w-fit min-w-50",
					"data-focus-within:ring-2 data-focus-within:ring-ring relative",
					"m-0.5", // Add margin to ensure focus ring is not clipped
					triggerClassName,
				)}
			>
				<DateInput
					slot="start"
					className="flex flex-1 items-center bg-transparent p-0 text-sm placeholder:text-muted-foreground outline-none min-w-0"
				>
					{(segment) => (
						<DateSegment
							segment={segment}
							className="px-0.5 tabular-nums outline-none rounded-sm focus:bg-accent focus:text-accent-foreground data-placeholder:text-muted-foreground"
						/>
					)}
				</DateInput>
				<span aria-hidden="true" className="px-1 text-muted-foreground shrink-0">
					-
				</span>
				<DateInput
					slot="end"
					className="flex flex-1 items-center bg-transparent p-0 text-sm placeholder:text-muted-foreground outline-none min-w-0"
				>
					{(segment) => (
						<DateSegment
							segment={segment}
							className="px-0.5 tabular-nums outline-none rounded-sm focus:bg-accent focus:text-accent-foreground data-placeholder:text-muted-foreground"
						/>
					)}
				</DateInput>

				<div className="flex items-center gap-1.5 shrink-0 pl-1">
					{range && (
						<button
							type="button"
							className="rounded-full bg-background p-0.5 hover:bg-accent cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
							onClick={handleClear}
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
					<AriaButton className="outline-none text-muted-foreground group-hover:text-foreground transition-colors">
						<CalendarIcon className="h-4 w-4" />
					</AriaButton>
				</div>
			</Group>
			{inlineCalendar ? (
				<div className="mt-1 rounded-md border border-border/50 bg-popover p-1">
					<MyRangeCalendar />
				</div>
			) : (
				<Popover className={cn(popoverContentStyles, "max-w-[calc(100vw-1rem)] sm:max-w-none p-1")}>
					<Dialog className="p-0 outline-none">
						<MyRangeCalendar />
					</Dialog>
				</Popover>
			)}
		</AriaDateRangePicker>
	)
}

function MyRangeCalendar(props: AriaRangeCalendarProps<DateValue>) {
	return (
		<RangeCalendar
			{...props}
			className={cn(calendarStyles, "w-fit")}
			visibleDuration={{ months: 2 }}
			pageBehavior="visible"
		>
			<header className={headerStyles}>
				<AriaButton slot="previous" className={navButtonStyles}>
					<ChevronLeft className="h-4 w-4" />
				</AriaButton>
				<Heading className={headingStyles} />
				<AriaButton slot="next" className={navButtonStyles}>
					<ChevronRight className="h-4 w-4" />
				</AriaButton>
			</header>
			<div className="flex gap-4 overflow-x-auto sm:overflow-visible p-1">
				<CalendarGrid className={gridStyles}>
					<CalendarGridHeader>
						{(day) => <CalendarHeaderCell className={gridHeaderStyles}>{day}</CalendarHeaderCell>}
					</CalendarGridHeader>
					<CalendarGridBody>
						{(date) => (
							<CalendarCell
								date={date}
								className={({
									isSelected,
									isSelectionStart,
									isSelectionEnd,
									isOutsideVisibleRange,
									isHovered,
									isFocusVisible,
								}) =>
									cn(
										"relative flex h-9 w-9 items-center justify-center text-sm font-normal p-0",
										isOutsideVisibleRange ? "text-muted-foreground opacity-50" : "text-foreground",

										isSelected &&
											(isSelectionStart || isSelectionEnd
												? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
												: "bg-accent text-accent-foreground"),

										(isSelectionStart || isSelectionEnd) && "rounded-md transition-colors",

										isSelectionStart && "rounded-l-md rounded-r-none",
										isSelectionEnd && "rounded-r-md rounded-l-none",
										isSelectionStart && isSelectionEnd && "rounded-md",

										// Between selected dates
										isSelected && !isSelectionStart && !isSelectionEnd && "rounded-none",

										!isSelected && !isOutsideVisibleRange && isHovered && "bg-accent rounded-md",
										isFocusVisible && "ring-2 ring-ring ring-offset-2 z-10 rounded-md",
									)
								}
							/>
						)}
					</CalendarGridBody>
				</CalendarGrid>
				<CalendarGrid className={gridStyles} offset={{ months: 1 }}>
					<CalendarGridHeader>
						{(day) => <CalendarHeaderCell className={gridHeaderStyles}>{day}</CalendarHeaderCell>}
					</CalendarGridHeader>
					<CalendarGridBody>
						{(date) => (
							<CalendarCell
								date={date}
								className={({
									isSelected,
									isSelectionStart,
									isSelectionEnd,
									isOutsideVisibleRange,
									isHovered,
									isFocusVisible,
								}) =>
									cn(
										"relative flex h-9 w-9 items-center justify-center text-sm font-normal p-0",
										isOutsideVisibleRange ? "text-muted-foreground opacity-50" : "text-foreground",

										isSelected &&
											(isSelectionStart || isSelectionEnd
												? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
												: "bg-accent text-accent-foreground"),

										(isSelectionStart || isSelectionEnd) && "rounded-md transition-colors",

										isSelectionStart && "rounded-l-md rounded-r-none",
										isSelectionEnd && "rounded-r-md rounded-l-none",
										isSelectionStart && isSelectionEnd && "rounded-md",

										// Between selected dates
										isSelected && !isSelectionStart && !isSelectionEnd && "rounded-none",

										!isSelected && !isOutsideVisibleRange && isHovered && "bg-accent rounded-md",
										isFocusVisible && "ring-2 ring-ring ring-offset-2 z-10 rounded-md",
									)
								}
							/>
						)}
					</CalendarGridBody>
				</CalendarGrid>
			</div>
		</RangeCalendar>
	)
}
