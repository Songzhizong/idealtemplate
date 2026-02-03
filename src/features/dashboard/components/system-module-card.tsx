import { StatusBadge } from "@/components/common/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SystemModule } from "../types/infrastructure"

interface SystemModuleCardProps {
	module: SystemModule
}

export function SystemModuleCard({ module }: SystemModuleCardProps) {
	const getStatusTone = (status: SystemModule["status"]) => {
		switch (status) {
			case "active":
				return "success"
			case "maintenance":
				return "warning"
			case "inactive":
				return "neutral"
			default:
				return "neutral"
		}
	}

	const getStatusText = (status: SystemModule["status"]) => {
		switch (status) {
			case "active":
				return "运行中"
			case "maintenance":
				return "维护中"
			case "inactive":
				return "已停用"
			default:
				return "未知"
		}
	}

	const getUsageColor = (usage: number) => {
		if (usage >= 80) return "bg-error"
		if (usage >= 60) return "bg-warning"
		return "bg-success"
	}

	return (
		<Card className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-lg">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle className="text-base font-semibold">{module.name}</CardTitle>
						<CardDescription className="text-sm">{module.description}</CardDescription>
					</div>
					<StatusBadge tone={getStatusTone(module.status)} className="text-xs">
						{getStatusText(module.status)}
					</StatusBadge>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-3">
					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">使用率</span>
							<span className="font-medium">{module.usage}%</span>
						</div>
						<div className="h-2 w-full rounded-full bg-muted">
							<div
								className={cn(
									"h-full rounded-full transition-all duration-300",
									getUsageColor(module.usage),
								)}
								style={{ width: `${module.usage}%` }}
							/>
						</div>
					</div>
					<div className="text-xs text-muted-foreground">
						最后更新: {new Date(module.lastUpdated).toLocaleString("zh-CN")}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
