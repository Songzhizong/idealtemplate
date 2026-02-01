import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api-client.ts"

/**
 * Logout Response Interface
 */
export interface LogoutResponse {
	logoutIframeUris?: string[]
}

/**
 * Fetcher - 登出接口（通知后端清除 Session）
 */
const logout = async (): Promise<LogoutResponse> => {
	const response = await api.post("nexus-api/iam/logout").json()
	return response as LogoutResponse
}

/**
 * React Query Mutation Hook - 登出
 * @example
 * const logoutMutation = useLogout()
 * logoutMutation.mutate(undefined, {
 *   onSuccess: (data) => {
 *     // Load logout iframes if needed
 *     data.logoutIframeUris.forEach(uri => {
 *       const iframe = document.createElement('iframe')
 *       iframe.style.display = 'none'
 *       iframe.src = uri
 *       document.body.appendChild(iframe)
 *     })
 *     authStore.logout()
 *     navigate('/login')
 *   }
 * })
 */
export const useLogout = () => {
	return useMutation({
		mutationFn: logout,
	})
}
