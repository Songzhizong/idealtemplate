import { Loader2 } from "lucide-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface RenameInputProps {
	defaultValue: string
	className?: string
	onSubmit: (value: string) => Promise<void>
	onCancel: () => void
}

export function RenameInput({
	defaultValue,
	className,
	onSubmit,
	onCancel,
}: RenameInputProps) {
	const [value, setValue] = useState(defaultValue)
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		// Use setTimeout to ensure focus works after ContextMenu closes (which restores focus to trigger)
		const timer = setTimeout(() => {
			if (inputRef.current) {
				inputRef.current.focus()
				// Select filename without extension
				const lastDotIndex = defaultValue.lastIndexOf(".")
				if (lastDotIndex > 0) {
					inputRef.current.setSelectionRange(0, lastDotIndex)
				} else {
					inputRef.current.select()
				}
			}
		}, 0)
		return () => clearTimeout(timer)
	}, [defaultValue])

	// Scroll into view if needed
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline: "nearest",
			})
		}
	}, [])

	const validate = (val: string): string | null => {
		if (!val.trim()) return "名称不能为空"
		if (/[\/\\:*?"<>|]/.test(val)) {
			return "名称不能包含字符: \\ / : * ? \" < > |"
		}
		return null
	}

	const handleSubmit = async () => {
		const trimmed = value.trim()
		if (trimmed === defaultValue) {
			onCancel()
			return
		}

		const validationError = validate(trimmed)
		if (validationError) {
			setError(validationError)
			inputRef.current?.focus()
			return
		}

		setIsLoading(true)
		setError(null)
		try {
			await onSubmit(trimmed)
			// Success is handled by parent (unmounting this component)
		} catch (e) {
			setError("重命名失败，请重试")
			setIsLoading(false)
			inputRef.current?.focus()
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault()
			e.stopPropagation()
			void handleSubmit()
		} else if (e.key === "Escape") {
			e.preventDefault()
			e.stopPropagation()
			onCancel()
		}
	}

	const handleBlur = () => {
		// If we are loading, don't do anything on blur?
		// Or if we are loading, we can't really cancel or submit again.
		if (isLoading) return
		void handleSubmit()
	}

	return (
		<div className={cn("relative min-w-[200px]", className)}>
			<div className="relative">
				<Input
					ref={inputRef}
					value={value}
					onChange={(e) => {
						setValue(e.target.value)
						if (error) setError(null)
					}}
					onKeyDown={handleKeyDown}
					onBlur={handleBlur}
					disabled={isLoading}
					className={cn(
						"h-8 pr-8 transition-all duration-200",
						error && "border-destructive focus-visible:ring-destructive",
						// Dynamic width adjustment could be tricky with just CSS,
						// but standard Input is usually width: 100%.
						// The parent container controls the width.
					)}
					onClick={(e) => e.stopPropagation()}
				/>
				{isLoading && (
					<div className="absolute right-2 top-1/2 -translate-y-1/2">
						<Loader2 className="size-4 animate-spin text-muted-foreground" />
					</div>
				)}
			</div>
			{error && (
				<div className="absolute left-0 top-full z-50 mt-1 rounded bg-destructive/90 px-2 py-1 text-[10px] text-white shadow-md">
					{error}
				</div>
			)}
		</div>
	)
}
