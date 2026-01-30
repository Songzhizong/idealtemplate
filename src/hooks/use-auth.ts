import { useAuthContext } from "@/context/auth-context"
import { useLogoutHandler } from "@/hooks/use-logout-handler"
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
	const { isLoadingUser, refetchUser } = useAuthContext()

	// Use custom handler for orchestration
	const { handleLogout, isLoggingOut } = useLogoutHandler()

	return {
		// State (Read from Store usually, but Context has synced user)
		// We can return store versions to be consistent with original behavior or context versions.
		// Original returned store versions. Context and Store are synced in AuthProvider.
		user: authStore.user,
		token: authStore.token,
		permissions: authStore.permissions,
		isAuthenticated: authStore.isAuthenticated,

		// Loading States
		isLoadingUser,
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
		refetchUser,
	}
}
