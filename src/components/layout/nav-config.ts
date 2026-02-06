import { FolderOpen, LayoutGrid, type LucideIcon, Table, Users } from "lucide-react"
import { PERMISSIONS } from "@/config/permissions"

export type NavItem = {
	title: string
	to: string
	icon: LucideIcon
	permission?: string
	children?: readonly NavItem[]
}

export const PRIMARY_NAV: readonly NavItem[] = [
	{ title: "控制台", to: "/", icon: LayoutGrid, permission: PERMISSIONS.DASHBOARD_VIEW },
	{
		title: "文件管理",
		to: "/file-management",
		icon: FolderOpen,
		permission: PERMISSIONS.FILE_MANAGEMENT_VIEW,
	},
	{ title: "用户管理", to: "/users", icon: Users, permission: PERMISSIONS.USERS_READ },
	{
		title: "示例",
		to: "/example",
		icon: Table,
		children: [
			{
				title: "表格",
				to: "/example/table-v2-demo",
				icon: Table, // Sub-items might not need icon, but type requires it currently
			},
		],
	},
]

export const SECONDARY_NAV: readonly NavItem[] = []

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV] as const
