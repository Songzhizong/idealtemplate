"use client"

import {
	ChevronDown,
	ChevronRight,
	Download,
	Folder,
	FolderInput,
	FolderOpen,
	FolderPlus,
	Globe,
	FoldVertical,
	LocateFixed,
	MoreHorizontal,
	Pencil,
	RefreshCw,
	Trash2,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React, {
	type DragEvent,
	type MouseEvent,
	memo,
	useCallback,
	useEffect,
	useState,
} from "react"
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { RenameInput } from "./rename-input"
import type { FileCatalog } from "../types"

export type TreeAction =
	| "create"
	| "rename"
	| "move"
	| "download"
	| "toggle-public"
	| "delete"
	| "refresh"

interface FileManagerTreeProps {
	nodes: FileCatalog[]
	selectedId: string | null
	onSelect: (id: string | null) => void
	onDropFiles?: (targetCatalogId: string, fileIds: string[]) => void
	onAction?: (action: TreeAction, node: FileCatalog) => void
	disabledIds?: string[]
	pathIds?: Set<string> | undefined
	level?: number
	collapseVersion?: number
	locateTrigger?: number | undefined
	renamingId?: string | null | undefined
	onConfirmRename?: ((id: string, name: string, kind: "file" | "folder") => Promise<void>) | undefined
	onCancelRename?: (() => void) | undefined
}

function getFileIdsFromData(data: DataTransfer) {
	const json = data.getData("application/x-file-ids")
	if (!json) return []
	try {
		const parsed = JSON.parse(json) as unknown
		if (Array.isArray(parsed)) {
			return parsed.filter((item) => typeof item === "string")
		}
	} catch {
		return []
	}
	return []
}

const TreeMenuContent = function TreeMenuContent({
	node,
	onAction,
}: {
	node: FileCatalog | null
	onAction?: ((action: TreeAction, node: FileCatalog) => void) | undefined
}) {
	if (!node) return null

	return (
		<ContextMenuContent className="w-48">
			<ContextMenuItem onSelect={() => onAction?.("create", node)}>
				<FolderPlus className="mr-2 size-4" />
				新建子文件夹
			</ContextMenuItem>
			<ContextMenuSeparator />
			<ContextMenuItem onSelect={() => onAction?.("rename", node)}>
				<Pencil className="mr-2 size-4" />
				重命名
			</ContextMenuItem>
			<ContextMenuItem onSelect={() => onAction?.("move", node)}>
				<FolderInput className="mr-2 size-4" />
				移动文件夹
			</ContextMenuItem>
			<ContextMenuItem onSelect={() => onAction?.("download", node)}>
				<Download className="mr-2 size-4" />
				下载
			</ContextMenuItem>
			<ContextMenuItem onSelect={() => onAction?.("toggle-public", node)}>
				<Globe className="mr-2 size-4" />
				{node.public ? "取消公开" : "设为公开"}
			</ContextMenuItem>
			<ContextMenuItem onSelect={() => onAction?.("refresh", node)}>
				<RefreshCw className="mr-2 size-4" />
				刷新
			</ContextMenuItem>
			<ContextMenuSeparator />
			<ContextMenuItem
				className="text-destructive focus:text-destructive"
				onSelect={() => onAction?.("delete", node)}
			>
				<Trash2 className="mr-2 size-4" />
				删除
			</ContextMenuItem>
		</ContextMenuContent>
	)
}

const TreeNode = memo(function TreeNode({
	node,
	selectedId,
	onSelect,
	onDropFiles,
	onAction,
	disabledIds,
	pathIds,
	level,
	collapseVersion,
	locateTrigger,
	renamingId,
	onConfirmRename,
	onCancelRename,
}: {
	node: FileCatalog
	selectedId: string | null
	onSelect: (id: string | null) => void
	onDropFiles?: (targetCatalogId: string, fileIds: string[]) => void
	onAction?: (action: TreeAction, node: FileCatalog) => void
	disabledIds?: string[]
	pathIds?: Set<string> | undefined
	level: number
	collapseVersion: number | undefined
	locateTrigger?: number | undefined
	renamingId?: string | null | undefined
	onConfirmRename?: ((id: string, name: string, kind: "file" | "folder") => Promise<void>) | undefined
	onCancelRename?: (() => void) | undefined
}) {
	const [isExpanded, setIsExpanded] = useState(false)
	const [isDragOver, setIsDragOver] = useState(false)
	const hasChildren = Boolean(node.children && node.children.length > 0)
	const isSelected = selectedId === node.id
	const isDisabled = disabledIds?.includes(node.id)
	const isRenaming = renamingId === node.id

	useEffect(() => {
		if (pathIds?.has(node.id)) {
			setIsExpanded(true)
		}
	}, [pathIds, node.id])

	useEffect(() => {
		if (collapseVersion) {
			setIsExpanded(false)
		}
	}, [collapseVersion])

	useEffect(() => {
		if (locateTrigger && pathIds?.has(node.id)) {
			setIsExpanded(true)
		}
	}, [locateTrigger, pathIds, node.id])

	const handleToggle = useCallback(
		(event: MouseEvent<HTMLButtonElement | HTMLSpanElement>) => {
			event.stopPropagation()
			if (hasChildren) {
				setIsExpanded((prev) => !prev)
			}
		},
		[hasChildren],
	)

	const handleSelect = useCallback(() => {
		if (isDisabled) return
		onSelect(node.id)
	}, [isDisabled, node.id, onSelect])

	const handleDrop = useCallback(
		(event: DragEvent<HTMLButtonElement>) => {
			event.preventDefault()
			event.stopPropagation()
			setIsDragOver(false)
			if (isDisabled || !onDropFiles) return

			const fileIds = getFileIdsFromData(event.dataTransfer)
			if (fileIds.length > 0) {
				onDropFiles(node.id, fileIds)
			}
		},
		[isDisabled, node.id, onDropFiles],
	)

	const handleDragOver = useCallback(
		(event: DragEvent<HTMLButtonElement>) => {
			if (!onDropFiles || isDisabled) return
			event.preventDefault()
			setIsDragOver(true)
		},
		[isDisabled, onDropFiles],
	)

	const handleDragLeave = useCallback(() => {
		setIsDragOver(false)
	}, [])

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault()
				handleSelect()
			}
		},
		[handleSelect],
	)

	return (
		<div>
			<ContextMenu>
				<ContextMenuTrigger asChild>
					{isRenaming ? (
						<div
							className={cn(
								"group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors relative",
								isSelected ? "bg-primary/10 text-primary" : "text-foreground",
							)}
							style={{ paddingLeft: `${level * 12 + 8}px` }}
						>
							<span
								className={cn(
									"rounded p-0.5 text-muted-foreground transition",
									!hasChildren && "invisible",
								)}
							>
								{isExpanded ? (
									<ChevronDown className="size-3.5 opacity-70" />
								) : (
									<ChevronRight className="size-3.5 opacity-70" />
								)}
							</span>
							{isExpanded ? (
								<FolderOpen className="size-4 text-primary" />
							) : (
								<Folder className="size-4 text-primary" />
							)}
							<RenameInput
								defaultValue={node.name}
								className="flex-1 min-w-0"
								onSubmit={(val) => onConfirmRename?.(node.id, val, "folder") ?? Promise.resolve()}
								onCancel={() => onCancelRename?.()}
							/>
						</div>
					) : (
						<button
							type="button"
						className={cn(
							"group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
							isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50",
							isDragOver && "bg-accent",
							isDisabled && "cursor-not-allowed opacity-60",
						)}
						tabIndex={isDisabled ? -1 : 0}
						style={{ paddingLeft: `${level * 12 + 8}px` }}
						onClick={handleSelect}
						onKeyDown={handleKeyDown}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						data-catalog-id={node.id}
					>
						{/* biome-ignore lint/a11y/useKeyWithClickEvents: A11y handled by parent button keyboard events */}
						{/* biome-ignore lint/a11y/noStaticElementInteractions: UI requires custom span for layout inside button */}
						<span
							className={cn(
								"rounded p-0.5 text-muted-foreground transition hover:bg-accent",
								!hasChildren && "invisible",
							)}
							onClick={handleToggle}
						>
							{isExpanded ? (
								<ChevronDown className="size-3.5 opacity-70" />
							) : (
								<ChevronRight className="size-3.5 opacity-70" />
							)}
						</span>

						{isExpanded ? (
							<FolderOpen className="size-4 text-primary" />
						) : (
							<Folder className="size-4 text-primary" />
						)}
						<span className="flex-1 truncate text-left">{node.name}</span>

						{/* biome-ignore lint/a11y/useKeyWithClickEvents: A11y handled by parent button keyboard events */}
						{/* biome-ignore lint/a11y/noStaticElementInteractions: UI requires custom span for layout inside button */}
						<span
							className="rounded p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-accent"
							onClick={(e) => e.stopPropagation()}
						>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<MoreHorizontal className="size-3.5" />
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-48" align="start">
									<DropdownMenuItem onSelect={() => onAction?.("create", node)}>
										<FolderPlus className="mr-2 size-4" />
										新建子文件夹
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem onSelect={() => onAction?.("rename", node)}>
										<Pencil className="mr-2 size-4" />
										重命名
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => onAction?.("move", node)}>
										<FolderInput className="mr-2 size-4" />
										移动文件夹
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => onAction?.("download", node)}>
										<Download className="mr-2 size-4" />
										下载
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => onAction?.("toggle-public", node)}>
										<Globe className="mr-2 size-4" />
										{node.public ? "取消公开" : "设为公开"}
									</DropdownMenuItem>
									<DropdownMenuItem onSelect={() => onAction?.("refresh", node)}>
										<RefreshCw className="mr-2 size-4" />
										刷新
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onSelect={() => onAction?.("delete", node)}
									>
										<Trash2 className="mr-2 size-4" />
										删除
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</span>
					</button>
					)}
				</ContextMenuTrigger>
				<TreeMenuContent node={node} onAction={onAction} />
			</ContextMenu>

			<AnimatePresence initial={false}>
				{isExpanded && hasChildren && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="overflow-hidden"
					>
						{node.children?.map((child) => (
							<TreeNode
								key={child.id}
								node={child}
								selectedId={selectedId}
								onSelect={onSelect}
								{...(onDropFiles ? { onDropFiles } : {})}
								{...(onAction ? { onAction } : {})}
								{...(disabledIds ? { disabledIds } : {})}
								pathIds={pathIds}
								level={level + 1}
								collapseVersion={collapseVersion ?? undefined}
								locateTrigger={locateTrigger}
								renamingId={renamingId}
								onConfirmRename={onConfirmRename}
								onCancelRename={onCancelRename}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
})

export const FileManagerTree = memo(function FileManagerTree({
	nodes,
	selectedId,
	onSelect,
	onDropFiles,
	onAction,
	disabledIds,
	pathIds,
	level = 0,
	collapseVersion,
	locateTrigger,
	renamingId,
	onConfirmRename,
	onCancelRename,
}: FileManagerTreeProps) {
	return (
		<div className="py-1">
			<div className="min-h-5">
				{nodes.map((node) => (
					<TreeNode
						key={node.id}
						node={node}
						selectedId={selectedId}
						onSelect={onSelect}
						{...(onDropFiles ? { onDropFiles } : {})}
						{...(onAction ? { onAction } : {})}
						{...(disabledIds ? { disabledIds } : {})}
						pathIds={pathIds}
						level={level}
						collapseVersion={collapseVersion ?? undefined}
						locateTrigger={locateTrigger}
						renamingId={renamingId}
						onConfirmRename={onConfirmRename}
						onCancelRename={onCancelRename}
					/>
				))}
			</div>
		</div>
	)
})
