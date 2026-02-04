"use client"

import { Files, FoldVertical, FolderTree, HardDrive, LocateFixed, Trash2 } from "lucide-react"
import { memo, useCallback, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { FileCatalog } from "../types"
import { FileManagerTree, type TreeAction } from "./file-manager-tree"

interface StorageInfo {
	used: number
	total: number
}

interface FileSidebarProps {
	nodes: FileCatalog[]
	selectedId: string | null
	isRecycleBin: boolean
	onSelectCatalog: (id: string | null) => void
	onToggleRecycle: (value: boolean) => void
	onDropFilesToCatalog?: (catalogId: string, fileIds: string[]) => void
	onTreeAction?: (action: TreeAction, node: FileCatalog) => void
	storageInfo?: StorageInfo
	loading?: boolean
	pathIds?: Set<string>
	onLocate?: () => void
	locateTrigger?: number
	allowLocate?: boolean
	renamingId?: string | null
	onConfirmRename?: (id: string, name: string, kind: "file" | "folder") => Promise<void>
	onCancelRename?: () => void
}

export const FileSidebar = memo(function FileSidebar({
	nodes,
	selectedId,
	isRecycleBin,
	onSelectCatalog,
	onToggleRecycle,
	onDropFilesToCatalog,
	onTreeAction,
	storageInfo,
	loading,
	pathIds,
	onLocate,
	locateTrigger,
	allowLocate = false,
	renamingId,
	onConfirmRename,
	onCancelRename,
}: FileSidebarProps) {
	const [collapseVersion, setCollapseVersion] = useState(0)
	const usagePercent = storageInfo ? (storageInfo.used / storageInfo.total) * 100 : 0

	const handleCollapseAll = useCallback(() => {
		setCollapseVersion((prev) => prev + 1)
	}, [])

	const handleLocateClick = useCallback(() => {
		onLocate?.()
	}, [onLocate])

	return (
		<div className="flex h-full flex-col bg-card">
			<div className="space-y-1 p-3">
				<button
					type="button"
					onClick={() => {
						onToggleRecycle(false)
						onSelectCatalog(null)
					}}
					className={cn(
						"flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
						!isRecycleBin && !selectedId ? "bg-primary/10 text-primary" : "text-foreground",
					)}
				>
					<Files className="size-4" />
					全部文件
				</button>

				<button
					type="button"
					onClick={() => onToggleRecycle(true)}
					className={cn(
						"flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
						isRecycleBin ? "bg-primary/10 text-primary" : "text-foreground",
					)}
				>
					<Trash2 className="size-4" />
					回收站
				</button>
			</div>

			<Separator className="mx-3" />

			<div className="flex-1 overflow-y-auto px-2">
				<div className="py-2">
					<div className="flex items-center justify-between px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						<div className="flex items-center gap-2">
							<FolderTree className="size-3.5" />
							目录
						</div>
						<div className="flex items-center gap-1">
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon-xs"
										className="size-6 text-muted-foreground hover:text-foreground"
										onClick={handleCollapseAll}
									>
										<FoldVertical className="size-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>全部收起</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon-xs"
										className="size-6 text-muted-foreground hover:text-foreground"
										disabled={(!selectedId && !allowLocate) || isRecycleBin}
										onClick={handleLocateClick}
									>
										<LocateFixed className="size-3.5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>定位当前目录</TooltipContent>
							</Tooltip>
						</div>
					</div>
					{loading ? (
						<div className="px-2 py-4 text-sm text-muted-foreground">加载目录中...</div>
					) : (
						<FileManagerTree
							nodes={nodes}
							selectedId={selectedId}
							pathIds={pathIds}
							collapseVersion={collapseVersion}
							onSelect={onSelectCatalog}
							{...(onDropFilesToCatalog ? { onDropFiles: onDropFilesToCatalog } : {})}
							{...(onTreeAction ? { onAction: onTreeAction } : {})}
							locateTrigger={locateTrigger}
							renamingId={renamingId}
							onConfirmRename={onConfirmRename}
							onCancelRename={onCancelRename}
						/>
					)}
				</div>
			</div>

			<div className="border-t border-border/30 p-4">
				<div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
					<HardDrive className="size-4" />
					存储空间
				</div>
				<Progress value={usagePercent} className="h-1.5" />
				<p className="mt-1.5 text-xs text-muted-foreground">
					{storageInfo ? `已用 ${storageInfo.used} GB / ${storageInfo.total} GB` : "暂无配额数据"}
				</p>
			</div>
		</div>
	)
})
