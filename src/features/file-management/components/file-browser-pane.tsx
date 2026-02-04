"use client"

import { memo } from "react"
import type { FileManagerItem } from "../types"
import { FileBrowser } from "./file-browser"
import type { FileBrowserItemActionHandlers } from "./file-browser-actions"

interface FileBrowserPaneProps extends FileBrowserItemActionHandlers {
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
}

export const FileBrowserPane = memo(function FileBrowserPane(props: FileBrowserPaneProps) {
	return <FileBrowser {...props} />
})
