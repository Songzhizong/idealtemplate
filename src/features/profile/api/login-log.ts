import { api } from "@/lib/api-client"
import type { PageInfo } from "@/types/pagination"

export namespace Api {
	export namespace LoginLog {
		/** 登录渠道枚举 */
		export enum LoginChannel {
			PASSWORD = "PASSWORD",
			SMS = "SMS",
			DELEGATED_ACCESS = "DELEGATED_ACCESS",
			PASSKEY = "PASSKEY",
			IDP = "IDP",
		}

		/** 登录日志VO */
		export interface LoginLogVO {
			id: number | string
			platform: string
			userId: number | string
			tenantId: number | string
			channel: LoginChannel
			clientId: string
			clientName: string
			loginIp: string
			loginLocation: string
			userAgent: string
			device: string
			providerId?: string | null
			providerName?: string | null
			loginTime: string | number
			success?: boolean
		}

		export type LoginLogList = PageInfo<LoginLogVO>
	}
}

/**
 * 获取当前用户的登录日志
 *
 * @param params 查询参数
 */
export async function fetchCurrentUserLoginLog(params: {
	pageNumber?: number | null
	pageSize?: number | null
	loginTimeStart?: number | null
	loginTimeEnd?: number | null
}): Promise<Api.LoginLog.LoginLogList> {
	return api
		.withTenantId()
		.get("nexus-api/iam/login-log/current-user", {
			searchParams: params as Record<string, string | number | boolean>,
		})
		.json()
}
