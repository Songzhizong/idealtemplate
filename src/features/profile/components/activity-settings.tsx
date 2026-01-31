import { Activity, Clock, Laptop, LogOut, MapPin, Monitor, Smartphone } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function ActivitySettings() {
	const [sessions] = useState([
		{
			id: "1",
			device: "MacBook Pro",
			browser: "Chrome 120",
			ip: "192.168.1.100",
			location: "北京, 中国",
			lastActive: "刚刚",
			isCurrent: true,
		},
		{
			id: "2",
			device: "iPhone 14",
			browser: "Safari",
			ip: "192.168.1.101",
			location: "北京, 中国",
			lastActive: "2 小时前",
			isCurrent: false,
		},
		{
			id: "3",
			device: "Windows PC",
			browser: "Edge 120",
			ip: "203.0.113.45",
			location: "上海, 中国",
			lastActive: "1 天前",
			isCurrent: false,
		},
	])

	const [loginLogs] = useState([
		{
			id: "1",
			timestamp: "2024-01-30 14:32:15",
			device: "MacBook Pro - Chrome",
			ip: "192.168.1.100",
			location: "北京, 中国",
			status: "success" as const,
		},
		{
			id: "2",
			timestamp: "2024-01-30 08:15:42",
			device: "iPhone 14 - Safari",
			ip: "192.168.1.101",
			location: "北京, 中国",
			status: "success" as const,
		},
		{
			id: "3",
			timestamp: "2024-01-29 22:45:08",
			device: "Unknown Device - Chrome",
			ip: "198.51.100.42",
			location: "广州, 中国",
			status: "failed" as const,
		},
		{
			id: "4",
			timestamp: "2024-01-29 09:20:33",
			device: "Windows PC - Edge",
			ip: "203.0.113.45",
			location: "上海, 中国",
			status: "success" as const,
		},
		{
			id: "5",
			timestamp: "2024-01-28 16:55:19",
			device: "MacBook Pro - Chrome",
			ip: "192.168.1.100",
			location: "北京, 中国",
			status: "success" as const,
		},
	])

	const getDeviceIcon = (device: string) => {
		if (device.includes("iPhone") || device.includes("Android")) {
			return <Smartphone className="size-5 text-muted-foreground" />
		}
		if (device.includes("Mac") || device.includes("Windows")) {
			return <Laptop className="size-5 text-muted-foreground" />
		}
		return <Monitor className="size-5 text-muted-foreground" />
	}

	const handleRevokeSession = (sessionId: string) => {
		// id used for revoke logic
		console.log(sessionId)
		toast.success("会话已注销")
	}

	const handleRevokeAllSessions = () => {
		toast.success("所有其他会话已注销")
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
								<Button variant="outline" size="sm">
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
						{sessions.map((session) => (
							<div
								key={session.id}
								className={cn(
									"flex items-start justify-between rounded-lg border border-border/50 p-4 transition-colors",
									session.isCurrent && "bg-success-subtle border-success/50",
								)}
							>
								<div className="flex gap-4">
									<div className="mt-1">{getDeviceIcon(session.device)}</div>
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<h4 className="font-medium">{session.device}</h4>
											{session.isCurrent && (
												<Badge variant="default" className="text-xs">
													当前设备
												</Badge>
											)}
										</div>
										<div className="flex flex-col gap-1 text-sm text-muted-foreground">
											<div className="flex items-center gap-1.5">
												<Monitor className="size-3.5" />
												<span>{session.browser}</span>
											</div>
											<div className="flex items-center gap-1.5">
												<MapPin className="size-3.5" />
												<span>
													{session.ip} · {session.location}
												</span>
											</div>
											<div className="flex items-center gap-1.5">
												<Clock className="size-3.5" />
												<span>最后活跃: {session.lastActive}</span>
											</div>
										</div>
									</div>
								</div>
								{!session.isCurrent && (
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant="ghost" size="sm">
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
												<AlertDialogAction onClick={() => handleRevokeSession(session.id)}>
													确认注销
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Login Logs */}
			<Card>
				<CardHeader>
					<CardTitle>登录日志</CardTitle>
					<CardDescription>查看你的登录历史记录，包括成功和失败的尝试</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border border-border/50 overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="border-border/50">
									<TableHead className="min-w-30">时间</TableHead>
									<TableHead className="min-w-30">设备/浏览器</TableHead>
									<TableHead className="min-w-25">IP 地址</TableHead>
									<TableHead className="min-w-25">位置</TableHead>
									<TableHead className="min-w-20">状态</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{loginLogs.map((log) => (
									<TableRow key={log.id} className="border-border/50">
										<TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
										<TableCell>{log.device}</TableCell>
										<TableCell className="font-mono text-sm">{log.ip}</TableCell>
										<TableCell>{log.location}</TableCell>
										<TableCell>
											{log.status === "success" ? (
												<Badge
													variant="secondary"
													className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
												>
													成功
												</Badge>
											) : (
												<Badge variant="destructive">失败</Badge>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<div className="mt-4 flex justify-center">
						<Button variant="outline" size="sm">
							加载更多
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
