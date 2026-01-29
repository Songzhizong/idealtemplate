import { z } from "zod"

/**
 * Permission Schema - 权限定义
 */
export const PermissionSchema = z.string()
export type Permission = z.infer<typeof PermissionSchema>

/**
 * Tenant Info Schema
 * 租户信息
 */
export const TenantInfoSchema = z.object({
	id: z.string(),
	name: z.string(),
	abbreviation: z.string(),
	blocked: z.boolean(),
})
export type TenantInfo = z.infer<typeof TenantInfoSchema>

/**
 * User Profile Schema
 * 用户个人信息
 */
export const UserProfileSchema = z.object({
	userId: z.string(),
	containerId: z.string().nullable(),
	name: z.string(),
	account: z.string().nullable(),
	phone: z.string().nullable(),
	email: z.string().nullable(),
	mfaEnabled: z.boolean(),
	tenantId: z.string().nullable(),
	tenantName: z.string().nullable(),
	tenantAbbreviation: z.string().nullable(),
	accessibleTenants: z.array(TenantInfoSchema),
})
export type UserProfile = z.infer<typeof UserProfileSchema>

/**
 * Auth Data - 登录成功后存储在 Store 中的数据结构
 */
export interface AuthData {
	token: string
	user: UserProfile
	permissions: Permission[]
}
