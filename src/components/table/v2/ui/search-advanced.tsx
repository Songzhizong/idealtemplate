import { Search, X } from "lucide-react"
import { type KeyboardEvent, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker-rac"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { FilterDefinition } from "../core"
import { type DataTableI18nOverrides, mergeDataTableI18n, useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"
import { DataTableAdvancedFieldPicker } from "./search-advanced/field-picker"
import { useAdvancedSearchState } from "./search-advanced/use-advanced-search-state"
import { isDateValue, parseDateRange } from "./search-advanced/utils"
import { DataTableAdvancedValueEditor } from "./search-advanced/value-editor"

export interface DataTableAdvancedSearchProps<TFilterSchema> {
  filterKey: keyof TFilterSchema
  placeholder?: string | undefined
  className?: string | undefined
  inputClassName?: string | undefined
  i18n?: DataTableI18nOverrides | undefined
  advancedFields: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
}

export function DataTableAdvancedSearch<TFilterSchema>({
  filterKey,
  placeholder,
  className,
  inputClassName,
  i18n: i18nOverrides,
  advancedFields,
}: DataTableAdvancedSearchProps<TFilterSchema>) {
  const dt = useDataTableInstance<unknown, TFilterSchema>()
  const { i18n: globalI18n } = useDataTableConfig()
  const i18n = useMemo(
    () => mergeDataTableI18n(globalI18n, i18nOverrides),
    [globalI18n, i18nOverrides],
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const setFilterValue = <K extends keyof TFilterSchema>(key: K, value: TFilterSchema[K]) => {
    dt.filters.set(key, value)
  }

  const state = useAdvancedSearchState({
    filterKey,
    placeholder,
    booleanLabels: {
      trueText: i18n.filters.booleanTrueText,
      falseText: i18n.filters.booleanFalseText,
    },
    advancedFields,
    filtersState: dt.filters.state,
    setFilter: setFilterValue,
    requestInputFocus: () => {
      inputRef.current?.focus()
    },
  })

  const activeFieldValue = state.activeField ? dt.filters.state[state.activeField.key] : undefined
  const isDateField = state.activeField?.type === "date"
  const isDateRangeField = state.activeField?.type === "date-range"
  const activeDateValue = isDateValue(activeFieldValue) ? activeFieldValue : undefined
  const activeDateRangeValue = parseDateRange(activeFieldValue)
  const valueEditorPopoverClassName = "w-[min(420px,92vw)] p-3"
  const handleDateFieldKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return
    event.preventDefault()
    event.stopPropagation()
    state.onClear()
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  return (
    <Popover open={state.isValuePickerOpen} onOpenChange={state.onValuePickerOpenChange}>
      <PopoverAnchor asChild>
        <div className={cn("w-full max-w-3xl", className)}>
          <div className="flex h-9 w-full items-center rounded-md border border-input bg-background px-2">
            <Search className="ml-1 mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <DataTableAdvancedFieldPicker
              fieldPickerOpen={state.fieldPickerOpen}
              onFieldPickerOpenChange={state.onFieldPickerOpenChange}
              activeField={state.activeField}
              searchableFields={state.searchableFields}
              onSelectField={state.onSelectField}
            />
            <span className="mx-2 h-4 w-px shrink-0 bg-border/70" />
            {isDateField ? (
              <div className="w-full min-w-0 flex-1" onKeyDownCapture={handleDateFieldKeyDown}>
                <DatePicker
                  autoOpen
                  autoFocusInput
                  value={activeDateValue}
                  onChange={state.onDateChange}
                  className="w-full min-w-0"
                  triggerClassName="m-0 h-auto w-full min-w-0 border-0 bg-transparent px-0 py-0 shadow-none"
                />
              </div>
            ) : isDateRangeField ? (
              <div className="w-full min-w-0 flex-1" onKeyDownCapture={handleDateFieldKeyDown}>
                <DateRangePicker
                  autoOpen
                  autoFocusInput
                  value={state.pendingDateRange ?? activeDateRangeValue}
                  onChange={state.onDateRangeDirectChange}
                  className="w-full min-w-0"
                  triggerClassName="m-0 h-auto w-full min-w-0 border-0 bg-transparent px-0 py-0 shadow-none"
                />
              </div>
            ) : (
              <Input
                ref={inputRef}
                value={state.advancedDisplayValue}
                onChange={(event) => state.onInputChange(event.target.value)}
                onKeyDown={state.onKeyDown}
                onFocus={state.onInputFocus}
                placeholder={state.resolvedPlaceholder}
                className={cn(
                  "h-auto min-w-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0",
                  inputClassName,
                )}
              />
            )}
            {state.canClear ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="ml-1 h-6 w-6 shrink-0"
                onClick={state.onClear}
                aria-label={i18n.clearSearchAriaLabel}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent align="start" className={valueEditorPopoverClassName}>
        <DataTableAdvancedValueEditor
          activeField={state.activeField}
          fieldValue={activeFieldValue}
          filteredOptionEntries={state.filteredOptionEntries}
          normalizedOptionIndex={state.normalizedOptionIndex}
          pendingMultiValues={state.pendingMultiValues}
          pendingNumberRange={state.pendingNumberRange}
          onOptionHover={state.onOptionHover}
          onSelectOption={state.onSelectOption}
          onTogglePendingMultiValue={state.onTogglePendingMultiValue}
          onCancelMulti={state.onCancelMulti}
          onConfirmMulti={state.onConfirmMulti}
          onNumberRangeChange={state.onNumberRangeChange}
          onCancelRange={state.onCancelRange}
          onConfirmRange={state.onConfirmRange}
        />
      </PopoverContent>
    </Popover>
  )
}
