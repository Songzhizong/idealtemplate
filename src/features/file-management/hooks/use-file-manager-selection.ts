"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import type { FileManagerItem } from "../types"

export function useFileManagerSelection(deferredItems: FileManagerItem[]) {
	const [selectedIds, setSelectedIds] = useState<string[]>([])
	const [previewItem, setPreviewItem] = useState<FileManagerItem | null>(null)
	const deferredSelectedIds = useMemo(() => selectedIds, [selectedIds])
	const [_, startTransition] = useTransition()

	useEffect(() => {
		const itemIds = new Set(deferredItems.map((item) => item.id))
		startTransition(() => {
			setSelectedIds((prev) => prev.filter((id) => itemIds.has(id)))
		})
	}, [deferredItems])

	useEffect(() => {
		setSelectedIds([])
	}, [])

	const selectedItems = useMemo(() => {
		const map = new Map(deferredItems.map((item) => [item.id, item]))
		return deferredSelectedIds
			.map((id) => map.get(id))
			.filter((item): item is FileManagerItem => Boolean(item))
	}, [deferredItems, deferredSelectedIds])

	return {
		selectedIds,
		setSelectedIds,
		deferredSelectedIds,
		previewItem,
		setPreviewItem,
		selectedItems,
		startTransition,
	}
}
