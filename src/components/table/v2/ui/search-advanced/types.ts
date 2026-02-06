import type { FilterDefinition } from "../../core"

export type AdvancedFieldType =
  | "text"
  | "select"
  | "multi-select"
  | "boolean"
  | "number-range"
  | "date"
  | "date-range"

export type AdvancedSearchField<TFilterSchema> = FilterDefinition<
  TFilterSchema,
  keyof TFilterSchema
> & {
  type: AdvancedFieldType
}

export interface AdvancedOptionEntry {
  key: string
  option: {
    label: string
    value: unknown
  }
}

export function isAdvancedSearchField<TFilterSchema>(
  field: FilterDefinition<TFilterSchema, keyof TFilterSchema>,
): field is AdvancedSearchField<TFilterSchema> {
  return (
    field.type === "text" ||
    field.type === "select" ||
    field.type === "multi-select" ||
    field.type === "boolean" ||
    field.type === "number-range" ||
    field.type === "date" ||
    field.type === "date-range"
  )
}
