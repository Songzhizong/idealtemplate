import { Search, X } from "lucide-react"
import { type KeyboardEvent, useEffect, useMemo, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { FilterDefinition } from "../core"
import { type DataTableI18nOverrides, mergeDataTableI18n, useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"
import { DataTableAdvancedSearch } from "./search-advanced"

function toTextValue(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

export interface DataTableSearchProps<TFilterSchema> {
  filterKey?: keyof TFilterSchema
  debounceMs?: number
  placeholder?: string
  className?: string
  inputClassName?: string
  i18n?: DataTableI18nOverrides
  mode?: "simple" | "advanced"
  advancedFields?: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
}

export function DataTableSearch<TFilterSchema>({
  filterKey,
  debounceMs = 300,
  placeholder,
  className,
  inputClassName,
  i18n: i18nOverrides,
  mode = "simple",
  advancedFields = [],
}: DataTableSearchProps<TFilterSchema>) {
  const dt = useDataTableInstance<unknown, TFilterSchema>()
  const { i18n: globalI18n } = useDataTableConfig()
  const key = (filterKey ?? "q") as keyof TFilterSchema
  const rawValue = dt.filters.state[key]
  const normalizedValue = useMemo(() => toTextValue(rawValue), [rawValue])
  const [simpleValue, setSimpleValue] = useState(normalizedValue)
  const advanced = mode === "advanced"

  const i18n = useMemo(() => {
    return mergeDataTableI18n(globalI18n, i18nOverrides)
  }, [globalI18n, i18nOverrides])

  const debouncedSetValue = useDebouncedCallback((nextValue: string) => {
    dt.filters.set(key, nextValue as TFilterSchema[keyof TFilterSchema])
  }, debounceMs)

  useEffect(() => {
    if (advanced) return
    setSimpleValue(normalizedValue)
    if (debounceMs > 0) {
      debouncedSetValue.cancel()
    }
  }, [advanced, debounceMs, debouncedSetValue, normalizedValue])

  useEffect(() => () => debouncedSetValue.cancel(), [debouncedSetValue])

  const handleChange = (nextValue: string) => {
    setSimpleValue(nextValue)
    if (debounceMs <= 0) {
      dt.filters.set(key, nextValue as TFilterSchema[keyof TFilterSchema])
      return
    }
    debouncedSetValue(nextValue)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || debounceMs <= 0) return
    debouncedSetValue.flush()
  }

  const handleClear = () => {
    setSimpleValue("")
    debouncedSetValue.cancel()
    dt.filters.set(key, "" as TFilterSchema[keyof TFilterSchema])
  }

  const resolvedSimplePlaceholder = placeholder ?? i18n.searchPlaceholder
  const canClearSimple = simpleValue.trim() !== ""

  if (advanced) {
    return (
      <DataTableAdvancedSearch<TFilterSchema>
        filterKey={key}
        placeholder={placeholder}
        className={className}
        inputClassName={inputClassName}
        i18n={i18nOverrides}
        advancedFields={advancedFields}
      />
    )
  }

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={simpleValue}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={resolvedSimplePlaceholder}
        className={cn("h-9 pl-9", canClearSimple ? "pr-9" : undefined, inputClassName)}
      />
      {canClearSimple ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2"
          onClick={handleClear}
          aria-label={i18n.clearSearchAriaLabel}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
