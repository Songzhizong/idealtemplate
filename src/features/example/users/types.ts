export const DEMO_USER_STATUSES = ["active", "disabled", "locked"] as const
export type DemoUserStatus = (typeof DEMO_USER_STATUSES)[number]

export const DEMO_USER_ROLES = ["super_admin", "employee", "partner"] as const
export type DemoUserRole = (typeof DEMO_USER_ROLES)[number]

export const DEMO_USER_DEPARTMENTS = [
  "技术部",
  "产品部",
  "市场部",
  "运营部",
  "财务部",
  "人力资源",
  "安全合规",
  "供应商",
] as const
export type DemoUserDepartment = (typeof DEMO_USER_DEPARTMENTS)[number]

export interface DemoUser {
  id: string
  name: string
  email: string
  phone: string
  role: DemoUserRole
  department: DemoUserDepartment
  status: DemoUserStatus
  isOnline: boolean
  riskScore: number
  createdAt: string
  lastLoginAt: string
}

export interface DemoUserNumberRange {
  min: number | undefined
  max: number | undefined
}

export interface DemoUserDateRange {
  from: Date | undefined
  to: Date | undefined
}

export interface DemoUserFilters {
  q: string
  nameKeyword: string
  status: string | null
  role: string | null
  department: string | null
  isOnline: boolean | null
  riskScoreRange: DemoUserNumberRange | null
  createdAtDate: Date | null
  lastLoginRange: DemoUserDateRange | null
}
