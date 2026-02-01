import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client.ts"
import type { UserProfile } from "@/types/auth.ts"

/**
 * Fetcher - 获取当前登录用户个人信息
 */
const getUserProfile = async (): Promise<UserProfile> => {
	const json = await api.get("nexus-api/iam/me/profile").json()
	return json as UserProfile
}

/**
 * React Query Hook - 获取用户个人信息
 * @param options.enabled - 是否启用查询，默认为false，需要手动触发
 * @example
 * const { data, isLoading, refetch } = useUserProfile({ enabled: false })
 * // 手动获取用户信息
 * const handleRefresh = () => refetch()
 */
export const useUserProfile = (options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ["auth", "user-profile"],
		queryFn: getUserProfile,
		staleTime: 60 * 1000, // 1分钟内不重新请求
		retry: false, // 401 时不重试
		enabled: options?.enabled ?? true, // 默认不自动执行
	})
}

/**
 * 手动获取用户信息的函数
 * 可在非React环境中使用
 */
export const fetchUserProfile = getUserProfile
