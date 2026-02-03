import { useRouterState } from "@tanstack/react-router"
import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useThemeStore } from "@/hooks/use-theme-store"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"
import { ALL_NAV, PRIMARY_NAV } from "./nav-config"
import { AppSidebar } from "./parts/app-sidebar"
import { Header } from "./parts/header"
import { NoAccess } from "./parts/no-access"
import { SearchCommand } from "./parts/search-command"

export function BaseLayout({ children }: { children: React.ReactNode }) {
	const sidebarWidth = useThemeStore((state) => state.layout.sidebarWidth)
	const sidebarCollapsedWidth = useThemeStore((state) => state.layout.sidebarCollapsedWidth)
	const containerWidth = useThemeStore((state) => state.layout.containerWidth)
	const pageAnimation = useThemeStore((state) => state.ui.pageAnimation)
	const menuLayout = useThemeStore((state) => state.layout.menuLayout)
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	})

	const [searchOpen, setSearchOpen] = React.useState(false)

	// 性能优化: 使用 Selector 仅订阅 hasPermission 函数
	// 避免 token、user、tenantId 等状态变化导致 BaseLayout 重新渲染
	const hasPermission = useAuthStore((state) => state.hasPermission)

	const filteredPrimaryNav = React.useMemo(() => {
		return PRIMARY_NAV.filter((item) => {
			return !item.permission || hasPermission(item.permission)
		})
	}, [hasPermission])

	const filteredAllNav = React.useMemo(() => {
		return ALL_NAV.filter((item) => {
			return !item.permission || hasPermission(item.permission)
		})
	}, [hasPermission])

	return (
		<SidebarProvider
			className="bg-transparent"
			style={
				{
					"--sidebar-width": `${sidebarWidth}px`,
					"--sidebar-width-icon": `${sidebarCollapsedWidth}px`,
				} as React.CSSProperties
			}
		>
			<AppSidebar
				items={filteredPrimaryNav}
				collapsible={menuLayout === "dual" ? "none" : "icon"}
				showLabel={menuLayout === "single"}
			/>

			<div className="flex h-screen flex-1 flex-col overflow-hidden">
				<Header navItems={filteredAllNav} onSearchOpen={() => setSearchOpen(true)} />

				<main className="flex-1 overflow-y-auto relative">
					<div
						key={pathname}
						className={cn(
							"h-full w-full",
							containerWidth === "fixed" ? "mx-auto max-w-7xl" : "",
							pageAnimation !== "none" && `animate-${pageAnimation}`,
						)}
					>
						{filteredPrimaryNav.length === 0 ? <NoAccess /> : children}
					</div>
				</main>
			</div>
			<SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
		</SidebarProvider>
	)
}
