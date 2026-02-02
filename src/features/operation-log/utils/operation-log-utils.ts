import type { BadgeProps } from "@/components/ui/badge"
import { Api } from "@/features/operation-log/api/operation-log"

const actionTypeLabelMap: Record<Api.ActionType, string> = {
	[Api.ActionType.ADD]: "新增",
	[Api.ActionType.UPDATE]: "修改",
	[Api.ActionType.DELETE]: "删除",
	[Api.ActionType.READ]: "查询",
	[Api.ActionType.ASSIGN]: "分配",
	[Api.ActionType.REVOKE]: "撤销",
	[Api.ActionType.IMPORT]: "导入",
	[Api.ActionType.EXPORT]: "导出",
	[Api.ActionType.UPLOAD]: "上传",
	[Api.ActionType.DOWNLOAD]: "下载",
	[Api.ActionType.OTHER]: "其他",
}

const actionTypeVariantMap: Record<Api.ActionType, BadgeProps["variant"]> = {
	[Api.ActionType.ADD]: "success",
	[Api.ActionType.UPDATE]: "info",
	[Api.ActionType.DELETE]: "error",
	[Api.ActionType.READ]: "info",
	[Api.ActionType.ASSIGN]: "info",
	[Api.ActionType.REVOKE]: "warning",
	[Api.ActionType.IMPORT]: "warning",
	[Api.ActionType.EXPORT]: "warning",
	[Api.ActionType.UPLOAD]: "warning",
	[Api.ActionType.DOWNLOAD]: "info",
	[Api.ActionType.OTHER]: "secondary",
}

export const actionTypeOptions = [
	{ label: "全部", value: "all" },
	{ label: actionTypeLabelMap[Api.ActionType.ADD], value: Api.ActionType.ADD },
	{ label: actionTypeLabelMap[Api.ActionType.UPDATE], value: Api.ActionType.UPDATE },
	{ label: actionTypeLabelMap[Api.ActionType.DELETE], value: Api.ActionType.DELETE },
	{ label: actionTypeLabelMap[Api.ActionType.READ], value: Api.ActionType.READ },
	{ label: actionTypeLabelMap[Api.ActionType.ASSIGN], value: Api.ActionType.ASSIGN },
	{ label: actionTypeLabelMap[Api.ActionType.REVOKE], value: Api.ActionType.REVOKE },
	{ label: actionTypeLabelMap[Api.ActionType.IMPORT], value: Api.ActionType.IMPORT },
	{ label: actionTypeLabelMap[Api.ActionType.EXPORT], value: Api.ActionType.EXPORT },
	{ label: actionTypeLabelMap[Api.ActionType.UPLOAD], value: Api.ActionType.UPLOAD },
	{ label: actionTypeLabelMap[Api.ActionType.DOWNLOAD], value: Api.ActionType.DOWNLOAD },
	{ label: actionTypeLabelMap[Api.ActionType.OTHER], value: Api.ActionType.OTHER },
]

export const getActionTypeConfig = (type?: Api.ActionType | string | null) => {
	if (!type) {
		return { label: "未知", variant: "secondary" as BadgeProps["variant"] }
	}

	if (Object.values(Api.ActionType).includes(type as Api.ActionType)) {
		const typed = type as Api.ActionType
		return {
			label: actionTypeLabelMap[typed],
			variant: actionTypeVariantMap[typed],
		}
	}

	return { label: String(type), variant: "secondary" as BadgeProps["variant"] }
}

export const getHttpMethodVariant = (method?: string | null): BadgeProps["variant"] => {
	if (!method) return "secondary"
	const normalized = method.toUpperCase()

	const map: Record<string, BadgeProps["variant"]> = {
		GET: "success",
		POST: "info",
		PUT: "warning",
		DELETE: "error",
		PATCH: "info",
	}

	return map[normalized] ?? "secondary"
}

export const formatCompactId = (value?: string | null, maxLength = 16) => {
	if (!value) return "--"
	if (value.length <= maxLength) return value
	return `${value.slice(0, maxLength)}...`
}
