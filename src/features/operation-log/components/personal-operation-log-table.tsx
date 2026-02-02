import type { ColumnDef } from "@tanstack/react-table"
import { CircleAlert, CircleCheck, Eye, MapPin, Plus, Shield } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
	DataTable,
	DataTableContainer,
	DataTableFilterBar,
	DataTablePagination,
	TableProvider,
	useTablePagination,
} from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-picker-rac"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type Api, fetchOperationLogList } from "@/features/operation-log/api/operation-log"
import {
	actionTypeOptions,
	getActionTypeConfig,
} from "@/features/operation-log/utils/operation-log-utils"
import { formatTimestampToDateTime, formatTimestampToRelativeTime } from "@/lib/time-utils"
import { cn } from "@/lib/utils"

interface PersonalOperationLogTableProps {
	userId: string
	onViewDetail?: (id: string) => void
	className?: string
	emptyText?: string
	baseParams?: Partial<Api.OperationLog.SearchParams>
}

const successOptions = [
	{ label: "全部", value: "all" },
	{ label: "成功", value: "true" },
	{ label: "失败", value: "false" },
]

/**
 * 格式化 IP 地址，处理 IPv6 回环
 */
const formatIp = (ip?: string | null) => {
	if (!ip) return "--"
	if (ip === "0:0:0:0:0:0:0:1") return "127.0.0.1"
	return ip
}

