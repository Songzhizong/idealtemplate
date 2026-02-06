import type { AdvancedFieldType } from "./types"

export type NumberRangeValue = { min: number | undefined; max: number | undefined }
export type DateRangeValue = { from: Date | undefined; to: Date | undefined }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function areValuesEqual(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }
  return Object.is(a, b)
}

export function serializeOptionValue(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (value instanceof Date) return value.toISOString()
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

export function getFieldTypeLabel(type: AdvancedFieldType): string {
  if (type === "select") return "单选"
  if (type === "multi-select") return "多选"
  if (type === "boolean") return "布尔"
  if (type === "number-range") return "区间"
  if (type === "date") return "日期"
  if (type === "date-range") return "日期区间"
  return "文本"
}

export function normalizeKeyword(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function parseNumberInput(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return undefined
  return parsed
}

export function parseNumberRange(value: unknown): NumberRangeValue {
  if (isRecord(value)) {
    const min = typeof value.min === "number" ? value.min : undefined
    const max = typeof value.max === "number" ? value.max : undefined
    return { min, max }
  }
  if (Array.isArray(value)) {
    const [min, max] = value
    return {
      min: typeof min === "number" ? min : undefined,
      max: typeof max === "number" ? max : undefined,
    }
  }
  return { min: undefined, max: undefined }
}

export function isDateValue(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

export function parseDateRange(value: unknown): DateRangeValue | undefined {
  if (Array.isArray(value)) {
    const [from, to] = value
    if (isDateValue(from) || isDateValue(to)) {
      return {
        from: isDateValue(from) ? from : undefined,
        to: isDateValue(to) ? to : undefined,
      }
    }
  }
  if (isRecord(value)) {
    const from = value.from
    const to = value.to
    if (isDateValue(from) || isDateValue(to)) {
      return {
        from: isDateValue(from) ? from : undefined,
        to: isDateValue(to) ? to : undefined,
      }
    }
  }
  return undefined
}
