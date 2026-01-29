import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "@/lib/api-client"

/**
 * Logout Response Schema
 */
export const LogoutResponseSchema = z.object({
	logoutIframeUris: z.array(z.string()),
})

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>

/**
 * Fetcher - 登出接口（通知后端清除 Session）
 */
const logout = async (): Promise<LogoutResponse> => {
	const response = await api.post("nexus-api/iam/logout").json()
	return LogoutResponseSchema.parse(response)
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
