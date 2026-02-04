"use client"

import { useQueryClient } from "@tanstack/react-query"
import { AlertTriangle } from "lucide-react"
import { useCallback, useEffect, useMemo, useState, useRef } from "react"
import { type ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { useDropzone } from "react-dropzone"

import { useThemeStore } from "@/hooks/use-theme-store"
import { FILE_MANAGER_BIZ_TYPE } from "../config"
// Hooks
import { useFileManagerActions } from "../hooks/use-file-manager-actions"
import { useFileManagerParams } from "../hooks/use-file-manager-params"
import { useFileManagerQuery } from "../hooks/use-file-manager-query"
import { useFileManagerSelection } from "../hooks/use-file-manager-selection"
import { useFileManagerUpload } from "../hooks/use-file-manager-upload"
import { useFileUploadManager } from "../hooks/use-file-upload-manager"
import { useUploadStore } from "../store/upload-store"
import { FileBrowserPane } from "./file-browser-pane"
import { ConfirmDialog, FolderDialog, MoveDialog } from "./file-manager-dialogs"
import { findCatalogPath } from "./file-manager-helpers"
import { FilePreviewDialog } from "./file-preview-dialog"
import { FileSidebar } from "./file-sidebar"
import { type BreadcrumbItem, FileToolbar } from "./file-toolbar"
import { FileUploadWidget } from "./file-upload-widget"

export function FileManagerPage() {
	const headerHeight = useThemeStore((state) => state.layout.headerHeight)
	const queryClient = useQueryClient()
	const bizType = FILE_MANAGER_BIZ_TYPE

	// 1. Params & State
	const {
		setCatalogId,
		viewMode,
		setViewMode,
		selectedCatalogId,
		setSelectedCatalogId,
		setScope,
		setScopeStore,
		isRecycleBin,
		deferredCatalogId,
		deferredScope,
		isDeferredRecycleBin,
		pageState,
		debouncedSearchValue,
	} = useFileManagerParams()

	// 2. Data Query
	const {
		catalogTrees,
		catalogLoading,
		refetchCatalogs,
		fileQuery,
		treeNodes,
		items,
		deferredItems,
	} = useFileManagerQuery({
		bizType,
		deferredScope,
		deferredCatalogId,
		debouncedSearchValue,
		pageSize: pageState.size,
		isDeferredRecycleBin,
		isRecycleBin,
	})

	// 3. Selection
	const {
		selectedIds,
		setSelectedIds,
		deferredSelectedIds,
		previewItem,
		setPreviewItem,
		selectedItems,
		startTransition,
	} = useFileManagerSelection(deferredItems)

	// 4. File Upload (Core)
	const {
		startUploads,
		pauseUpload,
		cancelUpload,
		resumeUpload,
		retryUpload,
		pauseAllUploads,
		resumeAllUploads,
		cancelAllUploads,
	} = useFileUploadManager({
		bizType,
		catalogId: selectedCatalogId,
		onCompleted: () => {
			void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
		},
	})
	const uploadTasks = useUploadStore((state) => state.uploadTasks)
	const [pendingLocate, setPendingLocate] = useState<{ fileId: string; catalogId: string | null } | null>(
		null,
	)
	const getCatalogPath = useCallback(
		(catalogId: string | null) => {
			if (!catalogId) return "/"
			const path = findCatalogPath(treeNodes, catalogId)
			if (!path || path.length === 0) return "/"
			return `/${path.map((node) => node.name).join("/")}/`
		},
		[treeNodes],
	)

	// 5. Upload UI Logic
	const {
		pendingUploadFiles,
		setPendingUploadFiles,
		uploadDialogOpen,
		setUploadDialogOpen,
		uploadTargetId,
		setUploadTargetId,
		uploadFileInputRef,
		handleUploadFiles,
		handleConfirmUpload,
		handleUploadFilesClick,
		handleUploadFolderClick,
		handleTriggerUpload,
		handleFileInputChange,
		handleFolderInputChange,
		setFolderInputRef,
	} = useFileManagerUpload({
		isRecycleBin,
		selectedCatalogId,
		getCatalogPath,
		startUploads,
	})

	// 6. Actions & Dialogs
	const actions = useFileManagerActions({
		bizType,
		selectedCatalogId,
		refetchCatalogs,
		selectedItems,
		setSelectedIds,
		setCatalogId,
		setSelectedCatalogId,
		startTransition,
		items,
		treeNodes,
		setPreviewItem,
	})

	// 7. Sidebar Control
	const sidebarRef = useRef<ImperativePanelHandle>(null)
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
	const [locateTrigger, setLocateTrigger] = useState(0)

	const handleToggleSidebar = useCallback(() => {
		const panel = sidebarRef.current
		if (!panel) return
		if (panel.isCollapsed()) {
			panel.expand()
		} else {
			panel.collapse()
		}
	}, [])

	const handleLocateCatalog = useCallback(() => {
		let targetCatalogId = selectedCatalogId

		// If no catalog selected but we have a single selected file (e.g. in search results)
		if (!targetCatalogId && selectedItems.length === 1 && selectedItems[0]?.kind === "file") {
			const item = selectedItems[0]
			// Use type guard or check property
			if (item && "raw" in item && "catalogId" in (item.raw as any)) {
				const cid = (item.raw as { catalogId: string }).catalogId
				if (cid) {
					targetCatalogId = cid
					// Important: Update the view to show this catalog
					setSelectedCatalogId(cid)
					// Exit search scope if needed (assuming "active" scope for normal viewing)
					setScopeStore("active")
					startTransition(() => {
						setCatalogId(cid)
						setScope("active")
					})
				}
			}
		}

		if (!targetCatalogId) return

		// Ensure sidebar is expanded
		if (sidebarRef.current?.isCollapsed()) {
			sidebarRef.current.expand()
		}

		// Trigger tree expansion via state
		setLocateTrigger((prev) => prev + 1)

		setTimeout(() => {
			const element = document.querySelector(`[data-catalog-id="${targetCatalogId}"]`)
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" })
				// Add a subtle flash effect
				element.classList.add("bg-primary/20", "transition-colors", "duration-500")
				setTimeout(() => element.classList.remove("bg-primary/20"), 1000)
			}
		}, 300)
	}, [selectedCatalogId, selectedItems, setCatalogId, setSelectedCatalogId, startTransition, setScopeStore, setScope])

	// 8. EventHandlers & Helpers
	const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
		if (isRecycleBin) {
			return [{ id: null, name: "回收站" }]
		}
		const base: BreadcrumbItem[] = [{ id: null, name: "全部文件" }]
		if (!selectedCatalogId) return base
		const path = findCatalogPath(treeNodes, selectedCatalogId)
		if (!path) return base
		return [...base, ...path.map((node) => ({ id: node.id, name: node.name }))]
	}, [isRecycleBin, selectedCatalogId, treeNodes])

	const pathIds = useMemo(() => {
		if (!selectedCatalogId) return new Set<string>()
		const path = findCatalogPath(treeNodes, selectedCatalogId)
		return new Set(path?.map((node) => node.id) ?? [])
	}, [selectedCatalogId, treeNodes])

	const handleSelectCatalog = useCallback(
		(id: string | null) => {
			setSelectedCatalogId(id)
			startTransition(() => {
				void setCatalogId(id)
			})
		},
		[setCatalogId, setSelectedCatalogId, startTransition],
	)

	const handleToggleRecycle = useCallback(
		(value: boolean) => {
			setSelectedCatalogId(null)
			setScopeStore(value ? "recycle" : "active")
			startTransition(() => {
				void setScope(value ? "recycle" : "active")
				void setCatalogId(null)
			})
		},
		[setCatalogId, setScope, setScopeStore, setSelectedCatalogId, startTransition],
	)

	const handleToolbarRefresh = useCallback(() => {
		void refetchCatalogs()
		void fileQuery.refetch()
	}, [fileQuery, refetchCatalogs])

	const handleViewModeChange = useCallback(
		(mode: "grid" | "list") => {
			void setViewMode(mode)
		},
		[setViewMode],
	)

	const handleBreadcrumbClick = useCallback(
		(id: string | null) => {
			void setCatalogId(id)
		},
		[setCatalogId],
	)

	const handleRefreshFiles = useCallback(() => {
		void fileQuery.refetch()
	}, [fileQuery])

	const handleLoadMore = useCallback(() => {
		void fileQuery.fetchNextPage()
	}, [fileQuery])

	const handlePreviewOpenChange = useCallback(
		(open: boolean) => {
			if (!open) setPreviewItem(null)
		},
		[setPreviewItem],
	)

	const handleCancelUpload = useCallback(
		(id: string, uploadId?: string) => {
			void cancelUpload(id, uploadId)
		},
		[cancelUpload],
	)

	const handleResumeUpload = useCallback(
		(id: string, file: File, uploadId?: string, targetId?: string | null) => {
			void resumeUpload(id, file, uploadId, targetId)
		},
		[resumeUpload],
	)

	const handleLocateUpload = useCallback(
		(task: { fileId?: string; catalogId: string | null }) => {
			if (!task.fileId) return
			setPendingLocate({ fileId: task.fileId, catalogId: task.catalogId })
			setSelectedCatalogId(task.catalogId)
			startTransition(() => {
				void setCatalogId(task.catalogId)
			})
		},
		[setCatalogId, setSelectedCatalogId, startTransition],
	)

	useEffect(() => {
		if (!pendingLocate) return
		const match = deferredItems.find((item) => item.kind === "file" && item.id === pendingLocate.fileId)
		if (match) {
			setSelectedIds([match.id])
			setPendingLocate(null)
		}
	}, [deferredItems, pendingLocate, setSelectedIds])

	useEffect(() => {
		const hasActiveUploads = uploadTasks.some(
			(task) => task.status === "uploading" || task.status === "pending",
		)
		if (!hasActiveUploads) return
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault()
			event.returnValue = ""
		}
		window.addEventListener("beforeunload", handleBeforeUnload)
		return () => window.removeEventListener("beforeunload", handleBeforeUnload)
	}, [uploadTasks])

	const { getRootProps, isDragActive } = useDropzone({
		onDrop: (acceptedFiles: File[]) => {
			if (acceptedFiles.length === 0) return
			handleUploadFiles(acceptedFiles)
		},
		noClick: true,
		disabled: isRecycleBin,
	})

	const folderCount = deferredItems.filter((item) => item.kind === "folder").length
	const totalFileCount = fileQuery.data?.pages[0]?.totalElements ?? 0
	const fileSummary = folderCount + totalFileCount

	return (
		<div
			{...getRootProps({ className: "bg-muted/20 p-4" })}
			style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}
		>
			{isDragActive && !isRecycleBin && (
				<div className="pointer-events-none fixed inset-0 z-40 border-2 border-dashed border-primary/40 bg-primary/5" />
			)}
			<div
				className="h-full overflow-hidden rounded-xl border border-border/30 bg-card shadow-sm"
				style={{ height: `calc(100vh - ${headerHeight}px - 32px)` }}
			>
				<PanelGroup direction="horizontal">
					<Panel
						ref={sidebarRef}
						defaultSize={24}
						minSize={18}
						maxSize={32}
						collapsible
						onCollapse={() => setIsSidebarCollapsed(true)}
						onExpand={() => setIsSidebarCollapsed(false)}
					>
						<FileSidebar
							nodes={treeNodes}
							selectedId={selectedCatalogId}
							pathIds={pathIds}
							isRecycleBin={isRecycleBin}
							onSelectCatalog={handleSelectCatalog}
							onToggleRecycle={handleToggleRecycle}
							{...(!isRecycleBin
								? {
										onDropFilesToCatalog: actions.handleBatchMoveToCatalog,
									}
								: {})}
							onTreeAction={actions.handleTreeAction}
							onLocate={handleLocateCatalog}
							loading={catalogLoading}
							locateTrigger={locateTrigger}
							allowLocate={Boolean(
								selectedCatalogId || (selectedItems.length === 1 && selectedItems[0]?.kind === "file"),
							)}
							renamingId={actions.renamingContext === "tree" ? actions.renamingId : null}
							onCancelRename={() => actions.setRenamingId(null)}
							onConfirmRename={actions.handleConfirmRename}
						/>
					</Panel>
					<PanelResizeHandle className="w-1 cursor-col-resize bg-transparent hover:bg-primary/10" />
					<Panel>
						<div className="flex h-full flex-col">
							<FileToolbar
								breadcrumbs={breadcrumbs}
								onRefresh={handleToolbarRefresh}
								isRecycleBin={isRecycleBin}
								viewMode={viewMode === "grid" ? "grid" : "list"}
								onViewModeChange={handleViewModeChange}
								selectedCount={selectedIds.length}
								onUploadFiles={handleUploadFilesClick}
								onUploadFolder={handleUploadFolderClick}
								onCreateFolder={actions.handleCreateFolder}
								onDownloadSelected={actions.handleDownloadSelected}
								onMoveSelected={actions.handleMoveSelected}
								onDeleteSelected={actions.handleBatchDelete}
								onRecoverSelected={actions.handleBatchRecover}
								onHardDeleteSelected={actions.handleBatchHardDelete}
								onClearRecycle={actions.handleClearRecycle}
								onBreadcrumbClick={handleBreadcrumbClick}
								sidebarVisible={!isSidebarCollapsed}
								onToggleSidebar={handleToggleSidebar}
							/>

							{isRecycleBin && (
								<div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-border/30 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
									<AlertTriangle className="size-4 text-primary" />
									回收站中的文件将在 30 天后自动清除
								</div>
							)}

							<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
								<FileBrowserPane
									items={deferredItems}
									viewMode={viewMode === "grid" ? "grid" : "list"}
									selectedIds={deferredSelectedIds}
									onSelectionChange={setSelectedIds}
									onOpenItem={actions.handleOpenItem}
									onRenameItem={actions.handleRenameItem}
									onMoveItem={actions.handleMoveItem}
									onMoveItemToCatalog={actions.handleBatchMoveToCatalog}
									onDeleteItem={actions.handleDeleteItem}
									onRecoverItem={actions.handleRecoverItem}
									onHardDeleteItem={actions.handleHardDeleteItem}
									onCopyLink={actions.handleCopyLink}
									onDownloadItem={actions.handleDownloadItem}
									onCreateFolder={actions.handleCreateFolder}
									onRefresh={handleRefreshFiles}
									onUploadFiles={handleUploadFiles}
									onTriggerUpload={handleTriggerUpload}
									isRecycleBin={isRecycleBin}
									loading={fileQuery.isLoading}
									isFetchingNextPage={fileQuery.isFetchingNextPage}
									hasNextPage={fileQuery.hasNextPage}
									onLoadMore={handleLoadMore}
									getPreviewUrl={actions.handlePreviewUrl}
									renamingId={actions.renamingContext === "list" ? actions.renamingId : null}
									onCancelRename={() => actions.setRenamingId(null)}
									onConfirmRename={actions.handleConfirmRename}
								/>
							</div>

							<div className="flex items-center justify-between border-t border-border/30 px-4 py-2 text-sm text-muted-foreground">
								<span>
									{fileSummary} 个项目 · 已选 {deferredSelectedIds.length} 项
								</span>
							</div>
						</div>
					</Panel>
				</PanelGroup>
			</div>

			<input
				ref={uploadFileInputRef}
				type="file"
				className="hidden"
				multiple
				onChange={handleFileInputChange}
			/>
			<input
				ref={setFolderInputRef}
				type="file"
				className="hidden"
				multiple
				onChange={handleFolderInputChange}
			/>

			<FilePreviewDialog
				item={previewItem}
				open={Boolean(previewItem)}
				onOpenChange={handlePreviewOpenChange}
				getPreviewUrl={actions.handlePreviewUrl}
				onDownload={actions.handleDownloadItem}
			/>

			<FileUploadWidget
				onPause={pauseUpload}
				onCancel={handleCancelUpload}
				onResume={handleResumeUpload}
				onRetry={retryUpload}
				onPauseAll={pauseAllUploads}
				onResumeAll={resumeAllUploads}
				onCancelAll={cancelAllUploads}
				onLocate={handleLocateUpload}
			/>

			<FolderDialog
				open={actions.dialogMode !== null}
				mode={actions.dialogMode}
				form={actions.folderForm}
				onSubmit={actions.handleSubmitFolder}
				onOpenChange={(open) => {
					if (!open) {
						actions.setDialogMode(null)
						actions.setDialogTarget(null)
					}
				}}
			/>

			<MoveDialog
				open={actions.moveDialogOpen}
				onOpenChange={(open) => {
					actions.setMoveDialogOpen(open)
					if (!open) {
						actions.setMoveTargets([])
						actions.setTargetCatalogId(null)
					}
				}}
				nodes={catalogTrees?.active ?? []}
				selectedId={actions.targetCatalogId}
				onSelect={actions.setTargetCatalogId}
				disabledIds={actions.moveDisabledIds}
				onConfirm={actions.handleConfirmMove}
			/>

			<MoveDialog
				open={uploadDialogOpen}
				onOpenChange={(open) => {
					setUploadDialogOpen(open)
					if (!open) {
						setPendingUploadFiles([])
						setUploadTargetId(null)
					}
				}}
				title="上传文件到"
				nodes={catalogTrees?.active ?? []}
				selectedId={uploadTargetId}
				onSelect={setUploadTargetId}
				disabledIds={[]}
				onConfirm={handleConfirmUpload}
			/>

			<ConfirmDialog
				action={actions.confirmAction}
				onOpenChange={(open) => {
					if (!open) actions.setConfirmAction(null)
				}}
			/>
		</div>
	)
}
