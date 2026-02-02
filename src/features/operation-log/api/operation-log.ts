import { api } from "@/lib/api-client"
import type { PageInfo } from "@/types/pagination"

export namespace Api {
	export enum ActionType {
		ADD = "ADD",
		UPDATE = "UPDATE",
		DELETE = "DELETE",
		READ = "READ",
		ASSIGN = "ASSIGN",
		REVOKE = "REVOKE",
		IMPORT = "IMPORT",
		EXPORT = "EXPORT",
		UPLOAD = "UPLOAD",
		DOWNLOAD = "DOWNLOAD",
		OTHER = "OTHER",
	}

	export namespace OperationLog {
		export interface SearchParams {
			pageNumber?: number | null
			pageSize?: number | null
			userId?: string | null
			resourceId?: string | null
			traceId?: string | null
			success?: "true" | "false" | null
			actionType?: ActionType | null
			sensitive?: "true" | "false" | null
			minDurationMs?: number | null
			clientIp?: string | null
			startTimeMs?: number | null
			endTimeMs?: number | null
		}

		export interface SimpleLog {
			id: string
			system: string
			moduleCode?: string | null
			moduleName?: string | null
			actionName: string
			actionType: ActionType
			sensitive: boolean
			userId?: string | null
			userDisplayName?: string | null
			userAccount?: string | null
			tenantId?: string | null
			traceId?: string | null
			containerId?: string | null
			originalContainerId?: string | null
			resourceType?: string | null
			resourceId?: string | null
			resourceName?: string | null
			originalResourceName?: string | null
			resourceTenantId?: string | null
			httpMethod?: string | null
			path?: string | null
			clientIp?: string | null
			clientLocation?: string | null
			success: boolean
			duration: number
			operationTime: number | string
		}

		export interface DetailLog extends SimpleLog {
			remark?: string | null
			schema?: string | null
			modification?: Modification | ModifiedFields | null
			userAgent?: string | null
			extra?: unknown | null
			errorMessage?: string | null
			resourceSnapshot?: unknown | null
			modifiedResourceSnapshot?: unknown | null
			request?: unknown | null
			response?: unknown | null
		}
	}

	export interface Modification {
		schema?: string | null
	}

	export interface ModifiedFields extends Modification {
		modifiedFields: ModifiedBase[]
	}

	export interface ModifiedBase {
		type: string
		ident: string
	}

	export interface ModifiedField extends ModifiedBase {
		value?: string | null
		displayValue?: string | null
		modifiedValue?: string | null
		displayModifiedValue?: string | null
	}

	export interface ModifiedCollection extends ModifiedBase {
		additions: ModifiedCollectionItem[]
		deletions: ModifiedCollectionItem[]
	}

	export interface ModifiedCollectionItem {
		value: string
		displayValue?: string | null
	}
}

const normalizeParams = (params: Api.OperationLog.SearchParams) => {
	const normalized: Record<string, string | number | boolean> = {}

	for (const [key, value] of Object.entries(params)) {
		if (value === null || value === undefined || value === "") continue
		if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
			normalized[key] = value
		}
	}

	return normalized
}

export async function fetchOperationLogList(
	params: Api.OperationLog.SearchParams,
): Promise<PageInfo<Api.OperationLog.SimpleLog>> {
	return api
		.withTenantId()
		.get("nexus-api/audit/tenant/logs", {
			searchParams: normalizeParams(params),
		})
		.json()
}

export async function fetchOperationLogDetail(id: string): Promise<Api.OperationLog.DetailLog> {
	return api.withTenantId().get(`nexus-api/audit/tenant/logs/${id}/detail`).json()
}
