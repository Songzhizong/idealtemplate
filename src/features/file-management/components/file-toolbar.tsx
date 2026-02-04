import {
	ChevronRight,
	Download,
	FolderInput,
	FolderPlus,
	Grid3X3,
	List,
	PanelLeft,
	PanelLeftClose,
	RefreshCw,
	Trash2,
	Upload,
} from "lucide-react"
import { memo } from "react"
import { DataTableSearch } from "@/components/table/components/data-table-search"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
	id: string | null
	name: string
}

interface FileToolbarProps {
	breadcrumbs: BreadcrumbItem[]
	onRefresh: () => void
	isRecycleBin: boolean
	viewMode: "grid" | "list"
	onViewModeChange: (mode: "grid" | "list") => void
	selectedCount: number
	onUploadFiles: () => void
	onUploadFolder: () => void
	onCreateFolder: () => void
	onDownloadSelected: () => void
	onMoveSelected: () => void
	onDeleteSelected: () => void
	onRecoverSelected: () => void
	onHardDeleteSelected: () => void
	onClearRecycle: () => void
	onBreadcrumbClick: (id: string | null) => void
	sidebarVisible?: boolean
	onToggleSidebar?: () => void
}

export const FileToolbar = memo(function FileToolbar({
	breadcrumbs,
	onRefresh,
	isRecycleBin,
	viewMode,
	onViewModeChange,
	selectedCount,
	onUploadFiles,
	onUploadFolder,
	onCreateFolder,
	onDownloadSelected,
	onMoveSelected,
	onDeleteSelected,
	onRecoverSelected,
	onHardDeleteSelected,
	onClearRecycle,
	onBreadcrumbClick,
	sidebarVisible = true,
	onToggleSidebar,
}: FileToolbarProps) {
	return (
		<div className="flex h-14 items-center gap-4 border-b border-border/30 bg-card px-4">
			{onToggleSidebar && (
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground"
					onClick={onToggleSidebar}
				>
					{sidebarVisible ? (
						<PanelLeftClose className="size-4" />
					) : (
						<PanelLeft className="size-4" />
					)}
				</Button>
			)}
			<div className="flex min-w-0 flex-1 items-center gap-2">
				<nav className="flex items-center text-sm text-muted-foreground">
					{breadcrumbs.map((item, index) => (
						<div key={`${item.id ?? "root"}-${item.name}`} className="flex items-center">
							{index > 0 && <ChevronRight className="mx-1 size-4 text-muted-foreground/60" />}
							<button
								type="button"
								onClick={() => onBreadcrumbClick(item.id)}
								className={cn(
									"max-w-40 truncate transition-colors",
									index === breadcrumbs.length - 1
										? "font-medium text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{item.name}
							</button>
						</div>
					))}
				</nav>

				<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
					<RefreshCw className="size-4" />
				</Button>
			</div>

			<DataTableSearch
				queryKey="filename"
				placeholder="搜索文件..."
				className="w-64"
				autoResetPageIndex={false}
			/>

			<div className="flex items-center gap-2">
				{selectedCount > 0 && !isRecycleBin && (
					<>
						<span className="text-sm text-muted-foreground">已选择 {selectedCount} 项</span>
						<div className="flex items-center gap-1">
							<Button variant="outline" size="sm" className="h-8" onClick={onDownloadSelected}>
								<Download className="mr-1.5 size-4" />
								下载
							</Button>
							<Button variant="outline" size="sm" className="h-8" onClick={onMoveSelected}>
								<FolderInput className="mr-1.5 size-4" />
								移动
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="h-8 text-destructive hover:text-destructive"
								onClick={onDeleteSelected}
							>
								<Trash2 className="mr-1.5 size-4" />
								删除
							</Button>
						</div>
						<Separator orientation="vertical" className="mx-2 h-6" />
					</>
				)}

				{isRecycleBin && (
					<>
						<Button
							variant="outline"
							size="sm"
							className="h-8"
							onClick={onRecoverSelected}
							disabled={selectedCount === 0}
						>
							恢复
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-8 text-destructive hover:text-destructive"
							onClick={onHardDeleteSelected}
							disabled={selectedCount === 0}
						>
							彻底删除
						</Button>
						<Button variant="outline" size="sm" className="h-8" onClick={onClearRecycle}>
							清空回收站
						</Button>
						<Separator orientation="vertical" className="mx-2 h-6" />
					</>
				)}

				{!isRecycleBin && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="sm" className="h-8">
								<Upload className="mr-1.5 size-4" />
								上传
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onSelect={onUploadFiles}>
								<Upload className="mr-2 size-4" />
								上传文件
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={onUploadFolder}>
								<FolderPlus className="mr-2 size-4" />
								上传文件夹
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={onCreateFolder}>
								<FolderPlus className="mr-2 size-4" />
								新建文件夹
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}

				<div className="flex items-center rounded-md bg-muted/50 p-0.5">
					<Button
						variant={viewMode === "grid" ? "secondary" : "ghost"}
						size="icon"
						className="h-7 w-7"
						onClick={() => onViewModeChange("grid")}
					>
						<Grid3X3 className="size-4" />
					</Button>
					<Button
						variant={viewMode === "list" ? "secondary" : "ghost"}
						size="icon"
						className="h-7 w-7"
						onClick={() => onViewModeChange("list")}
					>
						<List className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	)
})
