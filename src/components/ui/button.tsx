import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"

export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
	{
		variants: {
			variant: {
				default: "bg-primary text-brand-text hover:opacity-90 focus-visible:ring-primary",
				ghost:
					"bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-slate-400",
				outline:
					"border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-slate-400",
			},
			size: {
				sm: "h-9 px-4",
				md: "h-11 px-6",
				lg: "h-12 px-8 text-base",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button"
		return (
			<Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
		)
	},
)

Button.displayName = "Button"
