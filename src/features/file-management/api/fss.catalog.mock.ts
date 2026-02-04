import { delay, HttpResponse, http } from "msw"
import { z } from "zod"
import { mockRegistry } from "@/mocks/registry"
import {
	BASE_PATH,
	CreateCatalogSchema,
	RenameCatalogSchema,
	buildTrees,
	ensureSeeded,
	getCatalogsByBizType,
	makeId,
	recoverCatalogChain,
	removeCatalogHard,
	setCatalogDeleted,
	store,
} from "./fss.mock.store"

export const fssCatalogHandlers = [
	http.get(`${BASE_PATH}/catalogs/:bizType/trees`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		ensureSeeded(bizType)
		await delay(200)
		return HttpResponse.json(buildTrees(bizType))
	}),

	http.post(`${BASE_PATH}/catalogs/:bizType`, async ({ request, params }) => {
		const bizType = z.string().parse(params.bizType)
		ensureSeeded(bizType)
		const payload = CreateCatalogSchema.parse(await request.json())
		const parentId = payload.parentId?.length ? payload.parentId : null
		const catalog = {
			id: makeId("cat"),
			parentId,
			name: payload.name,
			public: false,
			deleted: false,
			bizType,
		}
		store.catalogs.set(catalog.id, catalog)
		await delay(200)
		return HttpResponse.json(catalog)
	}),

	http.patch(`${BASE_PATH}/catalogs/:bizType/:id/name`, async ({ params, request }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		const url = new URL(request.url)
		const name = url.searchParams.get("name") ?? ""
		const payload = RenameCatalogSchema.parse({ id, name })
		const catalog = store.catalogs.get(payload.id)
		if (!catalog || catalog.bizType !== bizType) {
			return HttpResponse.json({ message: "Catalog not found" }, { status: 404 })
		}
		catalog.name = payload.name
		await delay(160)
		return HttpResponse.json(catalog)
	}),

	http.patch(`${BASE_PATH}/catalogs/:bizType/:id/public`, async ({ params, request }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		const url = new URL(request.url)
		const isPublic = url.searchParams.get("public") === "true"
		const catalog = store.catalogs.get(id)
		if (!catalog || catalog.bizType !== bizType) {
			return HttpResponse.json({ message: "Catalog not found" }, { status: 404 })
		}
		catalog.public = isPublic
		await delay(160)
		return HttpResponse.json(catalog)
	}),

	http.patch(`${BASE_PATH}/catalogs/:bizType/:id/parent`, async ({ params, request }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		const url = new URL(request.url)
		const parentId = url.searchParams.get("parentId") ?? ""
		const catalog = store.catalogs.get(id)
		if (!catalog || catalog.bizType !== bizType) {
			return HttpResponse.json({ message: "Catalog not found" }, { status: 404 })
		}
		catalog.parentId = parentId.length > 0 ? parentId : null
		await delay(160)
		return HttpResponse.json({ success: true })
	}),

	http.get(`${BASE_PATH}/catalogs/:bizType/:id/has-children`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		const hasChildren = getCatalogsByBizType(bizType).some(
			(catalog) => catalog.parentId === id && !catalog.deleted,
		)
		await delay(120)
		return HttpResponse.json(hasChildren)
	}),

	http.delete(`${BASE_PATH}/catalogs/:bizType/:id`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		setCatalogDeleted(bizType, id, true)
		await delay(200)
		return HttpResponse.json({ success: true })
	}),

	http.delete(`${BASE_PATH}/catalogs/:bizType/:id/force`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		setCatalogDeleted(bizType, id, true)
		await delay(200)
		return HttpResponse.json({ success: true })
	}),

	http.patch(`${BASE_PATH}/catalogs/:bizType/:id/recovery`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		setCatalogDeleted(bizType, id, false)
		recoverCatalogChain(bizType, id)
		await delay(200)
		return HttpResponse.json({ success: true })
	}),

	http.delete(`${BASE_PATH}/catalogs/:bizType/:id/hard`, async ({ params }) => {
		const bizType = z.string().parse(params.bizType)
		const id = z.string().parse(params.id)
		ensureSeeded(bizType)
		removeCatalogHard(bizType, id)
		await delay(200)
		return HttpResponse.json({ success: true })
	}),
]

mockRegistry.register(...fssCatalogHandlers)
