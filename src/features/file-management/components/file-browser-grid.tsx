import { Folder } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { type DragEvent, type MouseEvent, memo } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { FileManagerItem } from "../types"
import { formatFileSize, getFileStyle, isImageType, parseObjectSize } from "../utils/file-utils"
import { RenameInput } from "./rename-input"

interface FileBrowserGridProps {
	items: FileManagerItem[]
	selectedSet: Set<string>
	isRecycleBin: boolean
	onSelectItem: (index: number, id: string, event: MouseEvent) => void
	onOpenItem: (item: FileManagerItem) => void
	onItemContextMenu: (item: FileManagerItem) => void
	onDragStart: (event: DragEvent, item: FileManagerItem) => void
	onDragOverItem: (event: DragEvent, item: FileManagerItem) => void
	onDragLeaveItem: () => void
	onDropOnItem: (event: DragEvent, item: FileManagerItem) => void
	dragOverId: string | null
	getPreviewUrl: (id: string) => string
	renamingId?: string | null
	onConfirmRename?: (id: string, name: string, kind: "file" | "folder") => Promise<void>
	onCancelRename?: () => void
}

const GridItem = memo(function GridItem({
	item,
	index,
	isSelected,
	isRecycleBin,
	onSelectItem,
	onOpenItem,
	onItemContextMenu,
	onDragStart,
	onDragOverItem,
	onDragLeaveItem,
	onDropOnItem,
	isDragOver,
	getPreviewUrl,
	renamingId,
	onConfirmRename,
	onCancelRename,
}: {
	item: FileManagerItem
	index: number
	isSelected: boolean
	isRecycleBin: boolean
	onSelectItem: (index: number, id: string, event: MouseEvent) => void
	onOpenItem: (item: FileManagerItem) => void
	onItemContextMenu: (item: FileManagerItem) => void
	onDragStart: (event: DragEvent, item: FileManagerItem) => void
	onDragOverItem: (event: DragEvent, item: FileManagerItem) => void
	onDragLeaveItem: () => void
	onDropOnItem: (event: DragEvent, item: FileManagerItem) => void
	isDragOver: boolean
	getPreviewUrl: (id: string) => string
	renamingId?: string | null
	onConfirmRename?: (id: string, name: string, kind: "file" | "folder") => Promise<void>
	onCancelRename?: () => void
}) {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
			data-selection-id={item.id}
			className={cn(
				"group relative rounded-lg border-2 border-transparent p-3 text-center transition",
				isSelected ? "bg-primary/15 border-primary/30 shadow-sm" : "hover:bg-muted/50",
				isDragOver && "bg-primary/20 border-primary border-dashed",
			)}
			onClick={(event: MouseEvent) => onSelectItem(index, item.id, event)}
			onDoubleClick={() => onOpenItem(item)}
			onContextMenu={(_event: MouseEvent) => {
				onItemContextMenu(item)
			}}
			draggable={!isRecycleBin}
			onDragStart={(event: any) => onDragStart(event, item)}
			onDragOver={(event: any) => onDragOverItem(event, item)}
			onDragLeave={onDragLeaveItem}
			onDrop={(event: any) => onDropOnItem(event, item)}
		>
			<div className="flex h-14 items-center justify-center">
				{item.kind === "folder" ? (
					<span className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<Folder className="size-7" />
					</span>
				) : (
					(() => {
						const size = parseObjectSize(item.objectSize)
						if (isImageType(item.contentType) && size > 0 && size < 500 * 1024) {
							return (
								<div className="relative flex size-14 items-center justify-center rounded-xl bg-muted/40">
									<img
										src={getPreviewUrl(item.id)}
										alt={item.name}
										className="h-full w-full rounded-xl object-cover"
									/>
								</div>
							)
						}
						const style = getFileStyle(item.name, item.contentType, "md")
						return (
							<span
								className={cn(
									"flex size-14 items-center justify-center rounded-xl",
									style.bgColor,
									style.iconColor,
								)}
							>
								{style.icon}
							</span>
						)
					})()
				)}
			</div>
			<div className="mt-2 flex flex-col items-center overflow-hidden w-full">
				{renamingId === item.id ? (
					<RenameInput
						defaultValue={item.name}
						className="w-full text-center"
						onSubmit={(val) => onConfirmRename?.(item.id, val, item.kind) ?? Promise.resolve()}
						onCancel={() => onCancelRename?.()}
					/>
				) : (
					<p className="w-full truncate text-sm font-medium">{item.name}</p>
				)}
				<p className="mt-1 text-xs text-muted-foreground">
					{item.kind === "folder" ? "文件夹" : formatFileSize(parseObjectSize(item.objectSize))}
				</p>
			</div>
		</motion.div>
	)
})

export const FileBrowserGrid = memo(function FileBrowserGrid({
	items,
	selectedSet,
	isRecycleBin,
	onSelectItem,
	onOpenItem,
	onItemContextMenu,
	onDragStart,
	onDragOverItem,
	onDragLeaveItem,
	onDropOnItem,
	dragOverId,
	getPreviewUrl,
	renamingId,
	onConfirmRename,
	onCancelRename,
}: FileBrowserGridProps) {
	if (items.length === 0) {
		return (
			<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
				暂无文件
			</div>
		)
	}

	return (
		<TooltipProvider>
			<div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				<AnimatePresence initial={false} mode="popLayout">
					{items.map((item, index) => (
						<GridItem
							key={item.id}
							item={item}
							index={index}
							isSelected={selectedSet.has(item.id)}
							isRecycleBin={isRecycleBin}
							onSelectItem={onSelectItem}
							onOpenItem={onOpenItem}
							onItemContextMenu={onItemContextMenu}
							onDragStart={onDragStart}
							onDragOverItem={onDragOverItem}
							onDragLeaveItem={onDragLeaveItem}
							onDropOnItem={onDropOnItem}
							isDragOver={dragOverId === item.id}
							getPreviewUrl={getPreviewUrl}
							renamingId={renamingId}
							onConfirmRename={onConfirmRename}
							onCancelRename={onCancelRename}
						/>
					))}
				</AnimatePresence>
			</div>
		</TooltipProvider>
	)
})
