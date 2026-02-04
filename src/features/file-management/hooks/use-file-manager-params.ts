"use client"

import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from "nuqs"
import { useDeferredValue, useEffect } from "react"
import type { FileBrowserScope } from "../store/file-browser-store"
import { useFileBrowserStore } from "../store/file-browser-store"

export function useFileManagerParams() {
	const [catalogId, setCatalogId] = useQueryState("cid", parseAsString)
	const [viewMode, setViewMode] = useQueryState("mode", parseAsString.withDefault("list"))
	const [urlScope, setScope] = useQueryState("scope", parseAsString.withDefault("active"))

	const selectedCatalogId = useFileBrowserStore((state) => state.selectedCatalogId)
	const setSelectedCatalogId = useFileBrowserStore((state) => state.setSelectedCatalogId)
	const scope = useFileBrowserStore((state) => state.scope)
	const setScopeStore = useFileBrowserStore((state) => state.setScope)

	const isRecycleBin = scope === "recycle"
	const normalizedCatalogId = catalogId || null
	const deferredCatalogId = useDeferredValue(selectedCatalogId)
	const deferredScope = useDeferredValue(scope)
	const isDeferredRecycleBin = deferredScope === "recycle"

	const [pageState, setPageState] = useQueryStates(
		{
			size: parseAsInteger.withDefault(50),
		},
		{ history: "push", shallow: false },
	)

	const [debouncedSearchValue] = useQueryState("filename", parseAsString.withDefault(""))

	useEffect(() => {
		const nextScope: FileBrowserScope = urlScope === "recycle" ? "recycle" : "active"
		if (nextScope !== scope) {
			setScopeStore(nextScope)
		}
	}, [scope, setScopeStore, urlScope])

	useEffect(() => {
		const nextCatalogId = normalizedCatalogId ?? null
		if (nextCatalogId !== selectedCatalogId) {
			setSelectedCatalogId(nextCatalogId)
		}
	}, [normalizedCatalogId, selectedCatalogId, setSelectedCatalogId])

	return {
		catalogId,
		setCatalogId,
		viewMode,
		setViewMode,
		urlScope,
		setScope,
		selectedCatalogId,
		setSelectedCatalogId,
		scope,
		setScopeStore,
		isRecycleBin,
		deferredCatalogId,
		deferredScope,
		isDeferredRecycleBin,
		pageState,
		setPageState,
		debouncedSearchValue,
	}
}
