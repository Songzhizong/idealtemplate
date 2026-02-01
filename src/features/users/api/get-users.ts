import { api } from "@/lib/api-client"
import type { PageInfo } from "@/types/pagination"
import type { User } from "../types"

export interface GetUsersParams {
	pageNumber: number
	pageSize: number
	username?: string
	status?: string
	mfaEnabled?: string
	email?: string
	phone?: string
	userGroups?: string // 更新为 userGroups
	sorting?: {
		field?: string
		order?: "asc" | "desc"
	}
}

export async function getUsers(params: GetUsersParams): Promise<PageInfo<User>> {
	const searchParams: Record<string, string | number> = {
		pageNumber: params.pageNumber,
		pageSize: params.pageSize,
	}

	if (params.username) searchParams.username = params.username
	if (params.status && params.status !== "all") searchParams.status = params.status
	if (params.mfaEnabled && params.mfaEnabled !== "all") searchParams.mfaEnabled = params.mfaEnabled
	if (params.email) searchParams.email = params.email
	if (params.phone) searchParams.phone = params.phone
	if (params.userGroups && params.userGroups !== "all") searchParams.userGroups = params.userGroups

	// 添加排序参数
	if (params.sorting?.field && params.sorting?.order) {
		searchParams.sortField = params.sorting.field
		searchParams.sortOrder = params.sorting.order
	}

	const response = await api
		.get("users", {
			searchParams,
		})
		.json()

	return response as PageInfo<User>
}
