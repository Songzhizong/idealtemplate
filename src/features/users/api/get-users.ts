import { api } from "@/lib/api-client"
import { createPageInfoSchema, type PageInfo } from "@/types/pagination"
import { type User, UserSchema } from "../types"

const UserPageSchema = createPageInfoSchema(UserSchema)

export interface GetUsersParams {
	pageNumber: number
	pageSize: number
	username?: string
	status?: string
	mfaEnabled?: string
	email?: string
	phone?: string
	userGroup?: string
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
	if (params.mfaEnabled && params.mfaEnabled !== "all")
		searchParams.mfaEnabled = params.mfaEnabled
	if (params.email) searchParams.email = params.email
	if (params.phone) searchParams.phone = params.phone
	if (params.userGroup && params.userGroup !== "all") searchParams.userGroup = params.userGroup

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

	return UserPageSchema.parse(response)
}
