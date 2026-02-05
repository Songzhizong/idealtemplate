"use client"

import type { ComponentProps, ReactNode, RefObject } from "react"
import {
	type ImperativePanelHandle,
	Panel,
	PanelGroup,
	PanelResizeHandle,
} from "react-resizable-panels"

import { useThemeStore } from "@/hooks/use-theme-store"

interface FileManagerLayoutProps {
	sidebar: ReactNode
	children: ReactNode
	sidebarRef: RefObject<ImperativePanelHandle | null>
	onCollapse?: ComponentProps<typeof Panel>["onCollapse"]
	onExpand?: ComponentProps<typeof Panel>["onExpand"]
}

export function FileManagerLayout({
	sidebar,
	children,
	sidebarRef,
	onCollapse,
	onExpand,
}: FileManagerLayoutProps) {
	const headerHeight = useThemeStore((state) => state.layout.headerHeight)

	return (
		<div
			className="h-full overflow-hidden rounded-xl border border-border/30 bg-card shadow-sm"
			style={{ height: `calc(100vh - ${headerHeight}px - 32px)` }}
		>
			<PanelGroup direction="horizontal">
				<Panel
					ref={sidebarRef}
					defaultSize={24}
					minSize={18}
					maxSize={32}
					collapsible
					{...(onCollapse ? { onCollapse } : {})}
					{...(onExpand ? { onExpand } : {})}
				>
					{sidebar}
				</Panel>
				<PanelResizeHandle className="w-1 cursor-col-resize bg-transparent hover:bg-primary/10" />
				<Panel>{children}</Panel>
			</PanelGroup>
		</div>
	)
}
