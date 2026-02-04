import { delay, HttpResponse, http } from "msw"
import { z } from "zod"
import { mockRegistry } from "@/mocks/registry"
import {
	BASE_PATH,
	BatchMoveSchema,
	CompleteMultipartSchema,
	IdListSchema,
	InitMultipartUploadSchema,
	ROOT_CATALOG_ID,
	RenameFileSchema,
	ensureSeeded,
	getFileContent,
	getFilesByBizType,
	makeId,
	nowIso,
	paginate,
	pickRootOrAll,
	recoverCatalogChain,
	store,
} from "./fss.mock.store"

export const fssFileHandlers = [
	http.get(`${BASE_PATH}/files/:bizType`, async ({ request, params }) => {
		const bizType = z.string().parse(params.bizType)
		ensureSeeded(bizType)
		const url = new URL(request.url)
		const catalogIdParam = url.searchParams.get("catalogId")
		const filenameParam = url.searchParams.get("filename")
		const pageNumber = Number(url.searchParams.get("pageNumber") ?? 1)
		const pageSize = Number(url.searchParams.get("pageSize") ?? 20)
		const catalogId = catalogIdParam && catalogIdParam.length > 0 ? catalogIdParam : null
		const filename = filenameParam && filenameParam.length > 0 ? filenameParam : null

		let items = getFilesByBizType(bizType).filter((file) => !file.deleted)
		items = pickRootOrAll(items, catalogId, filename)
		if (filename) {
			const keyword = filename.toLowerCase()
			items = items.filter((file) => file.fileName.toLowerCase().includes(keyword))
		}
		items.sort((a, b) => b.createdTime.localeCompare(a.createdTime))
		await delay(200)
		return HttpResponse.json(paginate(items, pageNumber, pageSize))
	}),

	http.get(`${BASE_PATH}/files/:bizType/recycle-bin`, async ({ request, params }) => {
		const bizType = z.string().parse(params.bizType)
		ensureSeeded(bizType)
		const url = new URL(request.url)
		const catalogIdParam = url.searchParams.get("catalogId")
		const filenameParam = url.searchParams.get("filename")
		const pageNumber = Number(url.searchParams.get("pageNumber") ?? 1)
		const pageSize = Number(url.searchParams.get("pageSize") ?? 20)
		const catalogId = catalogIdParam && catalogIdParam.length > 0 ? catalogIdParam : null
		const filename = filenameParam && filenameParam.length > 0 ? filenameParam : null

		let items = getFilesByBizType(bizType).filter((file) => file.deleted)
		items = pickRootOrAll(items, catalogId, filename)
		if (filename) {
			const keyword = filename.toLowerCase()
			items = items.filter((file) => file.fileName.toLowerCase().includes(keyword))
		}
		items.sort((a, b) => b.createdTime.localeCompare(a.createdTime))
		await delay(200)
		return HttpResponse.json(paginate(items, pageNumber, pageSize))
	}),

	http.put(`${BASE_PATH}/files/:bizType/:catalogId`, async ({ request, params }) => {
		const bizType = z.string().parse(params.bizType)
		const catalogId = z.string().parse(params.catalogId)
		ensureSeeded(bizType)
		const formData = await request.formData()
		const fileEntry = formData.get("file")
		if (!(fileEntry instanceof File)) {
			return HttpResponse.json({ message: "Missing file" }, { status: 400 })
		}
		const arrayBuffer = await fileEntry.arrayBuffer()
		const record = {
			id: makeId("file"),
			catalogId: catalogId.length > 0 ? catalogId : ROOT_CATALOG_ID,
			objectId: makeId("obj"),
			fileName: fileEntry.name,
			contentType: fileEntry.type || "application/octet-stream",
			objectSize: String(fileEntry.size),
			createdTime: nowIso(),
			deleted: false,
			content: arrayBuffer,
			bizType,
		}
		store.files.set(record.id, record)
		await delay(300)
		return HttpResponse.json(record)
	}),

	http.post(`${BASE_PATH}/files/:bizType/:catalogId/multipart/init`, async ({ request, params }) => {
		const bizType = z.string().parse(params.bizType)
		const catalogId = z.string().parse(params.catalogId)
		ensureSeeded(bizType)
		const payload = InitMultipartUploadSchema.parse(await request.json())
		const uploadId = makeId("upload")
		store.uploads.set(uploadId, {
			bizType,
			catalogId: catalogId.length > 0 ? catalogId : ROOT_CATALOG_ID,
			originalName: payload.originalName,
			contentType: payload.contentType,
			parts: new Map(),
		})
		await delay(200)
		return HttpResponse.json({ uploadId })
	}),

	http.put(`${BASE_PATH}/files/multipart/:uploadId/:partNumber`, async ({ request, params }) => {
		const uploadId = z.string().parse(params.uploadId)
		const partNumber = Number(params.partNumber)
		const session = store.uploads.get(uploadId)
		if (!session || !Number.isFinite(partNumber)) {
			return HttpResponse.json({ message: "Upload not found" }, { status: 404 })
		}
		const data = await request.arrayBuffer()
		session.parts.set(partNumber, data)
		await delay(120)
		return HttpResponse.json({ partNumber, eTag: `etag-${uploadId}-${partNumber}` })
	}),

	http.post(
		`${BASE_PATH}/files/:bizType/:catalogId/multipart/:uploadId/complete`,
		async ({ request, params }) => {
			const bizType = z.string().parse(params.bizType)
			const catalogId = z.string().parse(params.catalogId)
			const uploadId = z.string().parse(params.uploadId)
			ensureSeeded(bizType)
			const payload = CompleteMultipartSchema.parse(await request.json())
			const session = store.uploads.get(uploadId)
			if (!session || session.bizType !== bizType) {
				return HttpResponse.json({ message: "Upload not found" }, { status: 404 })
			}
			const buffers = payload.etags
				.map((etag) => session.parts.get(etag.partNumber))
				.filter((part): part is ArrayBuffer => Boolean(part))
			const totalSize = buffers.reduce((acc, part) => acc + part.byteLength, 0)
			const merged = new Uint8Array(totalSize)
			let offset = 0
			for (const part of buffers) {
				merged.set(new Uint8Array(part), offset)
				offset += part.byteLength
			}
			const record = {
				id: makeId("file"),
				catalogId: catalogId.length > 0 ? catalogId : ROOT_CATALOG_ID,
				objectId: makeId("obj"),
				fileName: session.originalName,
				contentType: session.contentType,
				objectSize: String(totalSize),
				createdTime: nowIso(),
				deleted: false,
				content: merged.buffer,
				bizType,
			}
			store.files.set(record.id, record)
			store.uploads.delete(uploadId)
			await delay(300)
			return HttpResponse.json(record)
		},
	),

	http.delete(`${BASE_PATH}/files/multipart/:uploadId`, async ({ params }) => {
		const uploadId = z.string().parse(params.uploadId)
		store.uploads.delete(uploadId)
		await delay(120)
		return HttpResponse.json({ success: true })
	}),

	http.delete(`${BASE_PATH}/files/:bizType/:id`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		const file = store.files.get(id)
		if (!file || file.bizType !== bizType) {
			return HttpResponse.json({ message: "File not found" }, { status: 404 })
		}
		file.deleted = true
		file.deleteTime = nowIso()
		await delay(160)
		return HttpResponse.json({ success: true })
	}),

	http.delete(`${BASE_PATH}/files/:bizType/batch`, async ({ request, params }) => {
		const bizType = z.string().parse(params.bizType)
		ensureSeeded(bizType)
		const ids = IdListSchema.parse(await request.json())
		for (const id of ids) {
			const file = store.files.get(id)
			if (file && file.bizType === bizType) {
				file.deleted = true
				file.deleteTime = nowIso()
			}
		}
		await delay(200)
		return HttpResponse.json({ success: true })
	}),

	http.patch(`${BASE_PATH}/files/:bizType/:id/rename`, async ({ request, params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		const text = await request.text()
		const paramsBody = new URLSearchParams(text)
		const filename = paramsBody.get("filename") ?? ""
		const payload = RenameFileSchema.parse({ id, filename })
		const file = store.files.get(payload.id)
		if (!file || file.bizType !== bizType) {
			return HttpResponse.json({ message: "File not found" }, { status: 404 })
		}
		file.fileName = payload.filename
		await delay(160)
		return HttpResponse.json({ success: true })
	}),

	http.post(`${BASE_PATH}/files/:bizType/move-batch`, async ({ request, params }) => {
		const bizType = z.string().parse(params.bizType)
		ensureSeeded(bizType)
		const payload = BatchMoveSchema.parse(await request.json())
		for (const id of payload.fileIds) {
			const file = store.files.get(id)
			if (file && file.bizType === bizType) {
				file.catalogId = payload.catalogId
			}
		}
		await delay(200)
		return HttpResponse.json({ success: true })
	}),

	http.get(`${BASE_PATH}/files/:bizType/:id/download`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		const file = store.files.get(id)
		if (!file || file.bizType !== bizType) {
			return HttpResponse.json({ message: "File not found" }, { status: 404 })
		}
		const { contentType, body } = getFileContent(file)
		const headers = {
			"Content-Type": contentType,
			"Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
		}
		return HttpResponse.arrayBuffer(
			typeof body === "string" ? new TextEncoder().encode(body).buffer : body,
			{ headers },
		)
	}),

	http.get(`${BASE_PATH}/files/:bizType/:id/view`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		const file = store.files.get(id)
		if (!file || file.bizType !== bizType) {
			return HttpResponse.json({ message: "File not found" }, { status: 404 })
		}
		const { contentType, body } = getFileContent(file)
		const headers = { "Content-Type": contentType }
		if (typeof body === "string") {
			return HttpResponse.text(body, { headers })
		}
		return HttpResponse.arrayBuffer(body, { headers })
	}),

	http.patch(`${BASE_PATH}/files/:bizType/:id/recovery`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		const file = store.files.get(id)
		if (!file || file.bizType !== bizType) {
			return HttpResponse.json({ message: "File not found" }, { status: 404 })
		}
		file.deleted = false
		file.deleteTime = null
		recoverCatalogChain(bizType, file.catalogId)
		await delay(160)
		return HttpResponse.json({ success: true })
	}),

	http.patch(`${BASE_PATH}/files/:bizType/batch/recovery`, async ({ request, params }) => {
		const bizType = z.string().parse(params.bizType)
		ensureSeeded(bizType)
		const ids = IdListSchema.parse(await request.json())
		for (const id of ids) {
			const file = store.files.get(id)
			if (file && file.bizType === bizType) {
				file.deleted = false
				file.deleteTime = null
				recoverCatalogChain(bizType, file.catalogId)
			}
		}
		await delay(200)
		return HttpResponse.json({ success: true })
	}),

	http.delete(`${BASE_PATH}/files/:bizType/:id/hard`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		store.files.delete(id)
		await delay(160)
		return HttpResponse.json({ success: true })
	}),

	http.delete(`${BASE_PATH}/files/:bizType/batch/hard`, async ({ request, params }) => {
		const bizType = z.string().parse(params.bizType)
		ensureSeeded(bizType)
		const ids = IdListSchema.parse(await request.json())
		for (const id of ids) {
			store.files.delete(id)
		}
		await delay(200)
		return HttpResponse.json({ success: true })
	}),

	http.delete(`${BASE_PATH}/recycle-bin/:bizType/clear`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		ensureSeeded(bizType)
		for (const [id, catalog] of store.catalogs.entries()) {
			if (catalog.bizType === bizType && catalog.deleted) {
				store.catalogs.delete(id)
			}
		}
		for (const [id, file] of store.files.entries()) {
			if (file.bizType === bizType && file.deleted) {
				store.files.delete(id)
			}
		}
		await delay(200)
		return HttpResponse.json({ success: true })
	}),
]

mockRegistry.register(...fssFileHandlers)
