import { flexRender, type Table as ReactTable, type Row } from "@tanstack/react-table"
import { AnimatePresence, motion } from "motion/react"
import React, { type DragEvent, type MouseEvent, memo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { FileManagerItem } from "../types"

interface FileBrowserTableProps {
	table: ReactTable<FileManagerItem>
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
	observerRef?: React.RefObject<HTMLDivElement | null>
	isFetchingNextPage?: boolean | undefined
}

const TableRowItem = memo(function TableRowItem({
	row,
	item,
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
}: {
	row: Row<FileManagerItem>
	item: FileManagerItem
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
}) {
	return (
		<motion.tr
			layout
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
			data-selection-id={item.id}
			className={cn(
				"group transition-colors relative border-b hover:bg-muted/50 data-[state=selected]:bg-muted",
				isSelected ? "bg-primary/15" : "",
				isDragOver && "bg-primary/20",
			)}
			onClick={(event: MouseEvent) => onSelectItem(row.index, item.id, event)}
			onDoubleClick={() => onOpenItem(item)}
			onContextMenu={() => {
				onItemContextMenu(item)
			}}
			draggable={!isRecycleBin}
			onDragStart={(event: any) => onDragStart(event, item)}
			onDragOver={(event: any) => onDragOverItem(event, item)}
			onDragLeave={onDragLeaveItem}
			onDrop={(event: any) => onDropOnItem(event, item)}
		>
			{row.getVisibleCells().map((cell, idx) => {
				const meta = cell.column.columnDef.meta as { className?: string } | undefined
				return (
					<TableCell
						key={cell.id}
						className={cn("py-2.5", meta?.className, idx === 0 && "relative")}
					>
						{idx === 0 && isSelected && (
							<div className="absolute inset-y-0 left-0 w-1 bg-primary" />
						)}
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</TableCell>
				)
			})}
		</motion.tr>
	)
})

export const FileBrowserTable = memo(function FileBrowserTable({
	table,
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
	observerRef,
	isFetchingNextPage,
}: FileBrowserTableProps) {
	if (items.length === 0) {
		return (
			<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
				暂无文件
			</div>
		)
	}

	return (
		<div className="flex flex-1 flex-col overflow-hidden">
			{/* Separate Header Table */}
			<div className="border-b border-border bg-muted/50 px-4">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
								{headerGroup.headers.map((header) => {
									const meta = header.column.columnDef.meta as { className?: string } | undefined
									return (
										<TableHead
											key={header.id}
											className={cn(
												"h-10 text-xs font-medium text-muted-foreground",
												meta?.className,
											)}
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
				</Table>
			</div>
			{/* Scrollable Body Table */}
			<div className="flex-1 overflow-auto p-4 pt-0">
				<Table>
					<TableBody>
						<AnimatePresence initial={false} mode="popLayout">
							{table.getRowModel().rows.map((row) => (
								<TableRowItem
									key={row.id}
									row={row}
									item={row.original}
									isSelected={selectedSet.has(row.original.id)}
									isRecycleBin={isRecycleBin}
									onSelectItem={onSelectItem}
									onOpenItem={onOpenItem}
									onItemContextMenu={onItemContextMenu}
									onDragStart={onDragStart}
									onDragOverItem={onDragOverItem}
									onDragLeaveItem={onDragLeaveItem}
									onDropOnItem={onDropOnItem}
									isDragOver={dragOverId === row.original.id}
								/>
							))}
						</AnimatePresence>
					</TableBody>
				</Table>
				<div ref={observerRef} className="h-4 w-full">
					{isFetchingNextPage && (
						<div className="flex h-10 items-center justify-center p-4">
							<Skeleton className="h-4 w-32" />
						</div>
					)}
				</div>
			</div>
		</div>
	)
})
