import { z } from "zod"
import type { PageInfo } from "@/types/pagination"
import type { FileCatalog, FileCatalogTrees, FileRecord } from "../types"

export const BASE_PATH = "*/nexus-api/fss/tenant"
export const ROOT_CATALOG_ID = "root"

export const CreateCatalogSchema = z.object({
	parentId: z.string().nullable(),
	name: z.string().min(1),
})

export const RenameCatalogSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
})

export const RenameFileSchema = z.object({
	id: z.string().min(1),
	filename: z.string().min(1),
})

export const BatchMoveSchema = z.object({
	catalogId: z.string().min(1),
	fileIds: z.array(z.string().min(1)).min(1),
})

export const InitMultipartUploadSchema = z.object({
	originalName: z.string().min(1),
	contentType: z.string().min(1),
	public: z.boolean(),
})

export const CompleteMultipartSchema = z.object({
	etags: z.array(
		z.object({
			partNumber: z.number().int().positive(),
			eTag: z.string().min(1),
		}),
	),
})

export const IdListSchema = z.array(z.string().min(1))

export type CatalogState = FileCatalog & { bizType: string }
export type FileState = FileRecord & { bizType: string; content?: ArrayBuffer | null }
export type MultipartSession = {
	bizType: string
	catalogId: string
	originalName: string
	contentType: string
	parts: Map<number, ArrayBuffer>
}

export const store = {
	catalogs: new Map<string, CatalogState>(),
	files: new Map<string, FileState>(),
	uploads: new Map<string, MultipartSession>(),
	seededBizTypes: new Set<string>(),
}

const PNG_BASE64 =
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

const PDF_BASE64 =
	"JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sgMyAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMjAwIDIwMF0vQ29udGVudHMgNCAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDUgMCBSPj4+Pj4+PgplbmRvYmoKNCAwIG9iago8PC9MZW5ndGggNDQ+PnN0cmVhbQpCVCAvRjEgMTIgVGYgNzIgNzIgVGQoSGVsbG8gTWFjaykhKQpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvTmFtZS9GMQovQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYxIDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAowMDAwMDAwMzM1IDAwMDAwIG4gCnRyYWlsZXIKPDwvUm9vdCAxIDAgUi9TaXplIDY+PgpzdGFydHhyZWYKNDA1CiUlRU9G"

function decodeBase64(base64: string) {
	const binary = atob(base64)
	const bytes = new Uint8Array(binary.length)
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i)
	}
	return bytes.buffer
}

export function nowIso() {
	return new Date().toISOString()
}

export function makeId(prefix: string) {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return `${prefix}-${crypto.randomUUID()}`
	}
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ensureSeeded(bizType: string) {
	if (store.seededBizTypes.has(bizType)) return
	store.seededBizTypes.add(bizType)

	const designId = makeId("cat")
	const contractId = makeId("cat")
	const marketingId = makeId("cat")
	const brandId = makeId("cat")
	const archiveId = makeId("cat")
	const recycleCatalogId = makeId("cat")

	const catalogs: CatalogState[] = [
		{ id: designId, parentId: null, name: "Design Assets", public: true, deleted: false, bizType },
		{ id: contractId, parentId: null, name: "Contracts", public: false, deleted: false, bizType },
		{ id: marketingId, parentId: null, name: "Marketing", public: true, deleted: false, bizType },
		{ id: brandId, parentId: marketingId, name: "Brand Kit", public: true, deleted: false, bizType },
		{ id: archiveId, parentId: contractId, name: "Archive", public: false, deleted: false, bizType },
		{
			id: recycleCatalogId,
			parentId: null,
			name: "Old Proposal",
			public: false,
			deleted: true,
			deleteTime: nowIso(),
			bizType,
		},
	]

	const files: FileState[] = [
		{
			id: makeId("file"),
			catalogId: designId,
			objectId: makeId("obj"),
			fileName: "homepage.png",
			contentType: "image/png",
			objectSize: "24576",
			createdTime: nowIso(),
			deleted: false,
			content: decodeBase64(PNG_BASE64),
			bizType,
		},
		{
			id: makeId("file"),
			catalogId: designId,
			objectId: makeId("obj"),
			fileName: "logo-usage.pdf",
			contentType: "application/pdf",
			objectSize: "48128",
			createdTime: nowIso(),
			deleted: false,
			content: decodeBase64(PDF_BASE64),
			bizType,
		},
		{
			id: makeId("file"),
			catalogId: marketingId,
			objectId: makeId("obj"),
			fileName: "campaign-plan.docx",
			contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			objectSize: "98304",
			createdTime: nowIso(),
			deleted: false,
			bizType,
		},
		{
			id: makeId("file"),
			catalogId: brandId,
			objectId: makeId("obj"),
			fileName: "brand-colors.csv",
			contentType: "text/csv",
			objectSize: "4096",
			createdTime: nowIso(),
			deleted: false,
			content: new TextEncoder().encode("name,hex\nPrimary,#000000\nSecondary,#FFFFFF\n").buffer,
			bizType,
		},
		{
			id: makeId("file"),
			catalogId: ROOT_CATALOG_ID,
			objectId: makeId("obj"),
			fileName: "readme.txt",
			contentType: "text/plain",
			objectSize: "1024",
			createdTime: nowIso(),
			deleted: false,
			content: new TextEncoder().encode("Demo file for file manager mock.").buffer,
			bizType,
		},
		{
			id: makeId("file"),
			catalogId: recycleCatalogId,
			objectId: makeId("obj"),
			fileName: "obsolete-notes.txt",
			contentType: "text/plain",
			objectSize: "512",
			createdTime: nowIso(),
			deleted: true,
			deleteTime: nowIso(),
			content: new TextEncoder().encode("This file is in recycle bin.").buffer,
			bizType,
		},
	]

	for (const catalog of catalogs) {
		store.catalogs.set(catalog.id, catalog)
	}
	for (const file of files) {
		store.files.set(file.id, file)
	}
}

