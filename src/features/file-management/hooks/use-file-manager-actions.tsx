"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import type React from "react"
import { useCallback, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import {
	fetchBatchDeleteFile,
	fetchBatchHardDeleteFile,
	fetchBatchMoveFile,
	fetchBatchRecoveryFile,
	fetchChangeCatalogParent,
	fetchCheckCatalogHasChildren,
	fetchClearRecycleBin,
	fetchCreateCatalog,
	fetchDeleteCatalog,
	fetchDeleteFile,
	fetchForceDeleteCatalog,
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
import { FolderSchema, findCatalogNode } from "../components/file-manager-helpers"
import type { FileCatalog, FileManagerItem } from "../types"

interface UseFileManagerActionsProps {
	bizType: string
	selectedCatalogId: string | null
	refetchCatalogs: () => void
	selectedItems: FileManagerItem[]
	setSelectedIds: (ids: string[]) => void
	setCatalogId: (id: string | null) => Promise<unknown>
	setSelectedCatalogId: (id: string | null) => void
	startTransition: (callback: () => void) => void
	items: FileManagerItem[]
	treeNodes: FileCatalog[]
	setPreviewItem: (item: FileManagerItem | null) => void
}

export function useFileManagerActions({
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
}: UseFileManagerActionsProps) {
	const queryClient = useQueryClient()

	// Dialog States
	const [moveDialogOpen, setMoveDialogOpen] = useState(false)
	const [moveTargets, setMoveTargets] = useState<Array<{ id: string; kind: "file" | "folder" }>>([])
	const [targetCatalogId, setTargetCatalogId] = useState<string | null>(null)
	const [renamingState, setRenamingState] = useState<{ id: string; context: "tree" | "list" } | null>(
		null,
	)
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

	// Folder Form
	const folderForm = useForm<z.infer<typeof FolderSchema>>({
		resolver: zodResolver(FolderSchema),
		defaultValues: { name: "" },
	})

	// Handlers
	const handleDownloadItem = useCallback(
		(item: FileManagerItem) => {
			if (item.kind !== "file") return
			const link = document.createElement("a")
			link.href = getDownloadUrl(bizType, item.id)
			link.download = item.name
			link.click()
		},
		[bizType],
	)

	const handleCopyLink = useCallback(
		async (item: FileManagerItem) => {
			if (item.kind !== "file") return
			if (!navigator.clipboard) {
				toast.error("当前环境不支持复制链接")
				return
			}
			await navigator.clipboard.writeText(getViewUrl(bizType, item.id))
			toast.success("链接已复制")
		},
		[bizType],
	)

	const handleDeleteItem = useCallback(
		async (item: FileManagerItem) => {
			if (item.kind === "folder") {
				try {
					const hasChildren = await fetchCheckCatalogHasChildren(bizType, item.id)
					if (hasChildren) {
						await fetchForceDeleteCatalog(bizType, item.id)
					} else {
						await fetchDeleteCatalog(bizType, item.id)
					}
					void refetchCatalogs()
					void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
					toast.success("文件夹已移入回收站")
				} catch (_error) {}
			} else {
				try {
					await fetchDeleteFile(bizType, item.id)
					void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
					toast.success("文件已移入回收站")
				} catch (_error) {}
			}
		},
		[bizType, queryClient, refetchCatalogs],
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
		[bizType, queryClient, refetchCatalogs],
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
		[bizType, queryClient, refetchCatalogs],
	)

	const handleBatchDelete = useCallback(async () => {
		if (selectedItems.length === 0) return
		try {
			const files = selectedItems.filter((item) => item.kind === "file").map((item) => item.id)
			const folders = selectedItems.filter((item) => item.kind === "folder").map((item) => item.id)
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
		} catch (_error) {
			toast.error("批量删除失败")
		}
	}, [selectedItems, bizType, refetchCatalogs, queryClient, setSelectedIds])

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
	}, [selectedItems, bizType, refetchCatalogs, queryClient, setSelectedIds])

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
	}, [selectedItems, bizType, refetchCatalogs, queryClient, setSelectedIds])

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
	}, [bizType, refetchCatalogs, queryClient, setSelectedIds])

	const handleSubmitFolder = useCallback(
		async (values: z.infer<typeof FolderSchema>) => {
			if (dialogMode === "create") {
				const parentId =
					dialogTarget && !("kind" in dialogTarget) ? dialogTarget.id : (selectedCatalogId ?? null)
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
		[
			dialogMode,
			dialogTarget,
			selectedCatalogId,
			bizType,
			queryClient,
			folderForm,
			refetchCatalogs,
		],
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
	}, [targetCatalogId, moveTargets, bizType, queryClient, refetchCatalogs])

	const handleBatchMoveToCatalog = useCallback(
		async (targetId: string, ids: string[]) => {
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
		[items, bizType, refetchCatalogs, queryClient],
	)

	const handleTreeAction = useCallback(
		(
			action: "create" | "rename" | "move" | "download" | "toggle-public" | "delete" | "refresh",
			node: FileCatalog,
		) => {
			if (action === "create") handleOpenFolderDialog("create", node)
			if (action === "rename") setRenamingState({ id: node.id, context: "tree" })
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
		[
			bizType,
			handleDeleteItem,
			handleMoveTargets,
			handleOpenFolderDialog,
			queryClient,
			refetchCatalogs,
		],
	)

	const handleOpenItem = useCallback(
		(item: FileManagerItem) => {
			if (item.kind === "folder") {
				setSelectedCatalogId(item.id)
				startTransition(() => {
					void setCatalogId(item.id)
				})
				return
			}
			setPreviewItem(item)
		},
		[setSelectedCatalogId, startTransition, setCatalogId, setPreviewItem],
	)

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

	const handleRenameItem = useCallback(
		(item: FileManagerItem) => {
			setRenamingState({ id: item.id, context: "list" })
		},
		[],
	)

	const handleConfirmRename = useCallback(
		async (id: string, newName: string, kind: "file" | "folder") => {
			if (kind === "folder") {
				await fetchRenameCatalog(bizType, id, newName)
			} else {
				await fetchRenameFile(bizType, id, newName)
			}
			void refetchCatalogs()
			void queryClient.invalidateQueries({ queryKey: ["fss-files", bizType] })
			setRenamingState(null)
			toast.success("已重命名")
		},
		[bizType, queryClient, refetchCatalogs],
	)

	const handleMoveItem = useCallback(
		(item: FileManagerItem) => {
			handleMoveTargets([{ id: item.id, kind: item.kind }])
		},
		[handleMoveTargets],
	)

	const handlePreviewUrl = useCallback((id: string) => getViewUrl(bizType, id), [bizType])

	const moveDisabledIds = useMemo(() => {
		const folderTargets = moveTargets
			.filter((item) => item.kind === "folder")
			.map((item) => item.id)
		if (folderTargets.length === 0) {
			return selectedCatalogId ? [selectedCatalogId] : []
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
	}, [moveTargets, selectedCatalogId, treeNodes])

	return {
		moveDialogOpen,
		setMoveDialogOpen,
		moveTargets,
		setMoveTargets,
		targetCatalogId,
		setTargetCatalogId,
		dialogMode,
		setDialogMode,
		dialogTarget,
		setDialogTarget,
		confirmAction,
		setConfirmAction,
		folderForm,

		handleDownloadItem,
		handleCopyLink,
		handleDeleteItem,
		handleRecoverItem,
		handleHardDeleteItem,
		handleBatchDelete,
		handleBatchRecover,
		handleBatchHardDelete,
		handleClearRecycle,
		handleSubmitFolder,
		handleOpenFolderDialog,
		handleMoveTargets,
		handleConfirmMove,
		handleBatchMoveToCatalog,
		handleTreeAction,
		handleOpenItem,
		handleCreateFolder,
		handleDownloadSelected,
		handleMoveSelected,
		handleRenameItem,
		handleConfirmRename,
		renamingId: renamingState?.id ?? null,
		renamingContext: renamingState?.context ?? null,
		setRenamingId: (id: string | null) => {
			if (!id) setRenamingState(null)
			else setRenamingState({ id, context: "list" }) // Default fallback or explicit context needed
		},
		handleMoveItem,
		handlePreviewUrl,

		moveDisabledIds,
	}
}
