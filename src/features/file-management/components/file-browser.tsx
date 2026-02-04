import type { ColumnDef } from "@tanstack/react-table"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Folder, Upload } from "lucide-react"
import { type MouseEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { formatTimestampToDateTime } from "@/lib/time-utils.ts"
import type { FileManagerItem } from "../types"
import { formatFileSize, getFileStyle, parseObjectSize } from "../utils/file-utils"
import type { FileBrowserItemActionHandlers } from "./file-browser-actions"
import { ActionCell } from "./file-browser-actions"
import { FileBrowserGrid } from "./file-browser-grid"
import { FileBrowserItemMenuContent } from "./file-browser-item-menu"
import { FileBrowserTable } from "./file-browser-table"
import { buildDragPayload } from "./file-browser-utils"
import { RenameInput } from "./rename-input"

interface FileBrowserProps extends FileBrowserItemActionHandlers {
	items: FileManagerItem[]
	viewMode: "grid" | "list"
	selectedIds: string[]
	onSelectionChange: (ids: string[]) => void
	onCreateFolder: () => void
	onRefresh: () => void
	onUploadFiles: (files: File[]) => void
	onTriggerUpload: () => void
	isRecycleBin: boolean
	loading: boolean
	isFetchingNextPage?: boolean
	hasNextPage?: boolean
	onLoadMore?: () => void
	onMoveItemToCatalog: (targetId: string, ids: string[]) => void
	getPreviewUrl: (id: string) => string
	renamingId?: string | null
	onConfirmRename?: (id: string, name: string, kind: "file" | "folder") => Promise<void>
	onCancelRename?: () => void
}

export const FileBrowser = memo(function FileBrowser({
	items,
	viewMode,
	selectedIds,
	onSelectionChange,
	onOpenItem,
	onRenameItem,
	onMoveItem,
	onMoveItemToCatalog,
	onDeleteItem,
	onRecoverItem,
	onHardDeleteItem,
	onCopyLink,
	onDownloadItem,
	onCreateFolder,
	onRefresh,
	onUploadFiles,
	onTriggerUpload,
	isRecycleBin,
	loading,
	isFetchingNextPage,
	hasNextPage,
	onLoadMore,
	getPreviewUrl,
	renamingId,
	onConfirmRename,
	onCancelRename,
}: FileBrowserProps) {
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
	const selectedIdsRef = useRef(selectedIds)
	const selectedSetRef = useRef(selectedSet)
	const lastSelectedIndexRef = useRef<number | null>(null)
	const isDraggingRef = useRef(false)
	const containerRef = useRef<HTMLDivElement | null>(null)
	const observerRef = useRef<HTMLDivElement | null>(null)
	const [contextMenuItem, setContextMenuItem] = useState<FileManagerItem | null>(null)

	useEffect(() => {
		selectedIdsRef.current = selectedIds
		selectedSetRef.current = selectedSet
	}, [selectedIds, selectedSet])

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && selectedIdsRef.current.length > 0) {
				// Don't deselect if we are in an input/textarea (though we handle that contextually usually)
				// Here we just want to clear selection if we have one.
				if (
					document.activeElement?.tagName === "INPUT" ||
					document.activeElement?.tagName === "TEXTAREA"
				) {
					// Check if it's our checkbox, if so, we DO want to deselect
					if (document.activeElement.getAttribute("data-selection-target") === "checkbox") {
						// fall through to deselect
					} else {
						return
					}
				}

				event.preventDefault()
				onSelectionChange([])
				lastSelectedIndexRef.current = null
			}
		}

		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [onSelectionChange])

	useEffect(() => {
		if (!onLoadMore || !hasNextPage || isFetchingNextPage) return

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0]
				if (entry?.isIntersecting) {
					onLoadMore()
				}
			},
			{ threshold: 0.1 },
		)

		if (observerRef.current) {
			observer.observe(observerRef.current)
		}

		return () => observer.disconnect()
	}, [onLoadMore, hasNextPage, isFetchingNextPage])

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: (acceptedFiles: File[]) => {
			if (acceptedFiles.length === 0) return
			onUploadFiles(acceptedFiles)
		},
		noClick: true,
		disabled: isRecycleBin,
	})

	const handleDragStart = useCallback(
		(event: React.DragEvent, item: FileManagerItem) => {
			if (isRecycleBin) return

			const ids = selectedSetRef.current.has(item.id) ? selectedIdsRef.current : [item.id]
			const itemIds = items.filter((entry) => ids.includes(entry.id)).map((entry) => entry.id)

			event.dataTransfer.setData("application/x-file-ids", buildDragPayload(itemIds))
			event.dataTransfer.effectAllowed = "move"

			// Create custom drag preview
			const preview = document.createElement("div")
			preview.style.position = "absolute"
			preview.style.top = "-1000px"
			preview.style.left = "-1000px"
			preview.style.zIndex = "1000"
			preview.style.pointerEvents = "none"

			const inner = document.createElement("div")
			inner.style.pointerEvents = "none"

			if (itemIds.length > 1) {
				// Stacked effect for multi-selection
				inner.className = "relative"
				inner.style.width = "140px"
				inner.style.height = "44px"

				// Back layers for stacking effect
				for (let i = 2; i > 0; i--) {
					const layer = document.createElement("div")
					layer.className =
						"absolute rounded-lg border-2 border-dashed border-green-500 bg-background/40 shadow-sm"
					layer.style.borderColor = "#10b981"
					layer.style.width = "120px"
					layer.style.height = "36px"
					layer.style.top = `${i * 4}px`
					layer.style.left = `${i * 4}px`
					layer.style.zIndex = String(10 - i)
					inner.appendChild(layer)
				}

				// Top layer
				const topLayer = document.createElement("div")
				topLayer.className =
					"absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-green-500 bg-background/90 px-2 shadow-xl"
				topLayer.style.borderColor = "#10b981"
				topLayer.style.width = "120px"
				topLayer.style.height = "36px"

				const badge = document.createElement("div")
				badge.className =
					"flex items-center gap-1.5 rounded-full bg-green-500 p-0.5 pr-2.5 text-white"
				badge.style.backgroundColor = "#10b981"

				const countCircle = document.createElement("div")
				countCircle.className =
					"flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-green-500"
				countCircle.style.color = "#10b981"
				countCircle.textContent = String(itemIds.length)
				badge.appendChild(countCircle)

				const moveText = document.createElement("span")
				moveText.className = "whitespace-nowrap text-[12px] font-bold"
				moveText.textContent = `移动 ${itemIds.length} 项`
				badge.appendChild(moveText)

				topLayer.appendChild(badge)
				inner.appendChild(topLayer)
			} else {
				// Single item preview (keep filename)
				inner.className =
					"flex items-center gap-2 rounded-lg border-2 border-dashed border-green-500 bg-background/90 px-3 py-1.5 shadow-xl"
				inner.style.borderColor = "#10b981"

				const nameText = document.createElement("span")
				nameText.className = "max-w-[150px] truncate text-sm font-medium"
				nameText.textContent = item.name
				inner.appendChild(nameText)
			}

			preview.appendChild(inner)
			document.body.appendChild(preview)

			event.dataTransfer.setDragImage(inner, 20, 20)

			// Remove the preview element after a delay
			setTimeout(() => {
				document.body.removeChild(preview)
			}, 0)
		},
		[items, isRecycleBin],
	)

	const handleSelect = useCallback(
		(index: number, id: string, event: MouseEvent) => {
			event.stopPropagation()
			const isMulti = event.metaKey || event.ctrlKey
			const isRange = event.shiftKey

			// Region selection with Shift
			if (isRange && lastSelectedIndexRef.current !== null) {
				const start = Math.min(lastSelectedIndexRef.current, index)
				const end = Math.max(lastSelectedIndexRef.current, index)
				const rangeIds = items.slice(start, end + 1).map((item) => item.id)

				let next: Set<string>
				if (isMulti) {
					// Add range to existing selection if Ctrl/Cmd is also pressed
					next = new Set(selectedIdsRef.current)
					for (const rangeId of rangeIds) {
						next.add(rangeId)
					}
				} else {
					// Replace selection with range
					next = new Set(rangeIds)
				}

				onSelectionChange(Array.from(next))
				// Note: standard file manager behavior usually doesn't update pivot on shift-click
				// but we'll follow simple logic for now.
				return
			}

			// Toggle selection with Ctrl/Cmd (Multi-select)
			if (isMulti) {
				const next = new Set(selectedIdsRef.current)
				if (next.has(id)) {
					next.delete(id)
				} else {
					next.add(id)
				}
				onSelectionChange(Array.from(next))
				lastSelectedIndexRef.current = index
				return
			}

			// Normal click: select single item
			onSelectionChange([id])
			lastSelectedIndexRef.current = index
		},
		[items, onSelectionChange],
	)

	const actionProps = useMemo(
		() => ({
			isRecycleBin,
			onOpenItem,
			onDownloadItem,
			onRenameItem,
			onMoveItem,
			onCopyLink,
			onDeleteItem,
			onRecoverItem,
			onHardDeleteItem,
		}),
		[
			isRecycleBin,
			onCopyLink,
			onDeleteItem,
			onDownloadItem,
			onHardDeleteItem,
			onMoveItem,
			onOpenItem,
			onRecoverItem,
			onRenameItem,
		],
	)

	const handleItemContextMenu = useCallback((item: FileManagerItem | null) => {
		setContextMenuItem(item)
	}, [])

	const [dragOverId, setDragOverId] = useState<string | null>(null)

	const handleDragOverItem = useCallback(
		(event: React.DragEvent, item: FileManagerItem) => {
			if (isRecycleBin || item.kind !== "folder") return
			// Don't allow dropping on itself or its children (though here children are not nested in the list)
			if (selectedSetRef.current.has(item.id)) return

			event.preventDefault()
			event.dataTransfer.dropEffect = "move"
			setDragOverId(item.id)
		},
		[isRecycleBin],
	)

	const handleDragLeaveItem = useCallback(() => {
		setDragOverId(null)
	}, [])

	const handleDropOnItem = useCallback(
		(event: React.DragEvent, item: FileManagerItem) => {
			if (isRecycleBin || item.kind !== "folder") return
			event.preventDefault()
			setDragOverId(null)

			const payload = event.dataTransfer.getData("application/x-file-ids")
			if (!payload) return

			try {
				const ids = JSON.parse(payload) as string[]
				if (Array.isArray(ids) && ids.length > 0) {
					onMoveItemToCatalog(item.id, ids)
				}
			} catch (e) {
				console.error("Failed to parse drag payload", e)
			}
		},
		[isRecycleBin, onMoveItemToCatalog],
	)

	const contextMenuActions = useMemo(
		() => ({
			onOpenItem,
			onDownloadItem,
			onRenameItem,
			onMoveItem,
			onCopyLink,
			onDeleteItem,
			onRecoverItem,
			onHardDeleteItem,
		}),
		[
			onOpenItem,
			onDownloadItem,
			onRenameItem,
			onMoveItem,
			onCopyLink,
			onDeleteItem,
			onRecoverItem,
			onHardDeleteItem,
		],
	)

	const columns = useMemo<ColumnDef<FileManagerItem>[]>(
		() => [
			{
				id: "icon",
				header: "",
				cell: ({ row }) => {
					const item = row.original
					if (item.kind === "folder") {
						return <Folder className="size-4 text-primary" />
					}
					const style = getFileStyle(item.name, item.contentType, "sm")
					return <span className={style.iconColor}>{style.icon}</span>
				},
				meta: {
					className: "w-8",
				},
			},
			{
				id: "name",
				header: "名称",
				accessorKey: "name",
				cell: ({ row }) => {
					const item = row.original
					if (renamingId === item.id) {
						return (
							<RenameInput
								defaultValue={item.name}
								className="w-full max-w-xs"
								onSubmit={(val) => onConfirmRename?.(item.id, val, item.kind) ?? Promise.resolve()}
								onCancel={() => onCancelRename?.()}
							/>
						)
					}
					return (
						<div className="min-w-0">
							<p className="truncate text-sm font-medium">{item.name}</p>
						</div>
					)
				},
			},
			{
				id: "size",
				header: "大小",
				cell: ({ row }) => {
					const item = row.original
					return (
						<span className="text-sm text-muted-foreground">
							{item.kind === "folder" ? "-" : formatFileSize(parseObjectSize(item.objectSize))}
						</span>
					)
				},
				meta: {
					className: "w-28",
				},
			},
			{
				id: "updated",
				header: "修改时间",
				cell: ({ row }) => {
					const item = row.original
					const time =
						item.kind === "folder" ? item.deleteTime : (item.deleteTime ?? item.createdTime)
					return (
						<span className="text-sm text-muted-foreground">{formatTimestampToDateTime(time)}</span>
					)
				},
				meta: {
					className: "w-36",
				},
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => <ActionCell item={row.original} {...actionProps} />,
				meta: {
					className: "w-16 text-right",
				},
			},
		],
		[actionProps, renamingId, onConfirmRename, onCancelRename],
	)

	const table = useReactTable({
		data: items,
		columns,
		getCoreRowModel: getCoreRowModel(),
	})

	return (
		<div
			className="relative flex flex-1 flex-col overflow-hidden outline-none"
			{...getRootProps({
				tabIndex: 0,
			})}
		>
			<input {...getInputProps()} />

			<ContextMenu onOpenChange={(open) => !open && setContextMenuItem(null)}>
				<ContextMenuTrigger asChild>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: Keyboard interaction handled by parent container */}
					{/* biome-ignore lint/a11y/noStaticElementInteractions: Container used for background click selection clear */}
					<div
						ref={(el) => {
							containerRef.current = el
						}}
						className="relative h-full select-none"
						onMouseDown={(event) => {
							if (event.button !== 0) return
							const target = event.target as HTMLElement
							const itemTarget = target.closest("[data-selection-id]")
							const isCheckbox = !!target.closest('[data-selection-target="checkbox"]')

							// Background click behavior only
							if (itemTarget && !isCheckbox) return

							isDraggingRef.current = false
						}}
						onClick={(event) => {
							if (isDraggingRef.current) return
							if (!(event.target as HTMLElement).closest("[data-selection-id]")) {
								onSelectionChange([])
								lastSelectedIndexRef.current = null
							}
						}}
						onContextMenu={(event) => {
							if (!(event.target as HTMLElement).closest("[data-selection-id]")) {
								handleItemContextMenu(null)
							}
						}}
					>
						{loading ? (
							<div className="flex h-full items-center justify-center">
								<Spinner className="size-8" />
							</div>
						) : viewMode === "grid" ? (
							<div className="h-full overflow-auto p-4">
								<FileBrowserGrid
									items={items}
									selectedSet={selectedSet}
									isRecycleBin={isRecycleBin}
									onSelectItem={handleSelect}
									onOpenItem={onOpenItem}
									onItemContextMenu={handleItemContextMenu}
									onDragStart={handleDragStart}
									onDragOverItem={handleDragOverItem}
									onDragLeaveItem={handleDragLeaveItem}
									onDropOnItem={handleDropOnItem}
									dragOverId={dragOverId}
									getPreviewUrl={getPreviewUrl}
								/>
								<div ref={observerRef} className="h-4 w-full">
									{isFetchingNextPage && (
										<div className="flex h-10 items-center justify-center p-4">
											<Skeleton className="h-4 w-32" />
										</div>
									)}
								</div>
							</div>
						) : (
							<div className="flex h-full flex-col overflow-hidden">
								<FileBrowserTable
									table={table}
									items={items}
									selectedSet={selectedSet}
									isRecycleBin={isRecycleBin}
									onSelectItem={handleSelect}
									onOpenItem={onOpenItem}
									onItemContextMenu={handleItemContextMenu}
									onDragStart={handleDragStart}
									onDragOverItem={handleDragOverItem}
									onDragLeaveItem={handleDragLeaveItem}
									onDropOnItem={handleDropOnItem}
									dragOverId={dragOverId}
									observerRef={observerRef}
									isFetchingNextPage={isFetchingNextPage}
								/>
							</div>
						)}
					</div>
				</ContextMenuTrigger>

				{contextMenuItem ? (
					<FileBrowserItemMenuContent
						item={contextMenuItem}
						isRecycleBin={isRecycleBin}
						{...contextMenuActions}
					/>
				) : (
					<ContextMenuContent className="w-48">
						{!isRecycleBin && (
							<>
								<ContextMenuItem onSelect={onCreateFolder}>新建文件夹</ContextMenuItem>
								<ContextMenuItem onSelect={onTriggerUpload}>
									<Upload className="mr-2 size-4" />
									上传文件
								</ContextMenuItem>
								<ContextMenuSeparator />
							</>
						)}
						<ContextMenuItem onSelect={onRefresh}>刷新</ContextMenuItem>
					</ContextMenuContent>
				)}
			</ContextMenu>

			{isDragActive && !isRecycleBin && (
				<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/80">
					<div className="rounded-lg border border-dashed border-border bg-card px-6 py-4 text-center">
						<Upload className="mx-auto mb-2 size-6 text-primary" />
						<p className="text-sm font-medium">释放以上传文件</p>
						<p className="text-xs text-muted-foreground">支持拖拽多个文件</p>
					</div>
				</div>
			)}
		</div>
	)
})
