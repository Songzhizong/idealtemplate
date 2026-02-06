import { Check, ChevronDown, Search, X } from "lucide-react"
import { type KeyboardEvent, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { FilterDefinition } from "../core"
import { type DataTableI18nOverrides, mergeDataTableI18n, useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"

type AdvancedFieldType = "text" | "select" | "multi-select"
type AdvancedSearchField<TFilterSchema> = FilterDefinition<TFilterSchema, keyof TFilterSchema> & {
  type: AdvancedFieldType
}

function areValuesEqual(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }
  return Object.is(a, b)
}

function serializeOptionValue(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (value instanceof Date) return value.toISOString()
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function isAdvancedSearchField<TFilterSchema>(
  field: FilterDefinition<TFilterSchema, keyof TFilterSchema>,
): field is AdvancedSearchField<TFilterSchema> {
  return field.type === "text" || field.type === "select" || field.type === "multi-select"
}

function getFieldTypeLabel(type: AdvancedFieldType): string {
  if (type === "select") return "单选"
  if (type === "multi-select") return "多选"
  return "文本"
}

function normalizeKeyword(value: string): string {
  return value.trim().toLocaleLowerCase()
}

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

  const [draftValue, setDraftValue] = useState("")
  const [fieldPickerOpen, setFieldPickerOpen] = useState(false)
  const [valuePickerOpen, setValuePickerOpen] = useState(false)
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null)
  const [optionKeyword, setOptionKeyword] = useState("")
  const [pendingMultiValues, setPendingMultiValues] = useState<unknown[]>([])
  const [activeOptionIndex, setActiveOptionIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const isOpeningValuePickerRef = useRef(false)

  const searchableFields = useMemo(
    () => advancedFields.filter((field) => isAdvancedSearchField(field)),
    [advancedFields],
  )
  const activeField = useMemo(() => {
    if (!activeFieldKey) return null
    return searchableFields.find((field) => String(field.key) === activeFieldKey) ?? null
  }, [activeFieldKey, searchableFields])
  const optionEntries = useMemo(() => {
    return (activeField?.options ?? []).map((option) => ({
      key: serializeOptionValue(option.value),
      option,
    }))
  }, [activeField])
  const filteredOptionEntries = useMemo(() => {
    const keyword = normalizeKeyword(optionKeyword)
    if (keyword === "") return optionEntries
    return optionEntries.filter((entry) => normalizeKeyword(entry.option.label).includes(keyword))
  }, [optionEntries, optionKeyword])

  const resetAdvancedDraft = () => {
    setDraftValue("")
    setOptionKeyword("")
    setPendingMultiValues([])
    setActiveFieldKey(null)
    setValuePickerOpen(false)
    setActiveOptionIndex(0)
    isOpeningValuePickerRef.current = false
  }

  const resetNonTextFieldContext = () => {
    setValuePickerOpen(false)
    setPendingMultiValues([])
    setActiveFieldKey(null)
    setOptionKeyword("")
    setActiveOptionIndex(0)
    isOpeningValuePickerRef.current = false
  }

  const handleSelectField = (field: AdvancedSearchField<TFilterSchema>) => {
    setActiveFieldKey(String(field.key))
    setFieldPickerOpen(false)
    setDraftValue("")
    setOptionKeyword("")
    setPendingMultiValues([])
    setActiveOptionIndex(0)

    if (field.type === "text") {
      isOpeningValuePickerRef.current = false
      setValuePickerOpen(false)
      return
    }
    if (field.type === "multi-select") {
      const currentValue = dt.filters.state[field.key]
      const nextPending = Array.isArray(currentValue) ? [...currentValue] : []
      setPendingMultiValues(nextPending)
    }
    isOpeningValuePickerRef.current = true
    setValuePickerOpen(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      isOpeningValuePickerRef.current = false
    })
  }

  const commitFreeText = () => {
    const nextValue = draftValue.trim()
    if (nextValue === "") return
    dt.filters.set(filterKey, nextValue as TFilterSchema[keyof TFilterSchema])
    resetAdvancedDraft()
  }

  const commitTextField = () => {
    if (!activeField || activeField.type !== "text") return
    const nextValue = draftValue.trim()
    if (nextValue === "") return
    dt.filters.set(activeField.key, nextValue as TFilterSchema[keyof TFilterSchema])
    resetAdvancedDraft()
  }

  const commitSelectField = (optionValue: unknown) => {
    if (!activeField || activeField.type !== "select") return
    dt.filters.set(activeField.key, optionValue as TFilterSchema[keyof TFilterSchema])
    resetAdvancedDraft()
  }

  const commitMultiField = () => {
    if (!activeField || activeField.type !== "multi-select") return
    dt.filters.set(activeField.key, pendingMultiValues as TFilterSchema[keyof TFilterSchema])
    resetAdvancedDraft()
  }

  const togglePendingMultiValue = (optionValue: unknown) => {
    setPendingMultiValues((prev) => {
      const exists = prev.some((value) => areValuesEqual(value, optionValue))
      if (!exists) return [...prev, optionValue]
      return prev.filter((value) => !areValuesEqual(value, optionValue))
    })
  }

  const handleAdvancedInputChange = (nextValue: string) => {
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

  const handleAdvancedClear = () => {
    if (activeField) {
      resetAdvancedDraft()
      return
    }
    setDraftValue("")
    setOptionKeyword("")
  }

  const handleAdvancedKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
        togglePendingMultiValue(next.option.value)
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

    if (activeField.type === "select") {
      if (!hasOptions) return
      const next = filteredOptionEntries[activeOptionIndex] ?? filteredOptionEntries[0]
      if (!next) return
      commitSelectField(next.option.value)
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
  const fieldButtonClassName = cn(
    "h-7 shrink-0 gap-1 px-2 text-xs font-medium transition-colors",
    activeField
      ? "bg-primary/10 text-primary hover:bg-primary/15"
      : "bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground",
  )
  const fieldChevronClassName = cn(
    "h-3.5 w-3.5 transition-colors",
    activeField ? "text-primary/80" : "text-muted-foreground",
  )

  return (
    <Popover
      open={Boolean(activeField && activeField.type !== "text" && valuePickerOpen)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isOpeningValuePickerRef.current) {
          return
        }
        setValuePickerOpen(nextOpen)
        if (!nextOpen && activeField && activeField.type !== "text") {
          resetNonTextFieldContext()
        }
      }}
    >
      <PopoverAnchor asChild>
        <div className={cn("w-full max-w-3xl", className)}>
          <div className="flex h-9 w-full items-center rounded-md border border-input bg-background px-2">
            <Search className="ml-1 mr-2 h-4 w-4 shrink-0 text-muted-foreground" />

            <Popover open={fieldPickerOpen} onOpenChange={setFieldPickerOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className={fieldButtonClassName}>
                  <span className="max-w-24 truncate">{activeField?.label ?? "筛选字段"}</span>
                  <ChevronDown className={fieldChevronClassName} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-0">
                <Command>
                  <CommandInput
                    placeholder="搜索筛选字段"
                    className="border-0 shadow-none focus-visible:ring-0 focus-visible:outline-none"
                  />
                  <CommandList>
                    <CommandEmpty>暂无匹配字段</CommandEmpty>
                    <CommandGroup heading="可用字段">
                      {searchableFields.map((field) => (
                        <CommandItem
                          key={String(field.key)}
                          onSelect={() => handleSelectField(field)}
                        >
                          <span className="truncate">{field.label}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {getFieldTypeLabel(field.type)}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <span className="mx-2 h-4 w-px shrink-0 bg-border/70" />

            <Input
              ref={inputRef}
              value={advancedDisplayValue}
              onChange={(event) => handleAdvancedInputChange(event.target.value)}
              onKeyDown={handleAdvancedKeyDown}
              onFocus={() => {
                if (activeField && activeField.type !== "text") {
                  setValuePickerOpen(true)
                }
              }}
              placeholder={resolvedPlaceholder}
              className={cn(
                "h-auto min-w-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0",
                inputClassName,
              )}
            />
            {canClear ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="ml-1 h-6 w-6 shrink-0"
                onClick={handleAdvancedClear}
                aria-label={i18n.clearSearchAriaLabel}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent align="start" className="w-[min(420px,92vw)] p-3">
        {activeField?.type === "select" ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">选择{activeField.label}</p>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {filteredOptionEntries.length === 0 ? (
                <p className="py-5 text-center text-sm text-muted-foreground">暂无匹配选项</p>
              ) : (
                filteredOptionEntries.map((entry, index) => {
                  const checked = areValuesEqual(
                    dt.filters.state[activeField.key],
                    entry.option.value,
                  )
                  const focused = normalizedOptionIndex >= 0 && index === normalizedOptionIndex
                  return (
                    <Button
                      key={entry.key}
                      type="button"
                      variant="ghost"
                      className={cn(
                        "h-8 w-full justify-between px-2 focus-visible:border-transparent focus-visible:ring-0",
                        focused ? "bg-accent text-accent-foreground" : null,
                      )}
                      onMouseEnter={() => setActiveOptionIndex(index)}
                      onClick={() => commitSelectField(entry.option.value)}
                    >
                      <span>{entry.option.label}</span>
                      {checked ? <Check className="h-4 w-4 text-primary" /> : null}
                    </Button>
                  )
                })
              )}
            </div>
          </div>
        ) : null}

        {activeField?.type === "multi-select" ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">选择{activeField.label}</p>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {filteredOptionEntries.length === 0 ? (
                <p className="py-5 text-center text-sm text-muted-foreground">暂无匹配选项</p>
              ) : (
                filteredOptionEntries.map((entry, index) => {
                  const checked = pendingMultiValues.some((value) =>
                    areValuesEqual(value, entry.option.value),
                  )
                  const focused = normalizedOptionIndex >= 0 && index === normalizedOptionIndex
                  return (
                    <button
                      key={entry.key}
                      type="button"
                      className={cn(
                        "hover:bg-accent flex h-8 w-full items-center justify-between rounded-sm px-2 text-sm outline-none",
                        focused ? "bg-accent text-accent-foreground" : null,
                      )}
                      onMouseEnter={() => setActiveOptionIndex(index)}
                      onClick={() => togglePendingMultiValue(entry.option.value)}
                    >
                      <span>{entry.option.label}</span>
                      <Checkbox checked={checked} />
                    </button>
                  )
                })
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-border/50 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetNonTextFieldContext()
                }}
              >
                取消
              </Button>
              <Button type="button" size="sm" onClick={commitMultiField}>
                确认
              </Button>
            </div>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
