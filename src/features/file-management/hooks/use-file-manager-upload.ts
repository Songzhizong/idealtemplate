"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import type { useFileUploadManager } from "./use-file-upload-manager"

interface UseFileManagerUploadProps {
	isRecycleBin: boolean
	selectedCatalogId: string | null
	getCatalogPath: (catalogId: string | null) => string
	startUploads: ReturnType<typeof useFileUploadManager>["startUploads"]
}

export function useFileManagerUpload({
	isRecycleBin,
	selectedCatalogId,
	getCatalogPath,
	startUploads,
}: UseFileManagerUploadProps) {
	const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([])
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
	const [uploadTargetId, setUploadTargetId] = useState<string | null>(null)

	const uploadFileInputRef = useRef<HTMLInputElement | null>(null)
	const uploadFolderInputRef = useRef<HTMLInputElement | null>(null)

	const handleUploadFiles = useCallback(
		(files: File[]) => {
			if (isRecycleBin || files.length === 0) return

			if (!selectedCatalogId) {
				setPendingUploadFiles(files)
				setUploadTargetId(null)
				setUploadDialogOpen(true)
				return
			}

			startUploads(files, selectedCatalogId, getCatalogPath(selectedCatalogId))
		},
		[isRecycleBin, selectedCatalogId, getCatalogPath, startUploads],
	)

	const handleConfirmUpload = useCallback(() => {
		if (pendingUploadFiles.length > 0 && uploadTargetId) {
			startUploads(pendingUploadFiles, uploadTargetId, getCatalogPath(uploadTargetId))
			setUploadDialogOpen(false)
			setPendingUploadFiles([])
			setUploadTargetId(null)
			toast.success("已开始上传到指定目录")
		}
	}, [pendingUploadFiles, startUploads, uploadTargetId, getCatalogPath])

	const handleUploadFilesClick = useCallback(() => {
		uploadFileInputRef.current?.click()
	}, [])

	const handleUploadFolderClick = useCallback(() => {
		uploadFolderInputRef.current?.click()
	}, [])

	const handleTriggerUpload = useCallback(() => {
		uploadFileInputRef.current?.click()
	}, [])

	const handleFileInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files ?? [])
			handleUploadFiles(files)
			event.target.value = ""
		},
		[handleUploadFiles],
	)

	const handleFolderInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files ?? [])
			handleUploadFiles(files)
			event.target.value = ""
		},
		[handleUploadFiles],
	)

	const setFolderInputRef = useCallback((node: HTMLInputElement | null) => {
		uploadFolderInputRef.current = node
		if (node) {
			node.setAttribute("webkitdirectory", "true")
		}
	}, [])

	return {
		pendingUploadFiles,
		setPendingUploadFiles,
		uploadDialogOpen,
		setUploadDialogOpen,
		uploadTargetId,
		setUploadTargetId,
		uploadFileInputRef,
		uploadFolderInputRef,
		handleUploadFiles,
		handleConfirmUpload,
		handleUploadFilesClick,
		handleUploadFolderClick,
		handleTriggerUpload,
		handleFileInputChange,
		handleFolderInputChange,
		setFolderInputRef,
	}
}
