import type { KeyboardEvent } from "react"
import type { FilterDefinition } from "../../core"
import type { AdvancedOptionEntry, AdvancedSearchField } from "./types"
import type { DateRangeValue } from "./utils"

export type SetFilterValue<TFilterSchema> = <K extends keyof TFilterSchema>(
  key: K,
  value: TFilterSchema[K],
) => void

export interface UseAdvancedSearchStateParams<TFilterSchema> {
  filterKey: keyof TFilterSchema
  placeholder?: string | undefined
  booleanLabels: {
    trueText: string
    falseText: string
  }
  advancedFields: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
  filtersState: TFilterSchema
  setFilter: SetFilterValue<TFilterSchema>
  requestInputFocus: () => void
}

export interface UseAdvancedSearchStateResult<TFilterSchema> {
  fieldPickerOpen: boolean
  activeField: AdvancedSearchField<TFilterSchema> | null
  searchableFields: Array<AdvancedSearchField<TFilterSchema>>
  filteredOptionEntries: AdvancedOptionEntry[]
  pendingMultiValues: unknown[]
  pendingNumberRange: {
    min: string
    max: string
  }
  pendingDateRange: DateRangeValue | undefined
  advancedDisplayValue: string
  resolvedPlaceholder: string
  canClear: boolean
  normalizedOptionIndex: number
  isValuePickerOpen: boolean
  onFieldPickerOpenChange: (nextOpen: boolean) => void
  onValuePickerOpenChange: (nextOpen: boolean) => void
  onSelectField: (field: AdvancedSearchField<TFilterSchema>) => void
  onInputChange: (nextValue: string) => void
  onInputFocus: () => void
  onClear: () => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onOptionHover: (index: number) => void
  onSelectOption: (optionValue: unknown) => void
  onTogglePendingMultiValue: (optionValue: unknown) => void
  onCancelMulti: () => void
  onConfirmMulti: () => void
  onNumberRangeChange: (nextRange: { min: string; max: string }) => void
  onCancelRange: () => void
  onConfirmRange: () => void
  onDateChange: (nextDate: Date | undefined) => void
  onDateRangeDirectChange: (nextRange: { from: Date; to?: Date } | undefined) => void
}
