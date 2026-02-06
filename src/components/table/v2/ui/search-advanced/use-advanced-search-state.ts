import { type KeyboardEvent, useMemo, useRef, useState } from "react"
import type { UseAdvancedSearchStateParams, UseAdvancedSearchStateResult } from "./state-types"
import type { AdvancedOptionEntry, AdvancedSearchField } from "./types"
import { isAdvancedSearchField } from "./types"
import {
  areValuesEqual,
  type DateRangeValue,
  type NumberRangeValue,
  normalizeKeyword,
  parseDateRange,
  parseNumberInput,
  parseNumberRange,
  serializeOptionValue,
} from "./utils"

export function useAdvancedSearchState<TFilterSchema>({
  filterKey,
  placeholder,
  booleanLabels,
  advancedFields,
  filtersState,
  setFilter,
  requestInputFocus,
}: UseAdvancedSearchStateParams<TFilterSchema>): UseAdvancedSearchStateResult<TFilterSchema> {
  const [draftValue, setDraftValue] = useState("")
  const [fieldPickerOpen, setFieldPickerOpen] = useState(false)
  const [valuePickerOpen, setValuePickerOpen] = useState(false)
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null)
  const [optionKeyword, setOptionKeyword] = useState("")
  const [pendingMultiValues, setPendingMultiValues] = useState<unknown[]>([])
  const [pendingNumberRange, setPendingNumberRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  })
  const [pendingDateRange, setPendingDateRange] = useState<DateRangeValue | undefined>(undefined)
  const [activeOptionIndex, setActiveOptionIndex] = useState(0)
  const isOpeningValuePickerRef = useRef(false)

  const searchableFields = useMemo(
    () => advancedFields.filter((field) => isAdvancedSearchField(field)),
    [advancedFields],
  )

  const activeField = useMemo(() => {
    if (!activeFieldKey) return null
    return searchableFields.find((field) => String(field.key) === activeFieldKey) ?? null
  }, [activeFieldKey, searchableFields])

  const optionEntries = useMemo<AdvancedOptionEntry[]>(() => {
    if (!activeField) return []
    if (activeField.type === "boolean") {
      return [
        {
          key: "true",
          option: {
            label: booleanLabels.trueText,
            value: true,
          },
        },
        {
          key: "false",
          option: {
            label: booleanLabels.falseText,
            value: false,
          },
        },
      ]
    }
    return (activeField.options ?? []).map((option) => ({
      key: serializeOptionValue(option.value),
      option: {
        label: option.label,
        value: option.value,
      },
    }))
  }, [activeField, booleanLabels.falseText, booleanLabels.trueText])

  const filteredOptionEntries = useMemo(() => {
    const keyword = normalizeKeyword(optionKeyword)
    if (keyword === "") return optionEntries
    return optionEntries.filter((entry) => normalizeKeyword(entry.option.label).includes(keyword))
  }, [optionEntries, optionKeyword])

  const resetAdvancedDraft = () => {
    setDraftValue("")
    setOptionKeyword("")
    setPendingMultiValues([])
    setPendingNumberRange({ min: "", max: "" })
    setPendingDateRange(undefined)
    setActiveFieldKey(null)
    setValuePickerOpen(false)
    setActiveOptionIndex(0)
    isOpeningValuePickerRef.current = false
  }

  const resetNonTextFieldContext = () => {
    setValuePickerOpen(false)
    setPendingMultiValues([])
    setPendingNumberRange({ min: "", max: "" })
    setPendingDateRange(undefined)
    setActiveFieldKey(null)
    setOptionKeyword("")
    setActiveOptionIndex(0)
    isOpeningValuePickerRef.current = false
  }

  const onSelectField = (field: AdvancedSearchField<TFilterSchema>) => {
    setActiveFieldKey(String(field.key))
    setFieldPickerOpen(false)
    setDraftValue("")
    setOptionKeyword("")
    setPendingMultiValues([])
    setPendingNumberRange({ min: "", max: "" })
    setPendingDateRange(undefined)
    setActiveOptionIndex(0)

    if (field.type === "text") {
      isOpeningValuePickerRef.current = false
      setValuePickerOpen(false)
      requestAnimationFrame(() => {
        requestInputFocus()
      })
      return
    }

    if (field.type === "multi-select") {
      const currentValue = filtersState[field.key]
      const nextPending = Array.isArray(currentValue) ? [...currentValue] : []
      setPendingMultiValues(nextPending)
    }
    if (field.type === "number-range") {
      const rangeValue = parseNumberRange(filtersState[field.key])
      setPendingNumberRange({
        min: rangeValue.min == null ? "" : String(rangeValue.min),
        max: rangeValue.max == null ? "" : String(rangeValue.max),
      })
    }
    if (field.type === "date-range") {
      setPendingDateRange(parseDateRange(filtersState[field.key]))
    }

    const shouldOpenValuePicker =
      field.type === "select" ||
      field.type === "multi-select" ||
      field.type === "boolean" ||
      field.type === "number-range"
    const shouldFocusSearchInput =
      field.type === "select" || field.type === "multi-select" || field.type === "boolean"

    isOpeningValuePickerRef.current = shouldOpenValuePicker && shouldFocusSearchInput
    setValuePickerOpen(shouldOpenValuePicker)
    if (!shouldOpenValuePicker) {
      isOpeningValuePickerRef.current = false
      return
    }
    if (shouldFocusSearchInput) {
      requestAnimationFrame(() => {
        requestInputFocus()
        isOpeningValuePickerRef.current = false
      })
      return
    }
    isOpeningValuePickerRef.current = false
  }

  const commitFreeText = () => {
    const nextValue = draftValue.trim()
    if (nextValue === "") return
    setFilter(filterKey, nextValue as TFilterSchema[typeof filterKey])
    resetAdvancedDraft()
  }

  const commitTextField = () => {
    if (!activeField || activeField.type !== "text") return
    const nextValue = draftValue.trim()
    if (nextValue === "") return
    setFilter(activeField.key, nextValue as TFilterSchema[typeof activeField.key])
    resetAdvancedDraft()
  }

  const commitSelectField = (optionValue: unknown) => {
    if (!activeField || activeField.type !== "select") return
    setFilter(activeField.key, optionValue as TFilterSchema[typeof activeField.key])
    resetAdvancedDraft()
  }

  const commitBooleanField = (optionValue: unknown) => {
    if (!activeField || activeField.type !== "boolean" || typeof optionValue !== "boolean") return
    setFilter(activeField.key, optionValue as TFilterSchema[typeof activeField.key])
    resetAdvancedDraft()
  }

  const commitMultiField = () => {
    if (!activeField || activeField.type !== "multi-select") return
    setFilter(activeField.key, pendingMultiValues as TFilterSchema[typeof activeField.key])
    resetAdvancedDraft()
  }

  const commitNumberRangeField = () => {
    if (!activeField || activeField.type !== "number-range") return
    const nextRange: NumberRangeValue = {
      min: parseNumberInput(pendingNumberRange.min),
      max: parseNumberInput(pendingNumberRange.max),
    }
    if (nextRange.min == null && nextRange.max == null) {
      setFilter(activeField.key, null as TFilterSchema[typeof activeField.key])
      resetAdvancedDraft()
      return
    }
    setFilter(activeField.key, nextRange as TFilterSchema[typeof activeField.key])
    resetAdvancedDraft()
  }

  const commitDateField = (nextDate: Date | undefined) => {
    if (!activeField || activeField.type !== "date") return
    if (!nextDate) {
      setFilter(activeField.key, null as TFilterSchema[typeof activeField.key])
      resetAdvancedDraft()
      return
    }
    setFilter(activeField.key, nextDate as TFilterSchema[typeof activeField.key])
    resetAdvancedDraft()
  }

  const commitDateRangeField = () => {
    if (!activeField || activeField.type !== "date-range") return
    if (!pendingDateRange?.from && !pendingDateRange?.to) {
      setFilter(activeField.key, null as TFilterSchema[typeof activeField.key])
      resetAdvancedDraft()
      return
    }
    setFilter(activeField.key, pendingDateRange as TFilterSchema[typeof activeField.key])
    resetAdvancedDraft()
  }

  const onDateRangeDirectChange = (nextRange: { from: Date; to?: Date } | undefined) => {
    if (!activeField || activeField.type !== "date-range") return
    if (!nextRange?.from) {
      setFilter(activeField.key, null as TFilterSchema[typeof activeField.key])
      resetAdvancedDraft()
      return
    }
    if (!nextRange.to) {
      setPendingDateRange({
        from: nextRange.from,
        to: undefined,
      })
      return
    }
    setFilter(activeField.key, {
      from: nextRange.from,
      to: nextRange.to,
    } as TFilterSchema[typeof activeField.key])
    resetAdvancedDraft()
  }

  const onTogglePendingMultiValue = (optionValue: unknown) => {
    setPendingMultiValues((prev) => {
      const exists = prev.some((value) => areValuesEqual(value, optionValue))
      if (!exists) return [...prev, optionValue]
      return prev.filter((value) => !areValuesEqual(value, optionValue))
    })
  }

  const onInputChange = (nextValue: string) => {
    if (activeField && activeField.type !== "text") {
      setOptionKeyword(nextValue)
      setActiveOptionIndex(0)
      if (!valuePickerOpen) {
        setValuePickerOpen(true)
      }
      return
    }
    setDraftValue(nextValue)
  }

  const onClear = () => {
    if (activeField) {
      resetAdvancedDraft()
      return
    }
    setDraftValue("")
    setOptionKeyword("")
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const hasOptions = filteredOptionEntries.length > 0

    if (activeField && activeField.type !== "text") {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        if (!valuePickerOpen) {
          setValuePickerOpen(true)
        }
        if (!hasOptions) return
        setActiveOptionIndex((prev) => {
          if (event.key === "ArrowDown") {
            return prev >= filteredOptionEntries.length - 1 ? 0 : prev + 1
          }
          return prev <= 0 ? filteredOptionEntries.length - 1 : prev - 1
        })
        return
      }

      if (event.key === " " && activeField.type === "multi-select") {
        event.preventDefault()
        if (!hasOptions) return
        const next = filteredOptionEntries[activeOptionIndex] ?? filteredOptionEntries[0]
        if (!next) return
        onTogglePendingMultiValue(next.option.value)
        return
      }
    }

    if (event.key === "Escape") {
      if (activeField && activeField.type !== "text") {
        resetNonTextFieldContext()
        return
      }
      resetAdvancedDraft()
      return
    }

    if (event.key !== "Enter") return
    event.preventDefault()

    if (!activeField) {
      commitFreeText()
      return
    }

    if (activeField.type === "text") {
      commitTextField()
      return
    }

    if (activeField.type === "select" || activeField.type === "boolean") {
      if (!hasOptions) return
      const next = filteredOptionEntries[activeOptionIndex] ?? filteredOptionEntries[0]
      if (!next) return
      if (activeField.type === "select") {
        commitSelectField(next.option.value)
        return
      }
      commitBooleanField(next.option.value)
      return
    }

    if (activeField.type === "number-range") {
      commitNumberRangeField()
      return
    }

    if (activeField.type === "date") {
      return
    }

    if (activeField.type === "date-range") {
      commitDateRangeField()
      return
    }

    commitMultiField()
  }

  const advancedDisplayValue =
    activeField && activeField.type !== "text" ? optionKeyword : draftValue
  const resolvedPlaceholder = activeField
    ? activeField.type === "text"
      ? `输入${activeField.label}`
      : `选择${activeField.label}`
    : (placeholder ?? "输入关键字后按回车添加")
  const canClear =
    activeField !== null || advancedDisplayValue.trim() !== "" || pendingMultiValues.length > 0
  const normalizedOptionIndex =
    filteredOptionEntries.length === 0
      ? -1
      : Math.min(activeOptionIndex, filteredOptionEntries.length - 1)
  const isValuePickerOpen = Boolean(
    activeField &&
      activeField.type !== "text" &&
      activeField.type !== "date" &&
      activeField.type !== "date-range" &&
      valuePickerOpen,
  )

  const onValuePickerOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isOpeningValuePickerRef.current) {
      return
    }
    setValuePickerOpen(nextOpen)
    if (!nextOpen && activeField && activeField.type !== "text") {
      resetNonTextFieldContext()
    }
  }

  return {
    fieldPickerOpen,
    activeField,
    searchableFields,
    filteredOptionEntries,
    pendingMultiValues,
    pendingNumberRange,
    pendingDateRange,
    advancedDisplayValue,
    resolvedPlaceholder,
    canClear,
    normalizedOptionIndex,
    isValuePickerOpen,
    onFieldPickerOpenChange: setFieldPickerOpen,
    onValuePickerOpenChange,
    onSelectField,
    onInputChange,
    onInputFocus: () => {
      if (
        activeField &&
        activeField.type !== "text" &&
        activeField.type !== "date" &&
        activeField.type !== "date-range"
      ) {
        setValuePickerOpen(true)
      }
    },
    onClear,
    onKeyDown,
    onOptionHover: setActiveOptionIndex,
    onSelectOption: (optionValue) => {
      if (!activeField) return
      if (activeField.type === "select") {
        commitSelectField(optionValue)
        return
      }
      if (activeField.type === "boolean") {
        commitBooleanField(optionValue)
      }
    },
    onTogglePendingMultiValue,
    onCancelMulti: resetNonTextFieldContext,
    onConfirmMulti: commitMultiField,
    onNumberRangeChange: setPendingNumberRange,
    onCancelRange: resetNonTextFieldContext,
    onConfirmRange: commitNumberRangeField,
    onDateChange: commitDateField,
    onDateRangeDirectChange,
  }
}
