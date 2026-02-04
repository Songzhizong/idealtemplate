import { Loader2 } from "lucide-react"
import type React from "react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface RenameInputProps {
	defaultValue: string
	className?: string
	onSubmit: (value: string) => Promise<void>
	onCancel: () => void
	multiline?: boolean
}

export function RenameInput({
	defaultValue,
	className,
	onSubmit,
	onCancel,
	multiline = false,
}: RenameInputProps) {
	const [value, setValue] = useState(defaultValue)
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
	const hasFocusedRef = useRef(false)
	const mountedAtRef = useRef(Date.now())
	const hasEditedRef = useRef(false)

	const adjustTextareaHeight = useCallback(() => {
		const el = inputRef.current
		if (!el || !(el instanceof HTMLTextAreaElement)) return
		el.style.height = "auto"
		el.style.height = `${el.scrollHeight}px`
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: Reset refs on defaultValue change
	useEffect(() => {
		mountedAtRef.current = Date.now()
		hasEditedRef.current = false
	}, [defaultValue])

	useLayoutEffect(() => {
		// Use rAF to ensure focus runs after ContextMenu closes (which restores focus to trigger)
		const rafId = requestAnimationFrame(() => {
			if (!inputRef.current) return
			inputRef.current.focus()
			hasFocusedRef.current = true
			const lastDotIndex = defaultValue.lastIndexOf(".")
			if (lastDotIndex > 0) {
				inputRef.current.setSelectionRange(0, lastDotIndex)
			} else {
				inputRef.current.select()
			}
		})
		return () => cancelAnimationFrame(rafId)
	}, [defaultValue])

	// biome-ignore lint/correctness/useExhaustiveDependencies: Update height on value change
	useLayoutEffect(() => {
		if (!multiline) return
		adjustTextareaHeight()
	}, [multiline, value, adjustTextareaHeight])

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
		if (/[\r\n]/.test(val)) return "名称不能包含换行"
		if (/[/\\:*?"<>|]/.test(val)) {
			return '名称不能包含字符: \\ / : * ? " < > |'
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
		} catch (_e) {
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
		if (!hasFocusedRef.current) return
		if (
			!hasEditedRef.current &&
			value.trim() === defaultValue &&
			Date.now() - mountedAtRef.current < 200
		) {
			return
		}
		// If we are loading, don't do anything on blur?
		// Or if we are loading, we can't really cancel or submit again.
		if (isLoading) return
		void handleSubmit()
	}

	return (
		<div className={cn("relative min-w-[200px]", className)}>
			<div className="relative">
				{multiline ? (
					<Textarea
						ref={inputRef as React.RefObject<HTMLTextAreaElement>}
						autoFocus
						rows={1}
						value={value}
						onChange={(e) => {
							setValue(e.target.value)
							hasEditedRef.current = true
							if (error) setError(null)
						}}
						onFocus={() => {
							hasFocusedRef.current = true
						}}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						disabled={isLoading}
						className={cn(
							"min-h-10 resize-none overflow-hidden py-1.5 pr-8 leading-5",
							"transition-all duration-200",
							error && "border-destructive focus-visible:ring-destructive",
						)}
						onClick={(e) => e.stopPropagation()}
					/>
				) : (
					<Input
						ref={inputRef as React.RefObject<HTMLInputElement>}
						autoFocus
						value={value}
						onChange={(e) => {
							setValue(e.target.value)
							hasEditedRef.current = true
							if (error) setError(null)
						}}
						onFocus={() => {
							hasFocusedRef.current = true
						}}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						disabled={isLoading}
						className={cn(
							"h-8 pr-8",
							"transition-all duration-200",
							error && "border-destructive focus-visible:ring-destructive",
						)}
						onClick={(e) => e.stopPropagation()}
					/>
				)}
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
