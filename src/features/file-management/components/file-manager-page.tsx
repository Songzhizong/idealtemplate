"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, Trash2 } from "lucide-react"
import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from "nuqs"
import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react"
import { useForm } from "react-hook-form"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { toast } from "sonner"
import type { z } from "zod"
import { useThemeStore } from "@/hooks/use-theme-store"
import {
	fetchBatchDeleteFile,
	fetchBatchHardDeleteFile,
	fetchBatchMoveFile,
	fetchBatchRecoveryFile,
	fetchChangeCatalogParent,
	fetchClearRecycleBin,
	fetchCreateCatalog,
	fetchDeleteCatalog,
	fetchDeleteFile,
	fetchGetFileCatalogTrees,
	fetchGetFileList,
	fetchGetRecycleBinFileList,
	fetchHardDeleteCatalog,
	fetchHardDeleteFile,
	fetchRecoveryCatalog,
	fetchRecoveryFile,
	fetchRenameCatalog,
	fetchRenameFile,
	fetchUpdateCatalogPublic,
	getDownloadUrl,
	getViewUrl,
} from "../api/fss"
import { FILE_MANAGER_BIZ_TYPE } from "../config"
import { useFileUploadManager } from "../hooks/use-file-upload-manager"
import type { FileCatalog, FileManagerItem } from "../types"

import { FileBrowser } from "./file-browser"
import { ConfirmDialog, FolderDialog, MoveDialog } from "./file-manager-dialogs"
import { FolderSchema, findCatalogNode, findCatalogPath } from "./file-manager-helpers"
import { FilePreviewDialog } from "./file-preview-dialog"
import { FileSidebar } from "./file-sidebar"
import { type BreadcrumbItem, FileToolbar } from "./file-toolbar"
import { FileUploadWidget } from "./file-upload-widget"

