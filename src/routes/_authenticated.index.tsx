import { createFileRoute, redirect } from "@tanstack/react-router"
import { PRIMARY_NAV } from "@/components/layout/nav-config"
import { PERMISSIONS } from "@/config/permissions"
import { InfrastructureDashboard } from "@/features/dashboard/routes/infrastructure-dashboard"
import { authStore } from "@/lib/auth-store"

export const Route = createFileRoute("/_authenticated/")({
	beforeLoad: () => {
		const { hasPermission } = authStore.getState()

		// 检查是否有控制台访问权限
		if (!hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
			// 查找第一个有权限的页面
			const firstAccessiblePage = PRIMARY_NAV.find((item) => {
				return !item.permission || hasPermission(item.permission)
			})

			// 如果有其他可访问的页面,重定向到该页面
			if (firstAccessiblePage && firstAccessiblePage.to !== "/") {
				throw redirect({
					to: firstAccessiblePage.to,
				})
			}

			// 如果没有任何可访问的页面,会由 BaseLayout 显示 NoAccess 组件
		}
	},
	component: InfrastructureDashboard,
	staticData: {
		title: "控制台",
	},
})
