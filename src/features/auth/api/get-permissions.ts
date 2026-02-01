import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { env } from "@/lib/env"

/**
 * Permission Identifiers Type
 * 权限标识符列表（字符串数组）
 */
export type PermissionIdents = string[]

/**
 * Fetcher - 获取当前应用的可用权限列表
 * 需要在请求头中携带 x-tenant-id
 */
const getPermissions = async (): Promise<PermissionIdents> => {
	const appId = env.VITE_APP_ID
	const url = `nexus-api/iam/front/apps/${appId}/available-permission-idents`
	const json = await api.withTenantId().get(url).json()
	return json as PermissionIdents
}

/**
 * React Query Hook - 获取用户权限列表
 * @param options.enabled - 是否启用查询，默认为false，需要手动触发
 * @example
 * const { data: permissions, isLoading, refetch } = usePermissions({ enabled: false })
 * // 手动获取权限信息
 * const handleRefresh = () => refetch()
 */
export const usePermissions = (options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ["auth", "permissions"],
		queryFn: getPermissions,
		staleTime: 60 * 1000, // 1分钟内不重新请求
		retry: false, // 401 时不重试
		enabled: options?.enabled ?? false, // 默认不自动执行
	})
}

/**
 * 手动获取权限信息的函数
 * 可在非React环境中使用
 */
export const fetchPermissions = getPermissions