export function FileManagerPage() {
	const headerHeight = useThemeStore((state) => state.layout.headerHeight)
	const queryClient = useQueryClient()
	const bizType = FILE_MANAGER_BIZ_TYPE

	const [catalogId, setCatalogId] = useQueryState("cid", parseAsString)
	const [viewMode, setViewMode] = useQueryState("mode", parseAsString.withDefault("list"))
	const [scope, setScope] = useQueryState("scope", parseAsString.withDefault("active"))

	const isRecycleBin = scope === "recycle"
	const normalizedCatalogId = catalogId || null

	const [pageState, _setPageState] = useQueryStates(
		{
			size: parseAsInteger.withDefault(50),
		},
		{ history: "push", shallow: false },
	)

	const [debouncedSearchValue] = useQueryState("filename", parseAsString.withDefault(""))

	const {
		data: catalogTrees,
		isLoading: catalogLoading,
		refetch: refetchCatalogs,
	} = useQuery({
		queryKey: ["fss-catalog-trees", bizType],
		queryFn: () => fetchGetFileCatalogTrees(bizType),
	})

	const fileQuery = useInfiniteQuery({
		queryKey: [
			"fss-files",
			bizType,
			scope,
			normalizedCatalogId,
			debouncedSearchValue,
			pageState.size,
		],
		queryFn: ({ pageParam = 1 }) => {
			const params = {
				...(normalizedCatalogId ? { catalogId: normalizedCatalogId } : {}),
				...(debouncedSearchValue ? { filename: debouncedSearchValue } : {}),
			}
			if (isRecycleBin) {
				return fetchGetRecycleBinFileList(bizType, params, pageParam as number, pageState.size)
			}
			return fetchGetFileList(bizType, params, pageParam as number, pageState.size)
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (lastPage.pageNumber >= lastPage.totalPages) return undefined
			return lastPage.pageNumber + 1
		},
	})

	const treeNodes = isRecycleBin ? (catalogTrees?.recycled ?? []) : (catalogTrees?.active ?? [])

	const items = useMemo(() => {
		const folderNodes = (() => {
			if (!normalizedCatalogId) return treeNodes
			return findCatalogNode(treeNodes, normalizedCatalogId)?.children ?? []
		})()
		const folders: FileManagerItem[] = (folderNodes ?? []).map((node) => ({
			kind: "folder",
			id: node.id,
			name: node.name,
			parentId: node.parentId,
			deleted: node.deleted,
			deleteTime: node.deleteTime ?? null,
			raw: node,
		}))

		const fileRecords = fileQuery.data?.pages.flatMap((page) => page.content) ?? []
		const files: FileManagerItem[] = fileRecords.map((file) => ({
			kind: "file",
			id: file.id,
			name: file.fileName,
			contentType: file.contentType,
			objectSize: file.objectSize,
			createdTime: file.createdTime,
			deleted: file.deleted,
			deleteTime: file.deleteTime ?? null,
			raw: file,
		}))

		return [...folders, ...files]
	}, [normalizedCatalogId, treeNodes, fileQuery.data?.pages])

	const [selectedIds, setSelectedIds] = useState<string[]>([])
	const [previewItem, setPreviewItem] = useState<FileManagerItem | null>(null)
	const [moveDialogOpen, setMoveDialogOpen] = useState(false)
	const [moveTargets, setMoveTargets] = useState<Array<{ id: string; kind: "file" | "folder" }>>([])
	const [targetCatalogId, setTargetCatalogId] = useState<string | null>(null)
	const [dialogMode, setDialogMode] = useState<"create" | "rename" | null>(null)
	const [dialogTarget, setDialogTarget] = useState<FileManagerItem | FileCatalog | null>(null)
	const [confirmAction, setConfirmAction] = useState<{
		title: string
		description?: string
		icon?: React.ReactNode
		variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
		confirmText?: string
		onConfirm: () => Promise<void> | void
	} | null>(null)

	const [_isPending, startTransition] = useTransition()

	useEffect(() => {
		const itemIds = new Set(items.map((item) => item.id))
		startTransition(() => {
			setSelectedIds((prev) => prev.filter((id) => itemIds.has(id)))
		})
	}, [items])

	const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
		if (isRecycleBin) {
			return [{ id: null, name: "回收站" }]
		}
		const base: BreadcrumbItem[] = [{ id: null, name: "全部文件" }]
		if (!normalizedCatalogId) return base
		const path = findCatalogPath(treeNodes, normalizedCatalogId)
		if (!path) return base
		return [...base, ...path.map((node) => ({ id: node.id, name: node.name }))]
	}, [isRecycleBin, normalizedCatalogId, treeNodes])

	const pathIds = useMemo(() => {
		if (!normalizedCatalogId) return new Set<string>()
		const path = findCatalogPath(treeNodes, normalizedCatalogId)
		return new Set(path?.map((node) => node.id) ?? [])
	}, [normalizedCatalogId, treeNodes])

	const selectedItems = useMemo(() => {
		const map = new Map(items.map((item) => [item.id, item]))
		return selectedIds
			.map((id) => map.get(id))
			.filter((item): item is FileManagerItem => Boolean(item))
	}, [items, selectedIds])

	useEffect(() => {
		setSelectedIds([])
	}, [])

	const { startUploads, pauseUpload, cancelUpload, resumeUpload } = useFileUploadManager({
		bizType,
		catalogId: normalizedCatalogId,
		onCompleted: () => {
			void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
		},
	})

	const uploadFileInputRef = useRef<HTMLInputElement | null>(null)
	const uploadFolderInputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (uploadFolderInputRef.current) {
			uploadFolderInputRef.current.setAttribute("webkitdirectory", "true")
		}
	}, [])

	const handleUploadFiles = useCallback(
		(files: File[]) => {
			if (isRecycleBin || files.length === 0) return
			startUploads(files, normalizedCatalogId)
		},
		[isRecycleBin, normalizedCatalogId, startUploads],
	)

	const handleOpenItem = useCallback(
		(item: FileManagerItem) => {
			if (item.kind === "folder") {
				void setCatalogId(item.id)
				return
			}
			setPreviewItem(item)
		},
		[setCatalogId],
	)

	const handleDownloadItem = useCallback((item: FileManagerItem) => {
		if (item.kind !== "file") return
		const link = document.createElement("a")
		link.href = getDownloadUrl(bizType, item.id)
		link.download = item.name
		link.click()
	}, [])

	const handleCopyLink = useCallback(async (item: FileManagerItem) => {
		if (item.kind !== "file") return
		if (!navigator.clipboard) {
			toast.error("当前环境不支持复制链接")
			return
		}
		await navigator.clipboard.writeText(getViewUrl(bizType, item.id))
		toast.success("链接已复制")
	}, [])

	const handleDeleteItem = useCallback(
		(item: FileManagerItem) => {
			setConfirmAction({
				title: `确认删除${item.kind === "folder" ? "文件夹" : "文件"}?`,
				description:
					item.kind === "folder" ? "该操作会将文件夹移入回收站。" : "该操作会将文件移入回收站。",
				icon: <Trash2 className="size-6 text-red-600" />,
				variant: "destructive",
				confirmText: "删除",
				onConfirm: async () => {
					if (item.kind === "folder") {
						await fetchDeleteCatalog(bizType, item.id)
						void refetchCatalogs()
					} else {
						await fetchDeleteFile(bizType, item.id)
					}
					void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
					toast.success("已删除")
				},
			})
		},
		[queryClient, refetchCatalogs],
	)

	const handleRecoverItem = useCallback(
		(item: FileManagerItem) => {
			setConfirmAction({
				title: "确认恢复?",
				description: "将文件从回收站恢复到原目录。",
				onConfirm: async () => {
					if (item.kind === "folder") {
						await fetchRecoveryCatalog(bizType, item.id)
						void refetchCatalogs()
					} else {
						await fetchRecoveryFile(bizType, item.id)
					}
					void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
					toast.success("已恢复")
				},
			})
		},
		[queryClient, refetchCatalogs],
	)

	const handleHardDeleteItem = useCallback(
		(item: FileManagerItem) => {
			setConfirmAction({
				title: "确认彻底删除?",
				description: "此操作无法撤销。",
				icon: <Trash2 className="size-6 text-red-600" />,
				variant: "destructive",
				confirmText: "删除",
				onConfirm: async () => {
					if (item.kind === "folder") {
						await fetchHardDeleteCatalog(bizType, item.id)
						void refetchCatalogs()
					} else {
						await fetchHardDeleteFile(bizType, item.id)
					}
					void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
					toast.success("已删除")
				},
			})
		},
		[queryClient, refetchCatalogs],
	)

	const handleBatchDelete = useCallback(() => {
		if (selectedItems.length === 0) return
		setConfirmAction({
			title: "确认批量删除?",
			description: "选中文件将进入回收站。",
			icon: <Trash2 className="size-6 text-red-600" />,
			variant: "destructive",
			confirmText: "删除",
			onConfirm: async () => {
				const files = selectedItems.filter((item) => item.kind === "file").map((item) => item.id)
				const folders = selectedItems
					.filter((item) => item.kind === "folder")
					.map((item) => item.id)
				if (files.length > 0) {
					await fetchBatchDeleteFile(bizType, files)
				}
				for (const id of folders) {
					await fetchDeleteCatalog(bizType, id)
				}
				void refetchCatalogs()
				void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
				setSelectedIds([])
				toast.success("已删除")
			},
		})
	}, [selectedItems, queryClient, refetchCatalogs])

	const handleBatchRecover = useCallback(() => {
		if (selectedItems.length === 0) return
		setConfirmAction({
			title: "确认恢复?",
			description: "选中项将被恢复。",
			onConfirm: async () => {
				const files = selectedItems.filter((item) => item.kind === "file").map((item) => item.id)
				const folders = selectedItems
					.filter((item) => item.kind === "folder")
					.map((item) => item.id)
				if (files.length > 0) {
					await fetchBatchRecoveryFile(bizType, files)
				}
				for (const id of folders) {
					await fetchRecoveryCatalog(bizType, id)
				}
				void refetchCatalogs()
				void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
				setSelectedIds([])
				toast.success("已恢复")
			},
		})
	}, [selectedItems, queryClient, refetchCatalogs])

	const handleBatchHardDelete = useCallback(() => {
		if (selectedItems.length === 0) return
		setConfirmAction({
			title: "确认彻底删除?",
			description: "此操作无法撤销。",
			icon: <Trash2 className="size-6 text-red-600" />,
			variant: "destructive",
			confirmText: "删除",
			onConfirm: async () => {
				const files = selectedItems.filter((item) => item.kind === "file").map((item) => item.id)
				const folders = selectedItems
					.filter((item) => item.kind === "folder")
					.map((item) => item.id)
				if (files.length > 0) {
					await fetchBatchHardDeleteFile(bizType, files)
				}
				for (const id of folders) {
					await fetchHardDeleteCatalog(bizType, id)
				}
				void refetchCatalogs()
				void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
				setSelectedIds([])
				toast.success("已删除")
			},
		})
	}, [selectedItems, queryClient, refetchCatalogs])

	const handleClearRecycle = useCallback(() => {
		setConfirmAction({
			title: "确认清空回收站?",
			description: "此操作无法撤销。",
			icon: <Trash2 className="size-6 text-red-600" />,
			variant: "destructive",
			confirmText: "清空",
			onConfirm: async () => {
				await fetchClearRecycleBin(bizType)
				void refetchCatalogs()
				void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
				setSelectedIds([])
				toast.success("回收站已清空")
			},
		})
	}, [queryClient, refetchCatalogs])

	const folderForm = useForm<z.infer<typeof FolderSchema>>({
		resolver: zodResolver(FolderSchema),
		defaultValues: { name: "" },
	})

	const handleSubmitFolder = useCallback(
		async (values: z.infer<typeof FolderSchema>) => {
			if (dialogMode === "create") {
				const parentId =
					dialogTarget && !("kind" in dialogTarget)
						? dialogTarget.id
						: (normalizedCatalogId ?? null)
				const created = await fetchCreateCatalog(bizType, {
					parentId,
					name: values.name,
				})
				queryClient.setQueryData(
					["fss-catalog-trees", bizType],
					(
						prev:
							| { all: FileCatalog[]; active: FileCatalog[]; recycled: FileCatalog[] }
							| undefined,
					) => {
						if (!prev) return prev
						const insertNode = (nodes: FileCatalog[]): FileCatalog[] => {
							if (!parentId) return [...nodes, created]
							return nodes.map((node) => {
								if (node.id === parentId) {
									const nextChildren = [...(node.children ?? []), created]
									return { ...node, children: nextChildren }
								}
								if (node.children && node.children.length > 0) {
									return { ...node, children: insertNode(node.children) }
								}
								return node
							})
						}
						return {
							...prev,
							all: insertNode(prev.all),
							active: insertNode(prev.active),
						}
					},
				)
				toast.success("文件夹已创建")
			}
			if (dialogMode === "rename" && dialogTarget) {
				if ("kind" in dialogTarget) {
					if (dialogTarget.kind === "folder") {
						await fetchRenameCatalog(bizType, dialogTarget.id, values.name)
					} else {
						await fetchRenameFile(bizType, dialogTarget.id, values.name)
					}
				} else {
					await fetchRenameCatalog(bizType, dialogTarget.id, values.name)
				}
				toast.success("已重命名")
			}
			void refetchCatalogs()
			void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
			setDialogMode(null)
			setDialogTarget(null)
			folderForm.reset()
		},
		[dialogMode, dialogTarget, folderForm, normalizedCatalogId, queryClient, refetchCatalogs],
	)

	const handleOpenFolderDialog = useCallback(
		(mode: "create" | "rename", target?: FileManagerItem | FileCatalog) => {
			setDialogMode(mode)
			setDialogTarget(target ?? null)
			folderForm.reset({
				name:
					mode === "rename"
						? target && "kind" in target
							? target.name
							: (target?.name ?? "")
						: "",
			})
		},
		[folderForm],
	)

	const handleMoveTargets = useCallback(
		(targets: Array<{ id: string; kind: "file" | "folder" }>) => {
			if (targets.length === 0) return
			setMoveTargets(targets)
			setTargetCatalogId(null)
			setMoveDialogOpen(true)
		},
		[],
	)

	const handleConfirmMove = useCallback(async () => {
		if (!targetCatalogId || moveTargets.length === 0) return
		const fileIds = moveTargets.filter((item) => item.kind === "file").map((item) => item.id)
		const folderIds = moveTargets.filter((item) => item.kind === "folder").map((item) => item.id)
		if (fileIds.length > 0) {
			await fetchBatchMoveFile(bizType, targetCatalogId, fileIds)
		}
		for (const id of folderIds) {
			await fetchChangeCatalogParent(bizType, id, targetCatalogId)
		}
		void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
		void refetchCatalogs()
		setMoveDialogOpen(false)
		setMoveTargets([])
		setTargetCatalogId(null)
		toast.success("已移动")
	}, [moveTargets, queryClient, targetCatalogId, refetchCatalogs])

	const handleSelectCatalog = useCallback(
		(id: string | null) => {
			void setCatalogId(id)
		},
		[setCatalogId],
	)

	const handleToggleRecycle = useCallback(
		(value: boolean) => {
			void setScope(value ? "recycle" : "active")
			void setCatalogId(null)
		},
		[setCatalogId, setScope],
	)

	const handleBatchMoveToCatalog = useCallback(
		async (targetId: string, ids: string[]) => {
			// Filter out items that are already in the target catalog to avoid redundant calls
			// Though for folders, we need to check parentId matches targetId
			const itemsToMove = items.filter((item) => ids.includes(item.id))
			const fileIds = itemsToMove.filter((item) => item.kind === "file").map((item) => item.id)
			const folderIds = itemsToMove
				.filter((item) => item.kind === "folder" && item.id !== targetId)
				.map((item) => item.id)

			if (fileIds.length === 0 && folderIds.length === 0) return

			try {
				if (fileIds.length > 0) {
					await fetchBatchMoveFile(bizType, targetId, fileIds)
				}
				for (const id of folderIds) {
					await fetchChangeCatalogParent(bizType, id, targetId)
				}
				void refetchCatalogs()
				void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
				toast.success("已移动")
			} catch (_error) {
				toast.error("移动失败")
			}
		},
		[items, queryClient, refetchCatalogs],
	)

	const handleTreeAction = useCallback(
		(
			action: "create" | "rename" | "move" | "download" | "toggle-public" | "delete" | "refresh",
			node: FileCatalog,
		) => {
			if (action === "create") handleOpenFolderDialog("create", node)
			if (action === "rename") handleOpenFolderDialog("rename", node)
			if (action === "move") {
				handleMoveTargets([{ id: node.id, kind: "folder" }])
			}
			if (action === "download") {
				toast.info("暂不支持下载文件夹")
			}
			if (action === "toggle-public") {
				void (async () => {
					const nextPublic = !node.public
					await fetchUpdateCatalogPublic(bizType, node.id, nextPublic)
					queryClient.setQueryData(
						["fss-catalog-trees", bizType],
						(
							prev:
								| { all: FileCatalog[]; active: FileCatalog[]; recycled: FileCatalog[] }
								| undefined,
						) => {
							if (!prev) return prev
							const updateNodes = (nodes: FileCatalog[]): FileCatalog[] =>
								nodes.map((entry) => {
									if (entry.id === node.id) return { ...entry, public: nextPublic }
									if (entry.children && entry.children.length > 0) {
										return { ...entry, children: updateNodes(entry.children) }
									}
									return entry
								})
							return {
								...prev,
								all: updateNodes(prev.all),
								active: updateNodes(prev.active),
								recycled: updateNodes(prev.recycled),
							}
						},
					)
					toast.success(nextPublic ? "已设为公开" : "已取消公开")
				})()
			}
			if (action === "delete") {
				handleDeleteItem({
					kind: "folder",
					id: node.id,
					name: node.name,
					parentId: node.parentId,
					deleted: node.deleted,
					deleteTime: node.deleteTime ?? null,
					raw: node,
				})
			}
			if (action === "refresh") void refetchCatalogs()
		},
		[handleDeleteItem, handleMoveTargets, handleOpenFolderDialog, queryClient, refetchCatalogs],
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

	const handleUploadFilesClick = useCallback(() => {
		uploadFileInputRef.current?.click()
	}, [])

	const handleUploadFolderClick = useCallback(() => {
		uploadFolderInputRef.current?.click()
	}, [])

	const handleCreateFolder = useCallback(() => {
		handleOpenFolderDialog("create")
	}, [handleOpenFolderDialog])

	const handleDownloadSelected = useCallback(() => {
		selectedItems.forEach(handleDownloadItem)
	}, [handleDownloadItem, selectedItems])

	const handleMoveSelected = useCallback(() => {
		handleMoveTargets(
			selectedItems
				.filter((item) => item.kind === "file")
				.map((item) => ({ id: item.id, kind: item.kind })),
		)
	}, [handleMoveTargets, selectedItems])

	const handleBreadcrumbClick = useCallback(
		(id: string | null) => {
			void setCatalogId(id)
		},
		[setCatalogId],
	)

	const handleRenameItem = useCallback(
		(item: FileManagerItem) => {
			handleOpenFolderDialog("rename", item)
		},
		[handleOpenFolderDialog],
	)

	const handleMoveItem = useCallback(
		(item: FileManagerItem) => {
			handleMoveTargets([{ id: item.id, kind: item.kind }])
		},
		[handleMoveTargets],
	)

	const handleRefreshFiles = useCallback(() => {
		void fileQuery.refetch()
	}, [fileQuery])

	const handleTriggerUpload = useCallback(() => {
		uploadFileInputRef.current?.click()
	}, [])

	const handleLoadMore = useCallback(() => {
		void fileQuery.fetchNextPage()
	}, [fileQuery])

	const handlePreviewUrl = useCallback((id: string) => getViewUrl(bizType, id), [])

	const handleFileInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files ?? [])
			handleUploadFiles(files)
			event.target.value = ""
		},
		[handleUploadFiles],
	)

	const handleFolderInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files ?? [])
			handleUploadFiles(files)
			event.target.value = ""
		},
		[handleUploadFiles],
	)

	const handlePreviewOpenChange = useCallback((open: boolean) => {
		if (!open) setPreviewItem(null)
	}, [])

	const handleCancelUpload = useCallback(
		(id: string, uploadId?: string) => {
			void cancelUpload(id, uploadId)
		},
		[cancelUpload],
	)

	const handleResumeUpload = useCallback(
		(id: string, file: File, uploadId?: string, targetId?: string | null) => {
			if (!uploadId) return
			void resumeUpload(id, file, uploadId, targetId)
		},
		[resumeUpload],
	)

	const folderCount = items.filter((item) => item.kind === "folder").length
	const totalFileCount = fileQuery.data?.pages[0]?.totalElements ?? 0
	const fileSummary = folderCount + totalFileCount

	const moveDisabledIds = useMemo(() => {
		const folderTargets = moveTargets
			.filter((item) => item.kind === "folder")
			.map((item) => item.id)
		if (folderTargets.length === 0) {
			return normalizedCatalogId ? [normalizedCatalogId] : []
		}
		const disabled = new Set<string>()
		const collectDescendants = (node: FileCatalog) => {
			disabled.add(node.id)
			for (const child of node.children ?? []) {
				collectDescendants(child)
			}
		}
		for (const id of folderTargets) {
			const targetNode = findCatalogNode(treeNodes, id)
			if (targetNode) collectDescendants(targetNode)
		}
		return Array.from(disabled)
	}, [moveTargets, normalizedCatalogId, treeNodes])

	return (
		<div className="bg-muted/20 p-4" style={{ minHeight: `calc(100vh - ${headerHeight}px)` }}>
			<div
				className="h-full overflow-hidden rounded-xl border border-border/30 bg-card shadow-sm"
				style={{ height: `calc(100vh - ${headerHeight}px - 32px)` }}
			>
				<PanelGroup direction="horizontal">
					<Panel defaultSize={24} minSize={18} maxSize={32}>
						<FileSidebar
							nodes={treeNodes}
							selectedId={normalizedCatalogId}
							pathIds={pathIds}
							isRecycleBin={isRecycleBin}
							onSelectCatalog={handleSelectCatalog}
							onToggleRecycle={handleToggleRecycle}
							{...(!isRecycleBin
								? {
										onDropFilesToCatalog: handleBatchMoveToCatalog,
									}
								: {})}
							onTreeAction={handleTreeAction}
							loading={catalogLoading}
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
								onCreateFolder={handleCreateFolder}
								onDownloadSelected={handleDownloadSelected}
								onMoveSelected={handleMoveSelected}
								onDeleteSelected={handleBatchDelete}
								onRecoverSelected={handleBatchRecover}
								onHardDeleteSelected={handleBatchHardDelete}
								onClearRecycle={handleClearRecycle}
								onBreadcrumbClick={handleBreadcrumbClick}
							/>

							{isRecycleBin && (
								<div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-border/30 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
									<AlertTriangle className="size-4 text-primary" />
									回收站中的文件将在 30 天后自动清除
								</div>
							)}

							<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
								<FileBrowser
									items={items}
									viewMode={viewMode === "grid" ? "grid" : "list"}
									selectedIds={selectedIds}
									onSelectionChange={setSelectedIds}
									onOpenItem={handleOpenItem}
									onRenameItem={handleRenameItem}
									onMoveItem={handleMoveItem}
									onMoveItemToCatalog={handleBatchMoveToCatalog}
									onDeleteItem={handleDeleteItem}
									onRecoverItem={handleRecoverItem}
									onHardDeleteItem={handleHardDeleteItem}
									onCopyLink={handleCopyLink}
									onDownloadItem={handleDownloadItem}
									onCreateFolder={handleCreateFolder}
									onRefresh={handleRefreshFiles}
									onUploadFiles={handleUploadFiles}
									onTriggerUpload={handleTriggerUpload}
									isRecycleBin={isRecycleBin}
									loading={fileQuery.isLoading}
									isFetchingNextPage={fileQuery.isFetchingNextPage}
									hasNextPage={fileQuery.hasNextPage}
									onLoadMore={handleLoadMore}
									getPreviewUrl={handlePreviewUrl}
								/>
							</div>

							<div className="flex items-center justify-between border-t border-border/30 px-4 py-2 text-sm text-muted-foreground">
								<span>
									{fileSummary} 个项目 · 已选 {selectedIds.length} 项
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
				ref={uploadFolderInputRef}
				type="file"
				className="hidden"
				multiple
				onChange={handleFolderInputChange}
			/>

			<FilePreviewDialog
				item={previewItem}
				open={Boolean(previewItem)}
				onOpenChange={handlePreviewOpenChange}
				getPreviewUrl={handlePreviewUrl}
				onDownload={handleDownloadItem}
			/>

			<FileUploadWidget
				onPause={pauseUpload}
				onCancel={handleCancelUpload}
				onResume={handleResumeUpload}
			/>

			<FolderDialog
				open={dialogMode !== null}
				mode={dialogMode}
				form={folderForm}
				onSubmit={handleSubmitFolder}
				onOpenChange={(open) => {
					if (!open) {
						setDialogMode(null)
						setDialogTarget(null)
					}
				}}
			/>

			<MoveDialog
				open={moveDialogOpen}
				onOpenChange={(open) => {
					setMoveDialogOpen(open)
					if (!open) {
						setMoveTargets([])
						setTargetCatalogId(null)
					}
				}}
				nodes={catalogTrees?.active ?? []}
				selectedId={targetCatalogId}
				onSelect={setTargetCatalogId}
				disabledIds={moveDisabledIds}
				onConfirm={handleConfirmMove}
			/>

			<ConfirmDialog
				action={confirmAction}
				onOpenChange={(open) => {
					if (!open) setConfirmAction(null)
				}}
			/>
		</div>
	)
}
