import { Slot } from "@radix-ui/react-slot"
import { PanelLeft } from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const SIDEBAR_STORAGE_KEY = "sidebar:state"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarState = "expanded" | "collapsed"

type SidebarContextValue = {
	state: SidebarState
	open: boolean
	setOpen: (open: boolean) => void
	openMobile: boolean
	setOpenMobile: (open: boolean) => void
	isMobile: boolean
	toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar() {
	const context = React.useContext(SidebarContext)
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider")
	}
	return context
}

interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
	sidebarWidth?: number
	sidebarCollapsedWidth?: number
}

export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
	(
		{
			defaultOpen = true,
			open: openProp,
			onOpenChange,
			sidebarWidth = 240,
			sidebarCollapsedWidth = 74,
			className,
			children,
			...props
		},
		ref,
	) => {
		const isMobile = useIsMobile()

		// Synchronously read stored state to prevent flash
		const getInitialState = React.useCallback(() => {
			if (typeof window === "undefined") {
				return defaultOpen
			}

			const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)

			if (stored === "expanded" || stored === "collapsed") {
				return stored === "expanded"
			}

			return defaultOpen
		}, [defaultOpen])

		const [openState, setOpenState] = React.useState(getInitialState)
		const [openMobile, setOpenMobile] = React.useState(false)
		const [isInitialized, setIsInitialized] = React.useState(false)

		const open = openProp ?? openState

		const setOpen = React.useCallback(
			(value: boolean) => {
				if (onOpenChange) {
					onOpenChange(value)
				} else {
					setOpenState(value)
				}

				if (typeof window !== "undefined") {
					window.localStorage.setItem(SIDEBAR_STORAGE_KEY, value ? "expanded" : "collapsed")
				}
			},
			[onOpenChange],
		)

		React.useEffect(() => {
			// Mark as initialized after first render to enable transitions
			setIsInitialized(true)
		}, [])

		React.useEffect(() => {
			if (!isMobile) {
				setOpenMobile(false)
			}
		}, [isMobile])

		const toggleSidebar = React.useCallback(() => {
			if (isMobile) {
				setOpenMobile((current) => !current)
			} else {
				setOpen(!open)
			}
		}, [isMobile, open, setOpen])

		React.useEffect(() => {
			const onKeyDown = (event: KeyboardEvent) => {
				if (!(event.metaKey || event.ctrlKey)) {
					return
				}

				if (event.key.toLowerCase() !== SIDEBAR_KEYBOARD_SHORTCUT) {
					return
				}

				event.preventDefault()
				toggleSidebar()
			}

			window.addEventListener("keydown", onKeyDown)
			return () => window.removeEventListener("keydown", onKeyDown)
		}, [toggleSidebar])

		const state: SidebarState = open ? "expanded" : "collapsed"

		const value = React.useMemo(
			() => ({
				state,
				open,
				setOpen,
				openMobile,
				setOpenMobile,
				isMobile,
				toggleSidebar,
			}),
			[state, open, setOpen, openMobile, isMobile, toggleSidebar],
		)

		return (
			<SidebarContext.Provider value={value}>
				<div
					ref={ref}
					className={cn("flex h-screen w-full", className)}
					style={
						{
							"--sidebar-width": `${sidebarWidth}px`,
							"--sidebar-width-collapsed": `${sidebarCollapsedWidth}px`,
						} as React.CSSProperties
					}
					data-sidebar-initialized={isInitialized}
					{...props}
				>
					{children}
				</div>
			</SidebarContext.Provider>
		)
	},
)