export function getCatalogsByBizType(bizType: string) {
	return [...store.catalogs.values()].filter((catalog) => catalog.bizType === bizType)
}

export function getFilesByBizType(bizType: string) {
	return [...store.files.values()].filter((file) => file.bizType === bizType)
}

function buildTree(items: CatalogState[]): FileCatalog[] {
	const nodeMap = new Map<string, FileCatalog>()
	for (const item of items) {
		nodeMap.set(item.id, {
			id: item.id,
			parentId: item.parentId,
			name: item.name,
			public: item.public,
			deleted: item.deleted,
			deleteTime: item.deleteTime ?? null,
			children: [],
		})
	}

	const roots: FileCatalog[] = []
	for (const node of nodeMap.values()) {
		if (node.parentId && nodeMap.has(node.parentId)) {
			const parent = nodeMap.get(node.parentId)
			parent?.children?.push(node)
		} else {
			roots.push(node)
		}
	}

	return roots
}

export function buildTrees(bizType: string): FileCatalogTrees {
	const catalogs = getCatalogsByBizType(bizType)
	return {
		all: buildTree(catalogs),
		active: buildTree(catalogs.filter((item) => !item.deleted)),
		recycled: buildTree(catalogs.filter((item) => item.deleted)),
	}
}

export function paginate<T>(items: T[], pageNumber: number, pageSize: number): PageInfo<T> {
	const safePageNumber = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1
	const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20
	const totalElements = items.length
	const totalPages = Math.max(1, Math.ceil(totalElements / safePageSize))
	const start = (safePageNumber - 1) * safePageSize
	const content = items.slice(start, start + safePageSize)
	return {
		pageNumber: safePageNumber,
		pageSize: safePageSize,
		totalElements,
		totalPages,
		content,
	}
}

function collectDescendants(bizType: string, catalogId: string) {
	const catalogs = getCatalogsByBizType(bizType)
	const descendants: string[] = []
	const queue = [catalogId]
	while (queue.length > 0) {
		const current = queue.shift()
		if (!current) continue
		descendants.push(current)
		for (const catalog of catalogs) {
			if (catalog.parentId === current) {
				queue.push(catalog.id)
			}
		}
	}
	return descendants
}

export function setCatalogDeleted(bizType: string, catalogId: string, deleted: boolean) {
	const ids = collectDescendants(bizType, catalogId)
	const deleteTime = deleted ? nowIso() : null
	for (const id of ids) {
		const catalog = store.catalogs.get(id)
		if (!catalog || catalog.bizType !== bizType) continue
		catalog.deleted = deleted
		catalog.deleteTime = deleteTime
	}
	for (const file of getFilesByBizType(bizType)) {
		if (ids.includes(file.catalogId)) {
			file.deleted = deleted
			file.deleteTime = deleteTime
		}
	}
}

export function removeCatalogHard(bizType: string, catalogId: string) {
	const ids = collectDescendants(bizType, catalogId)
	for (const id of ids) {
		store.catalogs.delete(id)
	}
	for (const [id, file] of store.files.entries()) {
		if (file.bizType === bizType && ids.includes(file.catalogId)) {
			store.files.delete(id)
		}
	}
}

export function recoverCatalogChain(bizType: string, catalogId: string | null) {
	let currentId = catalogId
	while (currentId) {
		const catalog = store.catalogs.get(currentId)
		if (!catalog || catalog.bizType !== bizType) break
		catalog.deleted = false
		catalog.deleteTime = null
		currentId = catalog.parentId
	}
}

export function getFileContent(file: FileState) {
	if (file.content) {
		return { contentType: file.contentType, body: file.content }
	}
	if (file.contentType.startsWith("image/")) {
		return { contentType: "image/png", body: decodeBase64(PNG_BASE64) }
	}
	if (file.contentType === "application/pdf") {
		return { contentType: "application/pdf", body: decodeBase64(PDF_BASE64) }
	}
	if (file.contentType.includes("officedocument") || file.contentType.includes("msword")) {
		const html = `<html><body><h3>${file.fileName}</h3><p>Mock document preview.</p></body></html>`
		return { contentType: "text/html", body: html }
	}
	const text = `Mock file content: ${file.fileName}`
	return { contentType: "text/plain", body: text }
}

export function pickRootOrAll(files: FileState[], catalogId: string | null, filename: string | null) {
	if (catalogId) return files.filter((file) => file.catalogId === catalogId)
	if (filename) return files
	return files.filter((file) => file.catalogId === ROOT_CATALOG_ID)
}
