"use client"

import { useCallback, useEffect, useRef } from "react"

import {
	fetchAbortMultipartUpload,
	fetchCompleteMultipartUpload,
	fetchInitMultipartUpload,
	fetchUploadFile,
	fetchUploadPart,
} from "../api/fss"
import { type UploadTask, useUploadStore } from "../store/upload-store"
import type { ETag } from "../types"

const CHUNK_SIZE = 5 * 1024 * 1024
const MAX_CONCURRENCY = 3

interface UploadOptions {
	bizType: string
	catalogId: string | null
	isPublic?: boolean
	onCompleted?: () => void
}

type UploadControllerMap = Map<string, AbortController>

function createTask(
	file: File,
	catalogId: string | null,
	targetPath: string | null,
): UploadTask {
	const now = Date.now()
	return {
		id: `upload-${now}-${Math.random().toString(36).slice(2, 8)}`,
		fileName: file.name,
		fileSize: file.size,
		uploadedBytes: 0,
		progress: 0,
		status: "pending",
		speed: null,
		catalogId,
		targetPath,
		createdTime: now,
		finishedTime: null,
		errorMessage: null,
		etags: [],
	}
}

async function uploadParts(args: {
	file: File
	uploadId: string
	existingEtags: ETag[]
	signal: AbortSignal
	onProgress: (uploadedBytes: number, totalBytes: number, speed: number) => void
	onPartUploaded: (etag: ETag) => void
}) {
	const { file, uploadId, existingEtags, signal, onProgress, onPartUploaded } = args
	const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
	const existingPartNumbers = new Set(existingEtags.map((e) => e.partNumber))
	const chunks: Array<{ partNumber: number; blob: Blob }> = []

	for (let index = 0; index < totalChunks; index += 1) {
		const start = index * CHUNK_SIZE
		const end = Math.min(file.size, start + CHUNK_SIZE)
		if (!existingPartNumbers.has(index + 1)) {
			chunks.push({ partNumber: index + 1, blob: file.slice(start, end) })
		}
	}

	let uploadedBytes = existingEtags.reduce((acc, e) => {
		const partSize =
			e.partNumber * CHUNK_SIZE > file.size
				? file.size - (e.partNumber - 1) * CHUNK_SIZE
				: CHUNK_SIZE
		return acc + partSize
	}, 0)

	const etags: ETag[] = [...existingEtags]
	const queue = [...chunks]

	const startTime = Date.now()
	const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, chunks.length) }, () =>
		(async () => {
			while (queue.length > 0) {
				const part = queue.shift()
				if (!part) return
				const result = await fetchUploadPart({
					uploadId,
					partNumber: part.partNumber,
					data: part.blob,
					signal,
				})
				const etag = { partNumber: result.partNumber, eTag: result.eTag }
				etags.push(etag)
				onPartUploaded(etag)
				uploadedBytes += part.blob.size
				const elapsedSeconds = Math.max((Date.now() - startTime) / 1000, 0.5)
				const speed = uploadedBytes / elapsedSeconds
				onProgress(uploadedBytes, file.size, speed)
			}
		})(),
	)
	await Promise.all(workers)
	return etags.sort((a, b) => a.partNumber - b.partNumber)
}