SidebarProvider.displayName = "SidebarProvider"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
	collapsible?: "icon" | "none"
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
	({ collapsible = "icon", className, children, ...props }, ref) => {
		const { state, openMobile, setOpenMobile, isMobile } = useSidebar()

		if (isMobile) {
			return (
				<Sheet open={openMobile} onOpenChange={setOpenMobile}>
					<SheetContent
						side="left"
						className={cn("p-0", className)}
						style={{ width: "var(--sidebar-width)" }}
					>
						<SheetTitle className="sr-only">Sidebar</SheetTitle>
						<SheetDescription className="sr-only">Navigation menu</SheetDescription>
						<div
							ref={ref}
							className="flex h-full flex-col bg-sidebar px-4 py-6"
							data-state={state}
							{...props}
						>
							{children}
						</div>
					</SheetContent>
				</Sheet>
			)
		}

		const isCollapsed = state === "collapsed" || collapsible === "none"

		return (
			<aside
				ref={ref}
				data-state={state}
				data-collapsible={collapsible}
				className={cn(
					"relative hidden min-h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-6 shadow-[0_0_30px_rgba(0,0,0,0.04)] lg:flex",
					"[div[data-sidebar-initialized='true']_&]:transition-[width] [div[data-sidebar-initialized='true']_&]:duration-500",
					className,
				)}
				style={{
					width: isCollapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)",
				}}
				{...props}
			>
				{children}
			</aside>
		)
	},
)

Sidebar.displayName = "Sidebar"

export const SidebarTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ComponentPropsWithoutRef<typeof Button>
>(({ className, onClick, ...props }, ref) => {
	const { toggleSidebar, state, isMobile } = useSidebar()

	return (
		<Button
			ref={ref}
			variant="ghost"
			size="sm"
			className={cn("h-10 w-10 rounded-full p-0", className)}
			onClick={(event) => {
				onClick?.(event)
				if (!event.defaultPrevented) {
					toggleSidebar()
				}
			}}
			aria-label={
				isMobile ? "Open navigation" : state === "expanded" ? "Collapse sidebar" : "Expand sidebar"
			}
			{...props}
		>
			<PanelLeft className="size-4" />
		</Button>
	)
})

SidebarTrigger.displayName = "SidebarTrigger"

export const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("flex flex-col gap-4 px-2 pb-5", className)} {...props} />
	),
)

SidebarHeader.displayName = "SidebarHeader"

export const SidebarContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("flex-1 overflow-y-auto px-2", className)} {...props} />
))

SidebarContent.displayName = "SidebarContent"

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("mt-auto px-2 pt-5", className)} {...props} />
	),
)

SidebarFooter.displayName = "SidebarFooter"

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("space-y-3", className)} {...props} />
	),
)

SidebarGroup.displayName = "SidebarGroup"

export const SidebarGroupLabel = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn(
			"text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-sidebar-foreground/60",
			className,
		)}
		{...props}
	/>
))

SidebarGroupLabel.displayName = "SidebarGroupLabel"

export const SidebarGroupContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("space-y-1", className)} {...props} />
))

SidebarGroupContent.displayName = "SidebarGroupContent"

export const SidebarMenu = React.forwardRef<
	HTMLUListElement,
	React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
	<ul ref={ref} className={cn("space-y-1", className)} {...props} />
))

SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
	({ className, ...props }, ref) => (
		<li ref={ref} className={cn("relative", className)} {...props} />
	),
)

SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	asChild?: boolean
	isActive?: boolean
	tooltip?: React.ReactNode
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
	({ asChild, className, isActive, tooltip, onClick, children, ...props }, ref) => {
		const { state, isMobile, setOpenMobile } = useSidebar()
		const collapsed = state === "collapsed" && !isMobile
		const Comp = asChild ? Slot : "button"

		const content = (
			<Comp
				ref={ref}
				className={cn(
					"flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition cursor-pointer",
					isActive
						? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
						: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
					collapsed && "justify-center px-2",
					className,
				)}
				aria-current={isActive ? "page" : undefined}
				onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
					onClick?.(event)
					if (!event.defaultPrevented && isMobile) {
						setOpenMobile(false)
					}
				}}
				{...props}
			>
				{children}
			</Comp>
		)

		if (tooltip && collapsed) {
			return (
				<TooltipProvider delayDuration={200}>
					<Tooltip>
						<TooltipTrigger asChild>{content}</TooltipTrigger>
						<TooltipContent side="right" align="center">
							{tooltip}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)
		}

		return content
	},
)

SidebarMenuButton.displayName = "SidebarMenuButton"
