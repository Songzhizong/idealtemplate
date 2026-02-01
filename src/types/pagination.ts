/**
 * 通用分页响应模式与后端PageInfo<E>匹配
 */
export interface PageInfo<T> {
	pageNumber: number
	pageSize: number
	totalElements: number
	totalPages: number
	content: T[]
}

/**
 * 分页请求参数，匹配后端 Paging 类
 */
export interface Paging {
	pageNumber: number
	pageSize: number
}