export function useFileUploadManager(options: UploadOptions) {
	const { bizType, catalogId, isPublic = false, onCompleted } = options
	const controllersRef = useRef<UploadControllerMap>(new Map())
	const fileMapRef = useRef<Map<string, File>>(new Map())

	const {
		addUploadTask,
		updateUploadProgress,
		setUploadStatus,
		setUploadId,
		setUploadFileId,
		addETag,
		removeUploadTask,
		setUploadWidgetExpanded,
	} = useUploadStore()
	const uploadTasks = useUploadStore((state) => state.uploadTasks)

	const getUploadErrorMessage = useCallback((error: unknown) => {
		if (error instanceof DOMException && error.name === "AbortError") {
			return "上传已暂停"
		}
		if (error instanceof Error) {
			return error.message || "上传失败"
		}
		if (typeof error === "string") return error
		return "上传失败，请稍后重试"
	}, [])

	const startUpload = useCallback(
		async (
			file: File,
			overrideCatalogId?: string | null,
			existingTask?: UploadTask,
			targetPath?: string | null,
		) => {
			const targetCatalogId = overrideCatalogId ?? catalogId
			const task = existingTask ?? createTask(file, targetCatalogId ?? null, targetPath ?? null)
			if (!existingTask) {
				addUploadTask(task)
			}
			setUploadStatus(task.id, "uploading")

			const controller = new AbortController()
			controllersRef.current.set(task.id, controller)

			const updateProgress = (uploadedBytes: number, totalBytes: number, speed: number) => {
				const progress = totalBytes === 0 ? 0 : Math.round((uploadedBytes / totalBytes) * 100)
				updateUploadProgress(task.id, progress, uploadedBytes, speed)
			}

			try {
				const uploadCatalogId = targetCatalogId ?? ""
				if (file.size <= CHUNK_SIZE) {
					const record = await fetchUploadFile(bizType, uploadCatalogId, file, controller.signal)
					updateProgress(file.size, file.size, file.size)
					setUploadFileId(task.id, record.id)
					setUploadStatus(task.id, "completed")
					onCompleted?.()
					return
				}

				// Check if we already have an uploadId (resuming)
				let currentUploadId = task.uploadId
				if (!currentUploadId) {
					const initResp = await fetchInitMultipartUpload(bizType, uploadCatalogId, {
						originalName: file.name,
						contentType: file.type || "application/octet-stream",
						public: isPublic,
					})
					currentUploadId = initResp.uploadId
					setUploadId(task.id, currentUploadId)
				}

				const etags = await uploadParts({
					file,
					uploadId: currentUploadId,
					existingEtags: task.etags || [],
					signal: controller.signal,
					onProgress: updateProgress,
					onPartUploaded: (etag) => addETag(task.id, etag),
				})

				const record = await fetchCompleteMultipartUpload(
					bizType,
					uploadCatalogId,
					currentUploadId,
					{ etags },
				)
				updateProgress(file.size, file.size, file.size)
				setUploadFileId(task.id, record.id)
				setUploadStatus(task.id, "completed")
				onCompleted?.()
			} catch (error) {
				if (controller.signal.aborted) {
					setUploadStatus(task.id, "paused")
					return
				}

				setUploadStatus(task.id, "failed", getUploadErrorMessage(error))
			} finally {
				controllersRef.current.delete(task.id)
			}
		},
		[
			addUploadTask,
			bizType,
			catalogId,
			isPublic,
			onCompleted,
			setUploadId,
			setUploadFileId,
			addETag,
			setUploadStatus,
			updateUploadProgress,
			getUploadErrorMessage,
		],
	)

	const processQueue = useCallback(() => {
		const state = useUploadStore.getState()
		const activeCount = state.uploadTasks.filter((task) => task.status === "uploading").length
		const availableSlots = Math.max(MAX_CONCURRENCY - activeCount, 0)
		if (availableSlots === 0) return

		const pendingTasks = state.uploadTasks.filter((task) => task.status === "pending")
		for (const task of pendingTasks.slice(0, availableSlots)) {
			const file = fileMapRef.current.get(task.id)
			if (!file) {
				state.setUploadStatus(task.id, "interrupted", "需要重新选择文件")
				continue
			}
			void startUpload(file, task.catalogId, task)
		}
	}, [startUpload])

	useEffect(() => {
		processQueue()
	}, [processQueue, uploadTasks])

	const startUploads = useCallback(
		(files: File[], targetCatalogId?: string | null, targetPath?: string | null) => {
			setUploadWidgetExpanded(true)
			files.forEach((file) => {
				const task = createTask(file, targetCatalogId ?? catalogId, targetPath ?? null)
				fileMapRef.current.set(task.id, file)
				addUploadTask(task)
			})
			processQueue()
		},
		[processQueue, catalogId, addUploadTask, setUploadWidgetExpanded],
	)

	const pauseUpload = useCallback(async (taskId: string) => {
		const controller = controllersRef.current.get(taskId)
		if (controller) {
			controller.abort()
			return
		}
		const state = useUploadStore.getState()
		state.setUploadStatus(taskId, "paused")
	}, [])

	const cancelUpload = useCallback(
		async (taskId: string, uploadId?: string) => {
			const controller = controllersRef.current.get(taskId)
			if (controller) {
				controller.abort()
			}
			if (uploadId) {
				await fetchAbortMultipartUpload(uploadId)
			}
			fileMapRef.current.delete(taskId)
			removeUploadTask(taskId)
			void processQueue()
		},
		[removeUploadTask, processQueue],
	)

	const resumeUpload = useCallback(
		async (taskId: string, file: File, _uploadId?: string, targetCatalogId?: string | null) => {
			const task = useUploadStore.getState().uploadTasks.find((t) => t.id === taskId)
			if (!task) return
			fileMapRef.current.set(taskId, file)
			useUploadStore.getState().setUploadStatus(taskId, "pending")
			processQueue()
		},
		[processQueue],
	)

	const retryUpload = useCallback(
		async (taskId: string) => {
			const task = useUploadStore.getState().uploadTasks.find((t) => t.id === taskId)
			if (!task) return false
			const file = fileMapRef.current.get(taskId)
			if (!file) return false
			useUploadStore.getState().setUploadStatus(taskId, "pending")
			processQueue()
			return true
		},
		[processQueue],
	)

	const pauseAllUploads = useCallback(() => {
		const state = useUploadStore.getState()
		state.uploadTasks.forEach((task) => {
			if (task.status === "uploading") {
				const controller = controllersRef.current.get(task.id)
				if (controller) controller.abort()
				return
			}
			if (task.status === "pending") {
				state.setUploadStatus(task.id, "paused")
			}
		})
	}, [])

	const resumeAllUploads = useCallback(() => {
		const state = useUploadStore.getState()
		let missingFileCount = 0
		state.uploadTasks.forEach((task) => {
			if (
				task.status !== "paused" &&
				task.status !== "failed" &&
				task.status !== "interrupted"
			) {
				return
			}
			const file = fileMapRef.current.get(task.id)
			if (!file) {
				missingFileCount += 1
				return
			}
			state.setUploadStatus(task.id, "pending")
		})
		processQueue()
		return missingFileCount
	}, [processQueue])

	const cancelAllUploads = useCallback(async () => {
		const state = useUploadStore.getState()
		const tasks = state.uploadTasks
		for (const task of tasks) {
			const controller = controllersRef.current.get(task.id)
			if (controller) {
				controller.abort()
			}
			if (task.uploadId) {
				await fetchAbortMultipartUpload(task.uploadId)
			}
			fileMapRef.current.delete(task.id)
		}
		state.uploadTasks.forEach((task) => state.removeUploadTask(task.id))
	}, [])

	return {
		startUploads,
		pauseUpload,
		cancelUpload,
		resumeUpload,
		retryUpload,
		pauseAllUploads,
		resumeAllUploads,
		cancelAllUploads,
	} as const
}
