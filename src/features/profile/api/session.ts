import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"

/**
 * Session Interface
 */
export interface Session {
	id: string
	loginIp: string
	location?: string | null
	device: string
	loginChannel: string
	latestActivity: number
	createdTime: number
}

export interface MySession extends Session {
	current: boolean
}

/**
 * 获取当前用户的活动会话列表
 */
export const fetchGetMySessions = async (): Promise<MySession[]> => {
	const data = await api.withTenantId().get("nexus-api/iam/me/sessions").json()
	return data as MySession[]
}

/**
 * 注销指定会话
 */
export const fetchDeleteMySession = async (sessionId: string): Promise<void> => {
	await api.delete(`nexus-api/iam/me/sessions/${sessionId}`)
}

/**
 * Hook - 获取我的会话
 */
export const useMySessions = () => {
	return useQuery({
		queryKey: ["my-sessions"],
		queryFn: fetchGetMySessions,
	})
}

/**
 * Hook - 注销会话
 */
export const useDeleteSession = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: fetchDeleteMySession,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["my-sessions"] })
		},
	})
}
