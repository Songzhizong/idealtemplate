import type * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusBadgeTone = "success" | "warning" | "error" | "info" | "neutral"
export type StatusBadgeVariant = "subtle" | "solid"

const toneClassMap: Record<StatusBadgeTone, Record<StatusBadgeVariant, string>> = {
	success: {
		subtle: "border-success/20 bg-success-subtle text-success-on-subtle",
		solid: "border-success/30 bg-success text-success-foreground",
	},
	warning: {
		subtle: "border-warning/20 bg-warning-subtle text-warning-on-subtle",
		solid: "border-warning/30 bg-warning text-warning-foreground",
	},
	error: {
		subtle: "border-error/20 bg-error-subtle text-error-on-subtle",
		solid: "border-error/30 bg-error text-error-foreground",
	},
	info: {
		subtle: "border-info/20 bg-info-subtle text-info-on-subtle",
		solid: "border-info/30 bg-info text-info-foreground",
	},
	neutral: {
		subtle: "border-border/50 bg-muted text-muted-foreground",
		solid: "border-border/60 bg-secondary text-secondary-foreground",
	},
}

type StatusBadgeProps = Omit<React.ComponentProps<typeof Badge>, "variant"> & {
	tone: StatusBadgeTone
	variant?: StatusBadgeVariant
}

export function StatusBadge({ tone, variant = "subtle", className, ...props }: StatusBadgeProps) {
	return (
		<Badge
			variant="outline"
			className={cn("border", toneClassMap[tone][variant], className)}
			{...props}
		/>
	)
}
