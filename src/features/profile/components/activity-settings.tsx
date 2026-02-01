import type { ColumnDef } from "@tanstack/react-table"
import { format, formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Activity, Clock, History, Laptop, LogOut, MapPin, Monitor, Smartphone } from "lucide-react"
import { parseAsInteger } from "nuqs"
import { useCallback, useMemo } from "react"
import { toast } from "sonner"
import {
	DataTable,
	DataTableContainer,
	DataTableFilterBar,
	DataTablePagination,
	TableProvider,
} from "@/components/table"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDataTable } from "@/hooks"
import { cn } from "@/lib/utils"
import { type Api, fetchCurrentUserLoginLog } from "../api/login-log"
import { useDeleteSession, useMySessions } from "../api/session"

const getDeviceIcon = (device: string) => {
	if (device.includes("iPhone") || device.includes("Android") || device.includes("Mobile")) {
		return <Smartphone className="size-5 text-muted-foreground" />
	}
	if (device.includes("Mac") || device.includes("Windows") || device.includes("Linux")) {
		return <Laptop className="size-5 text-muted-foreground" />
	}
	return <Monitor className="size-5 text-muted-foreground" />
}

export function ActivitySettings() {
	const { data: sessions = [], isLoading } = useMySessions()
	const sortedSessions = [...sessions].sort((a, b) =>
		a.current === b.current ? 0 : a.current ? -1 : 1,
	)
	const deleteSession = useDeleteSession()

	const loginLogColumns = useMemo<ColumnDef<Api.LoginLog.LoginLogVO>[]>(
		() => [
			{
				accessorKey: "loginTime",
				header: "时间",
				enableSorting: false,
				cell: ({ row }) => {
					const time = row.original.loginTime
					if (!time) return <div className="font-mono text-sm">-</div>
					const date = new Date(Number(time))
					return (
						<div className="flex flex-col gap-0.5">
							<span className="text-sm font-medium">
								{formatDistanceToNow(date, { addSuffix: true, locale: zhCN })}
							</span>
							<span className="text-xs text-muted-foreground font-mono">
								{format(date, "yyyy-MM-dd HH:mm:ss")}
							</span>
						</div>
					)
				},
			},
			{
				accessorKey: "device",
				header: "设备/浏览器",
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex items-center gap-2">
						{getDeviceIcon(row.original.device)}
						<span className="max-w-50 truncate" title={row.original.userAgent}>
							{row.original.device}
						</span>
					</div>
				),
			},
			{
				accessorKey: "loginIp",
				header: "IP / 位置",
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex flex-col gap-0.5">
						{row.original.loginLocation && (
							<span className="text-sm">{row.original.loginLocation}</span>
						)}
						<span className="font-mono text-xs text-muted-foreground">{row.original.loginIp}</span>
					</div>
				),
			},
			{
				accessorKey: "success",
				header: "状态",
				enableSorting: false,
				cell: ({ row }) => (
					<Badge
						variant={row.original.success === false ? "destructive" : "secondary"}
						className={cn(
							row.original.success !== false &&
								"bg-success-subtle text-success-on-subtle border-success/20 border",
						)}
					>
						{row.original.success === false ? "失败" : "成功"}
					</Badge>
				),
			},
		],
		[],
	)

	const { table, filters, loading, empty, fetching, refetch, pagination } = useDataTable({
		queryKey: ["login-logs"],
		queryFn: (params) => fetchCurrentUserLoginLog(params),
		enableServerSorting: false,
		columns: loginLogColumns,
		filterParsers: {
			loginTimeStart: parseAsInteger,
			loginTimeEnd: parseAsInteger,
		},
	})

	// biome-ignore lint/suspicious/noExplicitAny: nuqs dynamic keys
	const filterState = filters.state as any

	const handleSearch = useCallback(async () => {
		await refetch()
	}, [refetch])

	const handleReset = useCallback(() => {
		filters.reset()
	}, [filters])

	const handleRefresh = useCallback(async () => {
		await refetch()
	}, [refetch])

	const handleRevokeSession = async (sessionId: string) => {
		try {
			await deleteSession.mutateAsync(sessionId)
			toast.success("会话已注销")
		} catch (error) {
			console.error("Failed to revoke session:", error)
		}
	}

	const handleRevokeAllSessions = async () => {
		const otherSessions = sessions.filter((s) => !s.current)
		if (otherSessions.length === 0) {
			toast.info("没有其他可注销的会话")
			return
		}

		const promise = Promise.all(otherSessions.map((s) => deleteSession.mutateAsync(s.id)))

		toast.promise(promise, {
			loading: "正在注销所有其他会话...",
			success: "所有其他会话已注销",
			error: "部分会话注销失败",
		})
	}

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString()
	}

	return (
		<div className="space-y-6">
			{/* Active Sessions */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-2">
								<Activity className="size-5" />
								<CardTitle>活动会话</CardTitle>
							</div>
							<CardDescription className="mt-1.5">管理你在不同设备上的登录会话</CardDescription>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="outline"
									size="sm"
									disabled={isLoading || sessions.filter((s) => !s.current).length === 0}
								>
									<LogOut className="mr-2 size-4" />
									注销所有其他会话
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>注销所有其他会话</AlertDialogTitle>
									<AlertDialogDescription>
										这将注销除当前设备外的所有会话。你需要在这些设备上重新登录。
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>取消</AlertDialogCancel>
									<AlertDialogAction onClick={handleRevokeAllSessions}>确认注销</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{isLoading ? (
							<div className="flex h-32 items-center justify-center text-muted-foreground">
								正在加载会话...
							</div>
						) : sessions.length === 0 ? (
							<div className="flex h-32 items-center justify-center text-muted-foreground">
								暂无活动会话
							</div>
						) : (
							sortedSessions.map((session) => (
								<div
									key={session.id}
									className={cn(
										"flex items-start justify-between rounded-lg border border-border/50 p-4 transition-all relative overflow-hidden",
										session.current &&
											"bg-primary/3 border-primary/20 dark:bg-primary/5 dark:border-primary/30 shadow-sm",
									)}
								>
									{session.current && (
										<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80" />
									)}
									<div className="flex gap-4">
										<div className="mt-1">{getDeviceIcon(session.device)}</div>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<h4 className="font-medium">{session.device}</h4>
												{session.current && (
													<Badge variant="default" className="text-xs">
														当前设备
													</Badge>
												)}
											</div>
											<div className="flex flex-col gap-1 text-sm text-muted-foreground">
												<div className="flex items-center gap-1.5">
													<Monitor className="size-3.5" />
													<span>{session.device}</span>
												</div>
												<div className="flex items-center gap-1.5">
													<MapPin className="size-3.5" />
													<span>
														{session.loginIp} · {session.location || "未知位置"}
													</span>
												</div>
												<div className="flex items-center gap-1.5">
													<Clock className="size-3.5" />
													<span>
														最后活跃: {formatDate(session.latestActivity || session.createdTime)}
													</span>
												</div>
											</div>
										</div>
									</div>
									{!session.current && (
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="ghost" size="sm" disabled={deleteSession.isPending}>
													注销
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>注销会话</AlertDialogTitle>
													<AlertDialogDescription>
														确定要注销 "{session.device}" 上的会话吗？
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>取消</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => handleRevokeSession(session.id)}
														disabled={deleteSession.isPending}
													>
														确认注销
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									)}
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>

			{/* Login Logs */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<History className="size-5" />
						<CardTitle>登录日志</CardTitle>
					</div>
					<CardDescription>查看你的登录历史记录，包括成功和失败的尝试</CardDescription>
				</CardHeader>
				<CardContent>
					<TableProvider
						table={table}
						loading={loading}
						empty={empty}
						pagination={pagination}
						onPageChange={(page) => table.setPageIndex(page - 1)}
						onPageSizeChange={(size) => table.setPageSize(size)}
					>
						<DataTableContainer
							toolbar={
								<DataTableFilterBar
									onSearch={handleSearch}
									onReset={handleReset}
									onRefresh={handleRefresh}
								>
									<div className="flex items-center gap-2">
										<div className="flex items-center gap-2">
											<Input
												type="date"
												className="h-9 w-40"
												value={
													filterState.loginTimeStart
														? format(new Date(filterState.loginTimeStart), "yyyy-MM-dd")
														: ""
												}
												onChange={(e) => {
													const date = e.target.value
													if (date) {
														filters.set("loginTimeStart", new Date(date).getTime())
													} else {
														filters.set("loginTimeStart", null)
													}
												}}
											/>
											<span className="text-muted-foreground">-</span>
											<Input
												type="date"
												className="h-9 w-40"
												value={
													filterState.loginTimeEnd
														? format(new Date(filterState.loginTimeEnd), "yyyy-MM-dd")
														: ""
												}
												onChange={(e) => {
													const date = e.target.value
													if (date) {
														// 设置为当天的 23:59:59.999
														const d = new Date(date)
														d.setHours(23, 59, 59, 999)
														filters.set("loginTimeEnd", d.getTime())
													} else {
														filters.set("loginTimeEnd", null)
													}
												}}
											/>
										</div>
									</div>
								</DataTableFilterBar>
							}
							table={
								<DataTable
									table={table}
									loading={loading}
									empty={empty}
									emptyText="暂无登录日志数据"
									fetching={fetching}
									maxHeight="calc(100vh - 24rem)"
								/>
							}
							pagination={<DataTablePagination />}
						/>
					</TableProvider>
				</CardContent>
			</Card>
		</div>
	)
}
