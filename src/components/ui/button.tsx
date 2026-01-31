import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

export const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 focus-visible:ring-primary",
				ghost:
					"bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring",
				outline:
					"border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring",
				destructive:
					"bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:ring-destructive",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
				link: "text-primary underline-offset-4 hover:underline",
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
	loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
		if (asChild) {
			return (
				<Slot ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props}>
					{children}
				</Slot>
			)
		}

		return (
			<button
				ref={ref}
				className={cn(buttonVariants({ variant, size, className }))}
				disabled={loading || disabled}
				{...props}
			>
				{loading && <Loader2 className="h-4 w-4 animate-spin" />}
				{children}
			</button>
		)
	},
)

Button.displayName = "Button"
