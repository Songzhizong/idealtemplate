import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				ref={ref}
				className={cn(
					"min-h-30 w-full rounded-lg border border-input bg-form-input px-4 py-3 text-sm text-foreground shadow-sm outline-none placeholder:text-text-placeholder focus-visible:ring-2 focus-visible:ring-form-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
					className,
				)}
				{...props}
			/>
		)
	},
)
Textarea.displayName = "Textarea"
