import { Link, useMatches } from "@tanstack/react-router"
import { AlertTriangle, ChevronRight, LayoutGrid, type LucideIcon, ShieldAlert } from "lucide-react"
import * as React from "react"
import { useThemeStore } from "@/hooks/use-theme-store"

interface BreadcrumbsProps {
	navItems: readonly { title: string; to: string; icon: LucideIcon }[]
}

// Error page configurations
const ERROR_PAGES = [
	{ to: "/errors/403", title: "Forbidden", icon: ShieldAlert },
	{ to: "/errors/404", title: "Not Found", icon: AlertTriangle },
	{ to: "/errors/500", title: "Server Error", icon: AlertTriangle },
] as const

export function Breadcrumbs({ navItems }: BreadcrumbsProps) {
	const showBreadcrumb = useThemeStore((state) => state.ui.showBreadcrumb)
	const showBreadcrumbIcon = useThemeStore((state) => state.ui.showBreadcrumbIcon)

	const matches = useMatches()

	const routeIcons = React.useMemo(() => {
		const entries: Array<[string, LucideIcon]> = navItems.map((item) => [item.to, item.icon])
		for (const errorPage of ERROR_PAGES) {
			entries.push([errorPage.to, errorPage.icon])
		}
		return new Map<string, LucideIcon>(entries)
	}, [navItems])

	const breadcrumbs = React.useMemo(() => {
		return matches
			.filter((match) => {
				// 过滤掉根路由和没有标题的布局路由
				const title = (match.staticData as { title?: string })?.title
				return !!title
			})
			.map((match) => {
				const title = (match.staticData as { title?: string })?.title ?? ""
				return {
					label: title,
					to: match.pathname,
				}
			})
	}, [matches])

	if (!showBreadcrumb || breadcrumbs.length === 0) return null

	return (
		<nav
			className="hidden items-center text-sm text-muted-foreground md:flex"
			aria-label="Breadcrumb"
		>
			<ol className="flex items-center gap-2">
				{breadcrumbs.map((crumb, index) => (
					<li key={`${crumb.to}-${crumb.label}`} className="flex items-center gap-2">
						{index > 0 ? <ChevronRight className="size-3 text-muted-foreground/50" /> : null}
						{index < breadcrumbs.length - 1 ? (
							<Link
								to={crumb.to}
								className="flex items-center gap-1 transition hover:text-foreground"
							>
								{showBreadcrumbIcon && index === 0 && <LayoutGrid className="size-3" />}
								{crumb.label}
							</Link>
						) : (
							<span className="flex items-center gap-1 font-semibold text-foreground">
								{showBreadcrumbIcon &&
									(() => {
										const icon = routeIcons.get(crumb.to) || (index === 0 ? LayoutGrid : null)
										return icon ? React.createElement(icon, { className: "size-3" }) : null
									})()}
								{crumb.label}
							</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	)
}
