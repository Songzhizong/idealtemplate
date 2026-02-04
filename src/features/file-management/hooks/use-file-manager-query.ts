"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo, useRef } from "react"
import { fetchGetFileCatalogTrees, fetchGetFileList, fetchGetRecycleBinFileList } from "../api/fss"
import { findCatalogNode } from "../components/file-manager-helpers"
import type { FileManagerItem } from "../types"

interface UseFileManagerQueryProps {
	bizType: string
	deferredScope: string
	deferredCatalogId: string | null
	debouncedSearchValue: string | null
	pageSize: number
	isDeferredRecycleBin: boolean
	isRecycleBin: boolean
}

export function useFileManagerQuery({
	bizType,
	deferredScope,
	deferredCatalogId,
	debouncedSearchValue,
	pageSize,
	isDeferredRecycleBin,
	isRecycleBin,
}: UseFileManagerQueryProps) {
	const itemCacheRef = useRef(new Map<string, { key: string; item: FileManagerItem }>())

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
			deferredScope,
			deferredCatalogId,
			debouncedSearchValue,
			pageSize,
		],
		queryFn: ({ pageParam = 1 }) => {
			const params = {
				...(deferredCatalogId ? { catalogId: deferredCatalogId } : {}),
				...(debouncedSearchValue ? { filename: debouncedSearchValue } : {}),
			}
			if (isDeferredRecycleBin) {
				return fetchGetRecycleBinFileList(bizType, params, pageParam as number, pageSize)
			}
			return fetchGetFileList(bizType, params, pageParam as number, pageSize)
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			if (lastPage.pageNumber >= lastPage.totalPages) return undefined
			return lastPage.pageNumber + 1
		},
	})

	const treeNodes = isRecycleBin ? (catalogTrees?.recycled ?? []) : (catalogTrees?.active ?? [])

	const items = useMemo(() => {
		const cache = itemCacheRef.current
		const nextKeys = new Set<string>()
		const folderNodes = (() => {
			if (!deferredCatalogId) return treeNodes
			return findCatalogNode(treeNodes, deferredCatalogId)?.children ?? []
		})()
		const folders: FileManagerItem[] = (folderNodes ?? []).map((node) => {
			const cacheKey = `folder:${node.id}`
			const key = [
				"folder",
				node.id,
				node.name,
				node.parentId ?? "",
				node.deleted ? "1" : "0",
				node.deleteTime ?? "",
			].join("|")
			nextKeys.add(cacheKey)
			const cached = cache.get(cacheKey)
			if (cached && cached.key === key) {
				return cached.item
			}
			const item: FileManagerItem = {
				kind: "folder",
				id: node.id,
				name: node.name,
				parentId: node.parentId,
				deleted: node.deleted,
				deleteTime: node.deleteTime ?? null,
				raw: node,
			}
			cache.set(cacheKey, { key, item })
			return item
		})

		const fileRecords = fileQuery.data?.pages.flatMap((page) => page.content) ?? []
		const files: FileManagerItem[] = fileRecords.map((file) => {
			const cacheKey = `file:${file.id}`
			const key = [
				"file",
				file.id,
				file.fileName,
				file.contentType,
				file.objectSize ?? "",
				file.createdTime ?? "",
				file.deleted ? "1" : "0",
				file.deleteTime ?? "",
			].join("|")
			nextKeys.add(cacheKey)
			const cached = cache.get(cacheKey)
			if (cached && cached.key === key) {
				return cached.item
			}
			const item: FileManagerItem = {
				kind: "file",
				id: file.id,
				name: file.fileName,
				contentType: file.contentType,
				objectSize: file.objectSize,
				createdTime: file.createdTime,
				deleted: file.deleted,
				deleteTime: file.deleteTime ?? null,
				raw: file,
			}
			cache.set(cacheKey, { key, item })
			return item
		})

		for (const cacheKey of cache.keys()) {
			if (!nextKeys.has(cacheKey)) {
				cache.delete(cacheKey)
			}
		}

		return [...folders, ...files]
	}, [deferredCatalogId, treeNodes, fileQuery.data?.pages])

	const deferredItems = useMemo(() => items, [items])

	return {
		catalogTrees,
		catalogLoading,
		refetchCatalogs,
		fileQuery,
		treeNodes,
		items,
		deferredItems,
	}
}
