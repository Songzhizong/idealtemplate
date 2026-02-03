import { Bell, Search } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useThemeStore } from "@/hooks/use-theme-store"
import { cn } from "@/lib/utils"
import type { NavItem } from "../nav-config"
import { Breadcrumbs } from "./breadcrumbs"
import { ThemeSettingsDrawer } from "./theme-settings-drawer.tsx"
import { UserMenu } from "./user-menu"

interface HeaderProps {
	navItems: readonly NavItem[]
	onSearchOpen: () => void
}

export function Header({ navItems, onSearchOpen }: HeaderProps) {
	const headerHeight = useThemeStore((state) => state.layout.headerHeight)
	const [isScrolled, setIsScrolled] = React.useState(false)

	const [isMac, setIsMac] = React.useState(true)

	React.useEffect(() => {
		setIsMac(/Mac|iPhone|iPod|iPad/i.test(navigator.userAgent))
		const onScroll = () => setIsScrolled(window.scrollY > 0)
		onScroll()
		window.addEventListener("scroll", onScroll, { passive: true })
		return () => window.removeEventListener("scroll", onScroll)
	}, [])

	return (
		<header
			className={cn(
				"sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 backdrop-blur-md px-4 transition-colors sm:px-6",
				isScrolled ? "border-border" : "border-transparent",
			)}
			style={{ height: `${headerHeight}px` }}
		>
			<div className="flex items-center gap-4">
				<SidebarTrigger />
				<Breadcrumbs navItems={navItems} />
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					className="hidden items-center gap-2 rounded-full px-4 md:flex"
					onClick={onSearchOpen}
					aria-keyshortcuts="Meta+K Control+K"
				>
					<Search className="size-4" />
					搜索
					<span className="rounded-full border border-border bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
						{isMac ? "cmd k" : "ctrl k"}
					</span>
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-10 w-10 rounded-full p-0 md:hidden"
					onClick={onSearchOpen}
					aria-label="Open search"
				>
					<Search className="size-4" />
				</Button>
				<ThemeSettingsDrawer />
				<Button
					variant="ghost"
					size="sm"
					className="relative h-10 w-10 rounded-full p-0"
					aria-label="Notifications"
				>
					<Bell className="size-4" />
					<span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-amber-400" />
				</Button>
				<UserMenu />
			</div>
		</header>
	)
}
