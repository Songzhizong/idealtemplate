import type { DataTableDataResult } from "@/components/table/v2"
import {
  DEMO_USER_DEPARTMENTS,
  DEMO_USER_ROLES,
  DEMO_USER_STATUSES,
  type DemoUser,
  type DemoUserDateRange,
  type DemoUserDepartment,
  type DemoUserFilters,
  type DemoUserNumberRange,
  type DemoUserRole,
  type DemoUserStatus,
} from "../types"

const CN_FAMILY_NAMES = [
  "赵",
  "钱",
  "孙",
  "李",
  "周",
  "吴",
  "郑",
  "王",
  "冯",
  "陈",
  "褚",
  "卫",
  "蒋",
  "沈",
  "韩",
  "杨",
  "朱",
  "秦",
  "尤",
  "许",
] as const

const CN_GIVEN_NAMES = [
  "子涵",
  "雨欣",
  "宇航",
  "梓轩",
  "若曦",
  "浩然",
  "思远",
  "欣怡",
  "明轩",
  "佳宁",
  "亦凡",
  "可心",
  "天佑",
  "嘉琪",
  "子墨",
  "安然",
] as const

const EMAIL_DOMAINS = ["infera.dev", "company.com", "example.com"] as const

function mulberry32(seed: number) {
  return () => {
    seed += 0x6d2b79f5
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: readonly T[], rnd: () => number): T {
  const index = Math.floor(rnd() * items.length)
  return items[index] as T
}

function toDigits(value: number, length: number) {
  return String(value).padStart(length, "0")
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isDateValue(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

function parseNumberRange(value: unknown): DemoUserNumberRange {
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
  return {
    min: undefined,
    max: undefined,
  }
}

function parseDateRange(value: unknown): DemoUserDateRange | undefined {
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

function startOfDayMs(value: Date): number {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function endOfDayMs(value: Date): number {
  const date = new Date(value)
  date.setHours(23, 59, 59, 999)
  return date.getTime()
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function isDemoUserStatus(value: string): value is DemoUserStatus {
  return (DEMO_USER_STATUSES as readonly string[]).includes(value)
}

function isDemoUserRole(value: string): value is DemoUserRole {
  return (DEMO_USER_ROLES as readonly string[]).includes(value)
}

function isDemoUserDepartment(value: string): value is DemoUserDepartment {
  return (DEMO_USER_DEPARTMENTS as readonly string[]).includes(value)
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "zh-CN")
}

function compareIsoTime(left: string, right: string): number {
  const leftTime = Date.parse(left)
  const rightTime = Date.parse(right)
  if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) return 0
  if (Number.isNaN(leftTime)) return 1
  if (Number.isNaN(rightTime)) return -1
  return leftTime - rightTime
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function createDemoUsers(count: number): DemoUser[] {
  const rnd = mulberry32(20250202)
  const now = Date.now()
  const users: DemoUser[] = []

  for (let index = 0; index < count; index += 1) {
    const id = `USR-${toDigits(index + 1, 4)}`
    const familyName = pick(CN_FAMILY_NAMES, rnd)
    const givenName = pick(CN_GIVEN_NAMES, rnd)
    const name = `${familyName}${givenName}`
    const department = pick(DEMO_USER_DEPARTMENTS, rnd)
    const role = pick(DEMO_USER_ROLES, rnd)
    const status = pick(DEMO_USER_STATUSES, rnd)

    const account = `${String.fromCharCode(97 + (index % 26))}${toDigits(index + 1, 4)}`
    const domain = pick(EMAIL_DOMAINS, rnd)
    const email = `${account}@${domain}`

    const phone = `1${3 + (index % 6)}${toDigits((index * 97) % 1000000000, 9)}`

    const createdDaysAgo = index < 24 ? Math.floor(rnd() * 7) : 7 + Math.floor(rnd() * 180)
    const lastLoginMinutesAgo = Math.floor(rnd() * 60 * 24 * 30)
    const createdAt = new Date(now - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString()
    const lastLoginAt = new Date(now - lastLoginMinutesAgo * 60 * 1000).toISOString()

    const isOnline = status === "active" && rnd() > 0.55
    const riskScore = Math.round(30 + rnd() * 70)

    users.push({
      id,
      name,
      email,
      phone,
      role,
      department,
      status,
      isOnline,
      riskScore,
      createdAt,
      lastLoginAt,
    })
  }

  return users
}

export const DEMO_USERS = createDemoUsers(220)

export function getDemoUserById(userId: string): DemoUser | null {
  const found = DEMO_USERS.find((user) => user.id === userId)
  return found ?? null
}

export function filterDemoUsers(rows: DemoUser[], filters: DemoUserFilters): DemoUser[] {
  let next = rows

  const status = filters.status
  if (status && status !== "all" && isDemoUserStatus(status)) {
    next = next.filter((row) => row.status === status)
  }

  const role = filters.role
  if (role && role !== "all" && isDemoUserRole(role)) {
    next = next.filter((row) => row.role === role)
  }

  const department = filters.department
  if (department && department !== "all" && isDemoUserDepartment(department)) {
    next = next.filter((row) => row.department === department)
  }

  const nameKeyword = normalizeText(filters.nameKeyword)
  if (nameKeyword !== "") {
    next = next.filter((row) => normalizeText(row.name).includes(nameKeyword))
  }

  if (typeof filters.isOnline === "boolean") {
    next = next.filter((row) => row.isOnline === filters.isOnline)
  }

  const riskScoreRange = parseNumberRange(filters.riskScoreRange)
  if (riskScoreRange.min != null || riskScoreRange.max != null) {
    next = next.filter((row) => {
      if (riskScoreRange.min != null && row.riskScore < riskScoreRange.min) return false
      if (riskScoreRange.max != null && row.riskScore > riskScoreRange.max) return false
      return true
    })
  }

  const createdAtDate = filters.createdAtDate
  if (isDateValue(createdAtDate)) {
    next = next.filter((row) => {
      const rowDate = new Date(row.createdAt)
      if (Number.isNaN(rowDate.getTime())) return false
      return isSameDay(rowDate, createdAtDate)
    })
  }

  const lastLoginRange = parseDateRange(filters.lastLoginRange)
  if (lastLoginRange?.from || lastLoginRange?.to) {
    const fromMs = lastLoginRange.from ? startOfDayMs(lastLoginRange.from) : null
    const toMs = lastLoginRange.to ? endOfDayMs(lastLoginRange.to) : null
    next = next.filter((row) => {
      const rowMs = Date.parse(row.lastLoginAt)
      if (Number.isNaN(rowMs)) return false
      if (fromMs != null && rowMs < fromMs) return false
      if (toMs != null && rowMs > toMs) return false
      return true
    })
  }

  const query = normalizeText(filters.q)
  if (!query) return next

  return next.filter((row) => {
    return (
      normalizeText(row.name).includes(query) ||
      normalizeText(row.email).includes(query) ||
      row.phone.includes(query)
    )
  })
}

type SortableField =
  | "name"
  | "email"
  | "phone"
  | "riskScore"
  | "role"
  | "department"
  | "status"
  | "createdAt"
  | "lastLoginAt"

function isSortableField(value: string): value is SortableField {
  return (
    value === "name" ||
    value === "email" ||
    value === "phone" ||
    value === "riskScore" ||
    value === "role" ||
    value === "department" ||
    value === "status" ||
    value === "createdAt" ||
    value === "lastLoginAt"
  )
}

const STATUS_ORDER: Record<DemoUserStatus, number> = {
  active: 0,
  disabled: 1,
  locked: 2,
}

const ROLE_ORDER: Record<DemoUserRole, number> = {
  super_admin: 0,
  employee: 1,
  partner: 2,
}

function compareByField(left: DemoUser, right: DemoUser, field: SortableField): number {
  switch (field) {
    case "createdAt":
    case "lastLoginAt":
      return compareIsoTime(left[field], right[field])
    case "status":
      return (STATUS_ORDER[left.status] ?? 0) - (STATUS_ORDER[right.status] ?? 0)
    case "role":
      return (ROLE_ORDER[left.role] ?? 0) - (ROLE_ORDER[right.role] ?? 0)
    case "riskScore":
      return left.riskScore - right.riskScore
    case "department":
    case "email":
    case "name":
    case "phone":
      return compareText(left[field], right[field])
    default:
      return 0
  }
}

export function sortDemoUsers(
  rows: DemoUser[],
  sort: { field: string; order: "asc" | "desc" }[],
): DemoUser[] {
  if (sort.length === 0) return rows
  const sorted = [...rows]

  sorted.sort((left, right) => {
    for (const item of sort) {
      if (!isSortableField(item.field)) continue
      const direction = item.order === "asc" ? 1 : -1
      const result = compareByField(left, right, item.field)
      if (result !== 0) return result * direction
    }
    return 0
  })

  return sorted
}

export function paginateDemoUsers(
  rows: DemoUser[],
  page: number,
  size: number,
): DataTableDataResult<DemoUser> {
  const safeSize = Math.max(1, size || 10)
  const safePage = Math.max(1, page || 1)
  const total = rows.length
  const pageCount = total === 0 ? 0 : Math.ceil(total / safeSize)
  const start = (safePage - 1) * safeSize
  const paged = rows.slice(start, start + safeSize)

  return {
    rows: paged,
    total,
    pageCount,
  }
}

export async function fetchDemoUsers(args: {
  page: number
  size: number
  sort: { field: string; order: "asc" | "desc" }[]
  filters: DemoUserFilters
}): Promise<DataTableDataResult<DemoUser>> {
  await delay(420)
  const filtered = filterDemoUsers(DEMO_USERS, args.filters)
  const sorted = sortDemoUsers(filtered, args.sort)
  return paginateDemoUsers(sorted, args.page, args.size)
}
