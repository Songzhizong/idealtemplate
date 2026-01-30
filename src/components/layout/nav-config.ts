import { LayoutGrid, Users } from "lucide-react"

export const PRIMARY_NAV = [
	{ title: "控制台", to: "/", icon: LayoutGrid },
	{ title: "用户管理", to: "/users", icon: Users, permission: "users:read" },
] as const

export const SECONDARY_NAV = [] as const

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV] as const

export type NavItem = (typeof ALL_NAV)[number]