export function PersonalOperationLogTable({
	userId,
	onViewDetail,
	className,
	emptyText = "暂无操作日志数据",
	baseParams,
}: PersonalOperationLogTableProps) {
	const [dateRange, setDateRange] = useState<
		{ from: Date | undefined; to: Date | undefined } | undefined
	>()
	const [success, setSuccess] = useState<"all" | "true" | "false">("all")
	const [actionType, setActionType] = useState<Api.ActionType | "all">("all")

	const queryParams = useMemo<Api.OperationLog.SearchParams>(() => {
		const start = dateRange?.from ? dateRange.from.getTime() : null
		const end = dateRange?.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : null
		return {
			...baseParams,
			userId,
			success: success === "all" ? null : success,
			actionType: actionType === "all" ? null : actionType,
			startTimeMs: start,
			endTimeMs: end,
		}
	}, [actionType, baseParams, dateRange, userId, success])

	const columns = useMemo<ColumnDef<Api.OperationLog.SimpleLog>[]>(
		() => [
			{
				accessorKey: "status",
				header: "状态 / 操作",
				enableSorting: false,
				size: 320,
				cell: ({ row }) => {
					const log = row.original
					const actionConfig = getActionTypeConfig(log.actionType)
					const formattedIp = formatIp(log.clientIp)

					return (
						<div
							className={cn(
								"flex min-w-0 items-start gap-3 pl-2",
								log.sensitive && "border-l-2 border-l-error",
							)}
						>
							<div
								className={cn(
									"mt-1 flex size-7 items-center justify-center rounded-full shrink-0",
									log.success ? "text-success" : "bg-error-subtle text-error-on-subtle",
								)}
							>
								{log.success ? (
									<CircleCheck className="size-4" />
								) : (
									<CircleAlert className="size-4" />
								)}
							</div>
							<div className="min-w-0 flex-1 space-y-1.5">
								<div className="flex min-w-0 items-center gap-2">
									<button
										type="button"
										className={cn(
											"max-w-45 truncate text-sm font-bold text-foreground transition-colors",
											onViewDetail && "cursor-pointer hover:text-primary",
										)}
										onClick={() => onViewDetail?.(log.id)}
									>
										{log.actionName}
									</button>
									<Badge
										variant={actionConfig.variant}
										className="text-[10px] font-normal whitespace-nowrap px-1.5 h-4"
									>
										{actionConfig.label}
									</Badge>
									{log.sensitive ? (
										<Badge
											variant="error"
											className="gap-1 text-[10px] shrink-0 px-1.5 h-4 bg-error/5 border-error/20 text-error"
										>
											<Shield className="size-2.5" />
											敏感
										</Badge>
									) : null}
								</div>

								<div className="flex flex-col gap-1">
									<div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
										<MapPin className="size-2.5 shrink-0 opacity-70" />
										<Tooltip>
											<TooltipTrigger asChild>
												<span className="truncate font-mono">
													{formattedIp}
													{log.clientLocation ? `（${log.clientLocation}）` : ""}
												</span>
											</TooltipTrigger>
											<TooltipContent>
												IP: {log.clientIp}
												{log.clientLocation && (
													<>
														<br />
														位置: {log.clientLocation}
													</>
												)}
											</TooltipContent>
										</Tooltip>
									</div>
								</div>
							</div>
						</div>
					)
				},
			},
			{
				accessorKey: "resource",
				header: "模块 / 资源",
				enableSorting: false,
				size: 200,
				cell: ({ row }) => {
					const log = row.original
					return (
						<div className="flex min-w-0 flex-col gap-1.5">
							<span className="truncate text-[11px] text-muted-foreground/60">
								{log.moduleName || "未知模块"}
							</span>
							<div className="flex min-w-0 items-center gap-2">
								{log.resourceType ? (
									<Tooltip>
										<TooltipTrigger asChild>
											<span className="max-w-50 truncate font-medium text-sm">
												{log.resourceName || "--"}
											</span>
										</TooltipTrigger>
										<TooltipContent>
											{log.resourceName ? `资源: ${log.resourceName}` : "资源: --"}
											<br />
											资源类型: {log.resourceType}
										</TooltipContent>
									</Tooltip>
								) : (
									<span className="max-w-50 truncate font-medium text-sm">
										{log.resourceName || "--"}
									</span>
								)}
							</div>
						</div>
					)
				},
			},
			{
				accessorKey: "operationTime",
				header: "时间",
				enableSorting: false,
				size: 190,
				cell: ({ row }) => {
					const log = row.original
					return (
						<div className="flex items-center justify-between gap-2 mr-2">
							<div className="flex flex-col gap-1 min-w-0">
								<span className="text-sm font-semibold text-foreground whitespace-nowrap">
									{formatTimestampToDateTime(log.operationTime)}
								</span>
								<span className="text-[11px] text-muted-foreground/60">
									{formatTimestampToRelativeTime(log.operationTime)}
								</span>
							</div>
							{onViewDetail && (
								<Button
									variant="ghost"
									size="icon"
									className="detail-eye-btn h-7 w-7 opacity-0 transition-opacity text-primary hover:bg-primary/10 hover:text-primary"
									onClick={() => onViewDetail(log.id)}
								>
									<Eye className="size-4" />
								</Button>
							)}
						</div>
					)
				},
			},
		],
		[onViewDetail],
	)

	const { table, loading, empty, fetching, refetch, pagination, setPage, setPageSize } =
		useTablePagination<Api.OperationLog.SimpleLog>({
			queryKey: ["personal-operation-logs", queryParams],
			queryFn: ({ pageNumber, pageSize }) => {
				return fetchOperationLogList({
					...queryParams,
					pageNumber,
					pageSize,
				})
			},
			columns,
			getRowId: (row) => row.id,
			enableServerSorting: false,
		})

	// biome-ignore lint/correctness/useExhaustiveDependencies: Reset page when userId changes
	useEffect(() => {
		setPage(1)
	}, [setPage, queryParams.userId])

	const hasActiveFilters = useMemo(() => {
		return Boolean(dateRange?.from || dateRange?.to || success !== "all" || actionType !== "all")
	}, [actionType, dateRange, success])

	const handleReset = useCallback(() => {
		setDateRange(undefined)
		setSuccess("all")
		setActionType("all")
		setPage(1)
	}, [setPage])

	const handleRefresh = useCallback(async () => {
		await refetch()
	}, [refetch])

	const successLabel = useMemo(() => {
		return successOptions.find((option) => option.value === success)?.label ?? "状态"
	}, [success])

	const actionTypeLabel = useMemo(() => {
		return actionTypeOptions.find((option) => option.value === actionType)?.label ?? "操作类型"
	}, [actionType])

	return (
		<TableProvider
			table={table}
			loading={loading}
			empty={empty}
			pagination={pagination}
			onPageChange={setPage}
			onPageSizeChange={setPageSize}
		>
			<TooltipProvider delayDuration={200}>
				<DataTableContainer
					className={cn("overflow-x-hidden [&_tr:hover_.detail-eye-btn]:opacity-100", className)}
					toolbar={
						<DataTableFilterBar
							onReset={handleReset}
							onRefresh={handleRefresh}
							hasActiveFilters={hasActiveFilters}
						>
							<div className="flex flex-wrap items-center gap-2">
								<DateRangePicker
									value={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
									onChange={(range) =>
										setDateRange(range ? { from: range.from, to: range.to } : undefined)
									}
									placeholder="时间范围"
								/>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="h-9 gap-1">
											<Plus className="h-4 w-4" />
											{success === "all" ? "状态" : `状态: ${successLabel}`}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-36">
										<DropdownMenuLabel>状态</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuRadioGroup
											value={success}
											onValueChange={(value) => setSuccess(value as "all" | "true" | "false")}
										>
											{successOptions.map((option) => (
												<DropdownMenuRadioItem key={option.value} value={option.value}>
													{option.label}
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="h-9 gap-1">
											<Plus className="h-4 w-4" />
											{actionType === "all" ? "操作类型" : `类型: ${actionTypeLabel}`}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-44">
										<DropdownMenuLabel>操作类型</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuRadioGroup
											value={actionType}
											onValueChange={(value) => setActionType(value as Api.ActionType | "all")}
										>
											{actionTypeOptions.map((option) => (
												<DropdownMenuRadioItem key={option.value} value={option.value}>
													{option.label}
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</DataTableFilterBar>
					}
					table={
						<DataTable
							table={table}
							loading={loading}
							empty={empty}
							emptyText={emptyText}
							fetching={fetching}
						/>
					}
					pagination={<DataTablePagination />}
				/>
			</TooltipProvider>
		</TableProvider>
	)
}
