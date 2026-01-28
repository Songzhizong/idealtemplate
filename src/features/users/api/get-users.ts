import { api } from "@/lib/api-client"
import { createPageInfoSchema, type PageInfo } from "@/types/pagination"
import { type User, UserSchema } from "../types"

const UserPageSchema = createPageInfoSchema(UserSchema)

export interface GetUsersParams {
	pageNumber: number
	pageSize: number
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
