"use client"

import { create } from "zustand"

export type FileBrowserScope = "active" | "recycle"

type FileBrowserState = {
	selectedCatalogId: string | null
	scope: FileBrowserScope
	setSelectedCatalogId: (id: string | null) => void
	setScope: (scope: FileBrowserScope) => void
}

export const useFileBrowserStore = create<FileBrowserState>((set) => ({
	selectedCatalogId: null,
	scope: "active",
	setSelectedCatalogId: (id) => set({ selectedCatalogId: id }),
	setScope: (scope) => set({ scope }),
}))
