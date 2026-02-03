import type * as React from "react"
import { SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type AppSheetContentProps = React.ComponentProps<typeof SheetContent> & {
	variant?: "floating" | "flush"
}

const floatingSideClass: Record<NonNullable<AppSheetContentProps["side"]>, string> = {
	right: "right-4 inset-y-4 h-[calc(100%-2rem)]",
	left: "left-4 inset-y-4 h-[calc(100%-2rem)]",
	top: "top-4 inset-x-4 h-auto",
	bottom: "bottom-4 inset-x-4 h-auto",
}

export function AppSheetContent({
	className,
	side = "right",
	variant = "floating",
	...props
}: AppSheetContentProps) {
	const variantClass =
		variant === "floating"
			? cn(floatingSideClass[side], "rounded-2xl border border-border/50 shadow-xl")
			: ""

	return (
		<SheetContent side={side} data-side={side} className={cn(variantClass, className)} {...props} />
	)
}
