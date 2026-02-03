import { format, parseISO } from "date-fns"
import {
	Activity,
	AlertTriangle,
	Bell,
	Clock,
	HardDrive,
	Server,
	Shield,
	Users,
} from "lucide-react"
import { motion } from "motion/react"
import { PageContainer } from "@/components/common/page-container"
import { StatusBadge } from "@/components/common/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useInfrastructureStats } from "@/features/dashboard/api/get-infrastructure-stats"
import { useRecentActivities } from "@/features/dashboard/api/get-recent-activities"
import { useSystemModules } from "@/features/dashboard/api/get-system-modules"
import { RecentActivityList } from "@/features/dashboard/components/recent-activity-list"
import { StatsCard } from "@/features/dashboard/components/stats-card"
import { SystemModuleCard } from "@/features/dashboard/components/system-module-card"

export function InfrastructureDashboard() {
	const { data: stats } = useInfrastructureStats()
	const { data: modules } = useSystemModules()
	const { data: activities } = useRecentActivities()

	const updatedAt = format(parseISO(stats.updatedAt), "MM月dd日 HH:mm")

	const getHealthTone = (health: string) => {
		switch (health) {
			case "healthy":
				return "success"
			case "warning":
				return "warning"
			case "error":
				return "error"
			default:
				return "neutral"
		}
	}

	const getHealthText = (health: string) => {
		switch (health) {
			case "healthy":
				return "系统正常"
			case "warning":
				return "需要关注"
			case "error":
				return "存在问题"
			default:
				return "未知状态"
		}
	}

	const statsData = [
		{
			title: "用户总数",
			value: stats.totalUsers.toLocaleString(),
			hint: "系统注册用户总数",
			icon: Users,
			accentClass: "text-info bg-info-subtle border-info/20",
		},
		{
			title: "活跃用户",
			value: stats.activeUsers.toLocaleString(),
			hint: "当前在线活跃用户",
			icon: Activity,
			accentClass: "text-success bg-success-subtle border-success/20",
		},
		{
			title: "文件总数",
			value: stats.totalFiles.toLocaleString(),
			hint: `存储空间使用 ${stats.storageUsed}`,
			icon: HardDrive,
			accentClass: "text-primary bg-primary/10 border-primary/20",
		},
		{
			title: "运行任务",
			value: `${stats.runningTasks}/${stats.totalTasks}`,
			hint: "当前执行中的定时任务",
			icon: Clock,
			accentClass: "text-warning bg-warning-subtle border-warning/20",
		},
	]

	return (
		<PageContainer>
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="flex flex-col gap-8"
			>
				{/* 页面头部 */}
				<section className="flex flex-col gap-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-2xl space-y-3">
							<div className="flex items-center gap-3">
								<span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
									<Server className="h-3 w-3" />
									基础设施平台
								</span>
								<StatusBadge tone={getHealthTone(stats.systemHealth)} variant="solid">
									{getHealthText(stats.systemHealth)}
								</StatusBadge>
							</div>
							<h1 className="text-4xl font-semibold text-foreground sm:text-5xl">系统控制台</h1>
							<p className="text-base text-muted-foreground sm:text-lg">
								统一管理身份认证、文件存储、任务调度、通知服务等基础设施能力。最后更新时间：
								{updatedAt}
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-3">
							<Button variant="outline">
								<AlertTriangle className="mr-2 h-4 w-4" />
								系统报告
							</Button>
							<Button>
								<Shield className="mr-2 h-4 w-4" />
								安全检查
							</Button>
						</div>
					</div>
				</section>

				{/* 统计卡片 */}
				<motion.section
					initial="hidden"
					animate="show"
					variants={{
						hidden: { opacity: 0 },
						show: {
							opacity: 1,
							transition: { staggerChildren: 0.08 },
						},
					}}
					className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
				>
					{statsData.map((stat) => (
						<motion.div
							key={stat.title}
							variants={{
								hidden: { opacity: 0, y: 12 },
								show: { opacity: 1, y: 0 },
							}}
						>
							<StatsCard {...stat} />
						</motion.div>
					))}
				</motion.section>

				{/* 系统模块和活动记录 */}
				<section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
					{/* 系统模块 */}
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-semibold text-foreground">系统模块</h2>
								<p className="text-sm text-muted-foreground">基础设施服务模块运行状态</p>
							</div>
						</div>
						<motion.div
							initial="hidden"
							animate="show"
							variants={{
								hidden: { opacity: 0 },
								show: {
									opacity: 1,
									transition: { staggerChildren: 0.1 },
								},
							}}
							className="grid gap-4 md:grid-cols-2"
						>
							{modules.map((module) => (
								<motion.div
									key={module.id}
									variants={{
										hidden: { opacity: 0, y: 12 },
										show: { opacity: 1, y: 0 },
									}}
								>
									<SystemModuleCard module={module} />
								</motion.div>
							))}
						</motion.div>
					</div>

					{/* 最近活动和通知 */}
					<div className="space-y-6">
						<RecentActivityList activities={activities} />

						{/* 通知统计 */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Bell className="h-5 w-5" />
									通知中心
								</CardTitle>
								<CardDescription>系统通知和消息统计</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">总通知数</span>
										<span className="font-semibold">{stats.totalNotifications}</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">未读通知</span>
										<Badge variant="destructive">{stats.unreadNotifications}</Badge>
									</div>
									<Button className="w-full" variant="outline" size="sm">
										查看所有通知
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>
			</motion.div>
		</PageContainer>
	)
}
