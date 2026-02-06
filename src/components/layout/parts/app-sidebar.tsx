import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { NavItem } from "../nav-config"
import { SidebarBrand } from "./sidebar-brand"

export function AppSidebar({
	items,
	collapsible,
	showLabel = true,
}: {
	items: readonly NavItem[]
	collapsible: "offcanvas" | "icon" | "none"
	showLabel?: boolean
}) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	})
	const iconOnly = !showLabel

	return (
		<Sidebar
			collapsible={collapsible}
			className="sticky top-0 h-screen bg-sidebar border-sidebar-border text-sidebar-foreground"
		>
			<SidebarHeader>
				<SidebarBrand />
			</SidebarHeader>
			<SidebarContent className="space-y-6">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							{items.map((item) => {
								if (item.children?.length) {
									const isActive =
										item.children.some((child) => child.to === pathname) ||
										pathname.startsWith(`${item.to}/`)

									return (
										<Collapsible
											key={item.title}
											asChild
											defaultOpen={isActive}
											className="group/collapsible"
										>
											<SidebarMenuItem>
												<CollapsibleTrigger asChild>
													<SidebarMenuButton tooltip={item.title} isActive={isActive}>
														{item.icon && <item.icon className="size-4 shrink-0" />}
														<span>{item.title}</span>
														<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
													</SidebarMenuButton>
												</CollapsibleTrigger>
												<CollapsibleContent>
													<SidebarMenuSub>
														{item.children.map((subItem) => (
															<SidebarMenuSubItem key={subItem.title}>
																<SidebarMenuSubButton asChild isActive={pathname === subItem.to}>
																	<Link to={subItem.to}>
																		<span>{subItem.title}</span>
																	</Link>
																</SidebarMenuSubButton>
															</SidebarMenuSubItem>
														))}
													</SidebarMenuSub>
												</CollapsibleContent>
											</SidebarMenuItem>
										</Collapsible>
									)
								}

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={pathname === item.to}
											tooltip={item.title}
											className={cn(
												"px-3 py-5 data-[active=true]:text-sidebar-primary data-[active=true]:font-medium mx-auto",
												iconOnly && "justify-center gap-0",
											)}
										>
											<Link to={item.to}>
												{item.icon && <item.icon className="size-4 shrink-0" />}
												{showLabel && (
													<span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								)
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}
