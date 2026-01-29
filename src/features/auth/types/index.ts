import { z } from "zod"
import { PermissionSchema, type UserProfile } from "@/types/auth"

/**
 * User Schema - 当前登录用户信息
 */
export const UserSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	name: z.string(),
	avatar: z.string().url().optional(),
	role: z.string(), // 如 "admin", "user", "guest"
})

/**
 * Auth Response Schema - 登录接口返回
 */
export const AuthResponseSchema = z.object({
	token: z.string(),
	user: UserSchema,
	permissions: z.array(PermissionSchema),
})

// Type Inference
export type Permission = z.infer<typeof PermissionSchema>
export type User = z.infer<typeof UserSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
