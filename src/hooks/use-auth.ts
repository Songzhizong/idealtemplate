import { useEffect } from "react"
import { useLogoutHandler } from "@/hooks/use-logout-handler"
import { useUserProfile } from "@/lib/auth-api/get-current-user"
import { useAuthStore } from "@/lib/auth-store"

/**
 * Unified Auth Hook
 * 整合所有认证相关功能的便捷 Hook
 *
 * @example
 * const { user, isAuthenticated, hasPermission, logout } = useAuth()
 */
export function useAuth() {
	const authStore = useAuthStore()
	const currentUserQuery = useUserProfile()
	const { handleLogout, isLoggingOut } = useLogoutHandler()

	// 自动同步后端用户信息到 Store（仅在已登录时）
	useEffect(() => {
		if (authStore.isAuthenticated && currentUserQuery.data) {
			authStore.setUser(currentUserQuery.data)
		}
	}, [currentUserQuery.data, authStore.isAuthenticated, authStore])

	return {
		// State
		user: authStore.user,
		token: authStore.token,
		permissions: authStore.permissions,
		isAuthenticated: authStore.isAuthenticated,

		// Loading States
		isLoadingUser: currentUserQuery.isLoading,
		isLoggingOut,

		// Permission Checks
		hasPermission: authStore.hasPermission,
		hasAnyPermission: authStore.hasAnyPermission,
		hasAllPermissions: authStore.hasAllPermissions,

		// Actions
		logout: handleLogout,

		// Store Actions (直接暴露，用于特殊场景)
		setToken: authStore.setToken,
		setUser: authStore.setUser,
		setPermissions: authStore.setPermissions,

		// Query Utilities
		refetchUser: currentUserQuery.refetch,
	}
}
