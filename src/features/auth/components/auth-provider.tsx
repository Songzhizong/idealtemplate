import { type ReactNode, useEffect, useMemo } from "react"
import type { AuthContextType } from "@/context/auth-context"
import { AuthContext } from "@/context/auth-context"
import { useUserProfile } from "@/features/auth/api/get-current-user"
import { useLogout } from "@/features/auth/api/logout"
import { useAuthStore } from "@/lib/auth-store"

interface AuthProviderProps {
	children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
	// Use atomic selectors to avoid unnecessary re-renders and infinite loops
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
	const user = useAuthStore((state) => state.user)
	const setUser = useAuthStore((state) => state.setUser)

	const currentUserQuery = useUserProfile()
	const logoutMutation = useLogout()

	// Sync user data to store
	useEffect(() => {
		if (isAuthenticated && currentUserQuery.data) {
			// Only update if data is different to avoid potential loops if strict equality fails (though setUser is stable)
			// But here the issue was the dependency on the whole store object
			setUser(currentUserQuery.data)
		}
	}, [currentUserQuery.data, isAuthenticated, setUser])

	const contextValue = useMemo<AuthContextType>(
		() => ({
			isAuthenticated,
			user,
			isLoadingUser: currentUserQuery.isLoading,
			refetchUser: currentUserQuery.refetch,
			logout: async () => {
				return await logoutMutation.mutateAsync()
			},
			isLoggingOut: logoutMutation.isPending,
		}),
		[
			isAuthenticated,
			user,
			currentUserQuery.isLoading,
			currentUserQuery.refetch,
			logoutMutation.mutateAsync,
			logoutMutation.isPending,
		],
	)

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
