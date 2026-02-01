import type { Permission } from "@/types/auth"

/**
 * User Interface - 当前登录用户信息
 */
export interface User {
	id: string
	email: string
	name: string
	avatar?: string
	role: string // 如 "admin", "user", "guest"
}

/**
 * Auth Response Interface - 登录接口返回
 */
export interface AuthResponse {
	token: string
	user: User
	permissions: Permission[]
}
