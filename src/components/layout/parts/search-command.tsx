import { useNavigate } from "@tanstack/react-router"
import { Command } from "lucide-react"
import { pinyin } from "pinyin-pro"
import * as React from "react"
import { ALL_NAV } from "@/components/layout/nav-config"
import { Input } from "@/components/ui/input"

interface SearchCommandProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
	const searchInputRef = React.useRef<HTMLInputElement>(null)
	const [searchQuery, setSearchQuery] = React.useState("")
	const [selectedIndex, setSelectedIndex] = React.useState(0)
	const navigate = useNavigate()

	const filteredMenuItems = React.useMemo(() => {
		const query = searchQuery.toLowerCase().trim()
		if (!query) return ALL_NAV

		return ALL_NAV.filter((item) => {
			const title = item.title.toLowerCase()
			// Convert Chinese to pinyin (full and first letters)
			const pinyinFull = pinyin(item.title, { toneType: "none", type: "array" })
				.join("")
				.toLowerCase()
			const pinyinFirst = pinyin(item.title, { pattern: "first", toneType: "none" }).toLowerCase()

			return title.includes(query) || pinyinFull.includes(query) || pinyinFirst.includes(query)
		})
	}, [searchQuery])

	React.useEffect(() => {
		if (open) {
			setSelectedIndex(0)
			setSearchQuery("")
			// Use setTimeout to ensure state updates before focusing
			setTimeout(() => {
				searchInputRef.current?.focus()
			}, 0)
		}
	}, [open])
	React.useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null
			const isEditable =
				target &&
				(target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)

			if (!open) {
				if (!isEditable && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
					event.preventDefault()
					onOpenChange(true)
				}
				return
			}

			if (event.key === "Escape") {
				event.preventDefault()
				onOpenChange(false)
				return
			}

			if (event.key === "ArrowDown") {
				event.preventDefault()
				setSelectedIndex((prev) => (prev + 1) % filteredMenuItems.length)
				return
			}

			if (event.key === "ArrowUp") {
				event.preventDefault()
				setSelectedIndex((prev) => (prev - 1 + filteredMenuItems.length) % filteredMenuItems.length)
				return
			}

			if (event.key === "Enter" && filteredMenuItems.length > 0) {
				event.preventDefault()
				const selectedItem = filteredMenuItems[selectedIndex]
				if (selectedItem) {
					void navigate({ to: selectedItem.to })
					onOpenChange(false)
				}
			}
		}

		window.addEventListener("keydown", onKeyDown)
		return () => window.removeEventListener("keydown", onKeyDown)
	}, [open, onOpenChange, navigate, filteredMenuItems, selectedIndex])

	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-12">
			<button
				type="button"
				className="fixed inset-0 bg-overlay/50"
				onClick={() => onOpenChange(false)}
				aria-label="Close search"
			/>
			<div
				className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl"
				role="dialog"
				aria-modal="true"
				aria-label="Search navigation"
			>
				<div className="flex items-center gap-3">
					<Command className="size-4 text-muted-foreground" />
					<Input
						ref={searchInputRef}
						value={searchQuery}
						onChange={(event) => {
							setSearchQuery(event.target.value)
							setSelectedIndex(0)
						}}
						placeholder="搜索菜单..."
						className="h-11 border-border/50 bg-background"
					/>
					<button
						type="button"
						className="flex h-9 items-center justify-center rounded-lg bg-accent px-3 text-xs font-medium text-accent-foreground transition hover:bg-accent/80"
						onClick={() => onOpenChange(false)}
					>
						Esc
					</button>
				</div>
				<div className="mt-4 space-y-1.5">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
						菜单列表
					</p>
					<div className="max-h-96 space-y-0.5 overflow-y-auto">
						{filteredMenuItems.length > 0 ? (
							filteredMenuItems.map((item, index) => {
								const Icon = item.icon
								return (
									<button
										key={`${item.to}-${index}`}
										className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
											index === selectedIndex
												? "bg-primary/10 text-primary"
												: "text-foreground hover:bg-accent/50"
										}`}
										type="button"
										onClick={() => {
											void navigate({ to: item.to })
											onOpenChange(false)
										}}
										onMouseEnter={() => setSelectedIndex(index)}
									>
										<Icon
											className={`size-4 ${index === selectedIndex ? "text-primary" : "text-muted-foreground"}`}
										/>
										<span>{item.title}</span>
										<span className="ml-auto text-xs text-muted-foreground">{item.to}</span>
									</button>
								)
							})
						) : (
							<div className="py-6 text-center text-sm text-muted-foreground">未找到匹配的菜单</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
