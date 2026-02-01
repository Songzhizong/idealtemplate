export interface User {
	id: string
	username: string
	email: string
	phone: string
	userGroups: string[] // 改为数组支持多个用户组
	status: "active" | "inactive"
	mfaEnabled: boolean
	lastVisit: string
}

export const UserStatusEnum = {
	active: "正常",
	inactive: "未启用",
} as const

export const UserGroupEnum = {
	admin: "管理员",
	user: "普通用户",
	guest: "访客",
	developer: "开发者",
	analyst: "分析师",
	support: "客服",
} as const
