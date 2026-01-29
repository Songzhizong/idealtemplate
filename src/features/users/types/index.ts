import { z } from "zod"

export const UserSchema = z.object({
	id: z.string(),
	username: z.string(),
	email: z.string().email(),
	phone: z.string(),
	userGroups: z.array(z.string()), // 改为数组支持多个用户组
	status: z.enum(["active", "inactive"]),
	mfaEnabled: z.boolean(),
	lastVisit: z.string(),
})

export type User = z.infer<typeof UserSchema>

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
