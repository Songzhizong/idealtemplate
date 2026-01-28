import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				ref={ref}
				type={type}
				className={cn(
					"flex h-11 w-full rounded-lg border border-input bg-form-input px-4 text-sm text-foreground shadow-sm outline-none placeholder:text-text-placeholder focus-visible:ring-2 focus-visible:ring-form-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
					className,
				)}
				{...props}
			/>
		)
	},
)
Input.displayName = "Input"
