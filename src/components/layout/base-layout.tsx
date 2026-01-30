import { useRouterState } from "@tanstack/react-router"
import * as React from "react"
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarProvider,
} from "@/components/ui/sidebar"
import { useThemeStore } from "@/hooks/use-theme-store"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"
import { ALL_NAV, PRIMARY_NAV } from "./nav-config"
import { Header } from "./parts/header"
import { SearchCommand } from "./parts/search-command"
import { SidebarBrand } from "./parts/sidebar-brand"
import { SidebarNavItem } from "./parts/sidebar-nav-item"

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

	const { hasPermission } = useAuthStore()

	const filteredPrimaryNav = React.useMemo(() => {
		return PRIMARY_NAV.filter((item) => {
			// @ts-expect-error - permission is optional
			return !item.permission || hasPermission(item.permission)
		})
	}, [hasPermission])

	const filteredAllNav = React.useMemo(() => {
		return ALL_NAV.filter((item) => {
			// @ts-expect-error - permission is optional
			return !item.permission || hasPermission(item.permission)
		})
	}, [hasPermission])

	return (
		<SidebarProvider
			className="bg-transparent "
			sidebarWidth={sidebarWidth}
			sidebarCollapsedWidth={sidebarCollapsedWidth}
		>
			<Sidebar
				collapsible={menuLayout === "dual" ? "none" : "icon"}
				className={cn(
					"sticky top-0 h-screen transition-all duration-300 px-1",
					"bg-sidebar border-sidebar-border text-sidebar-foreground",
				)}
			>
				<SidebarHeader>
					<SidebarBrand />
				</SidebarHeader>
				<SidebarContent className="space-y-6">
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								{filteredPrimaryNav.map((item) => (
									<SidebarNavItem
										key={item.title}
										item={item}
										isActive={pathname === item.to}
										showLabel={menuLayout === "single"}
									/>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>

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
						{children}
					</div>
				</main>
			</div>
			<SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
		</SidebarProvider>
	)
}
