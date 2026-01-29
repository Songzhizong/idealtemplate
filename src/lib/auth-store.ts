import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Permission, UserProfile } from "@/types/auth"

type AuthState = {
	// State
	token: string | null
	user: UserProfile | null
	permissions: Permission[]
	isAuthenticated: boolean
	tenantId: string | null

	// Actions - Auth Flow
	login: (data: { token: string; user: UserProfile; permissions: Permission[] }) => void
	setToken: (token: string) => void
	setUser: (user: UserProfile) => void
	setPermissions: (permissions: Permission[]) => void
	logout: () => void
	setTenantId: (tenantId: string | null) => void

	// Actions - Permission Management
	hasPermission: (permission: Permission) => boolean
	hasAnyPermission: (permissions: Permission[]) => boolean
	hasAllPermissions: (permissions: Permission[]) => boolean
}

/**
 * Auth Store - 认证状态管理
 *
 * 这是一个 Zustand Store，既可以作为 React Hook 使用，也可以通过 .getState() 在任何地方使用。
 * 属于全局共享基础设施，不依赖于任何 feature。
 *
 * @example
 * // 在 React 组件中使用（作为 Hook）
 * const { token, isAuthenticated } = useAuthStore()
 *
 * @example
 * // 在非 React 环境中使用（如 api-client.ts）
 * const token = authStore.getState().token
 */
export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			// Initial State
			token: null,
			user: null,
			permissions: [],
			isAuthenticated: false,
			tenantId: null,

			/**
			 * 登录成功后调用，一次性设置所有认证信息
			 * persist 中间件会自动处理 localStorage 存储
			 */
			login: ({ token, user, permissions }) => {
				set({
					token,
					user,
					permissions,
					isAuthenticated: true,
					tenantId: user.tenantId,
				})
			},

			/**
			 * 设置访问令牌
			 */
			setToken: (token) => {
				set({ token, isAuthenticated: true })
			},

			/**
			 * 设置用户信息
			 */
			setUser: (user) => {
				set({ user, tenantId: user.tenantId })
			},

			/**
			 * 设置权限列表
			 */
			setPermissions: (permissions) => {
				set({ permissions })
			},

			/**
			 * 登出，清空所有认证信息
			 * persist 中间件会自动清理 localStorage
			 */
			logout: () => {
				set({
					token: null,
					user: null,
					permissions: [],
					isAuthenticated: false,
					tenantId: null,
				})
			},

			/**
			 * 设置当前租户 ID
			 * @param tenantId - 租户 ID
			 */
			setTenantId: (tenantId) => {
				set({ tenantId })
			},

			/**
			 * 检查用户是否拥有指定权限
			 * @param permission - 权限标识符（如 "user:read"）
			 */
			hasPermission: (permission) => {
				const { permissions } = get()
				return permissions.includes(permission)
			},

			/**
			 * 检查用户是否拥有任意一个权限（OR 逻辑）
			 * @param permissions - 权限列表
			 */
			hasAnyPermission: (permissions) => {
				const userPermissions = get().permissions
				return permissions.some((p) => userPermissions.includes(p))
			},

			/**
			 * 检查用户是否拥有所有权限（AND 逻辑）
			 * @param permissions - 权限列表
			 */
			hasAllPermissions: (permissions) => {
				const userPermissions = get().permissions
				return permissions.every((p) => userPermissions.includes(p))
			},
		}),
		{
			name: "auth-storage", // LocalStorage key
			partialize: (state) => ({
				// 只持久化这些字段
				token: state.token,
				user: state.user,
				permissions: state.permissions,
				isAuthenticated: state.isAuthenticated,
				tenantId: state.tenantId,
			}),
		},
	),
)

/**
 * authStore - 非 Hook 版本
 * 在非 React 环境中使用（如 api-client 配置）
 */
export const authStore = useAuthStore
