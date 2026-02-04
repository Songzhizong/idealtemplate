"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UploadStatus =
	| "pending"
	| "uploading"
	| "paused"
	| "completed"
	| "failed"
	| "interrupted"

export interface UploadTask {
	id: string
	uploadId?: string
	fileHash?: string
	distinctId?: string
	fileId?: string
	fileName: string
	fileSize: number
	uploadedBytes: number
	progress: number
	status: UploadStatus
	speed: number | null
	catalogId: string | null
	targetPath: string | null
	createdTime: number
	finishedTime: number | null
	errorMessage: string | null
	etags: { partNumber: number; eTag: string }[]
}

interface UploadStoreState {
	uploadTasks: UploadTask[]
	isUploadWidgetExpanded: boolean
	addUploadTask: (task: UploadTask) => void
	updateUploadProgress: (
		id: string,
		progress: number,
		uploadedBytes: number,
		speed?: number,
	) => void
	setUploadStatus: (id: string, status: UploadStatus, errorMessage?: string) => void
	setUploadId: (id: string, uploadId: string) => void
	setUploadFileId: (id: string, fileId: string) => void
	addETag: (id: string, etag: { partNumber: number; eTag: string }) => void
	removeUploadTask: (id: string) => void
	clearCompletedTasks: () => void
	removeCompletedTasksOlderThan: (timestamp: number) => void
	toggleUploadWidget: () => void
	setUploadWidgetExpanded: (expanded: boolean) => void
}

export const useUploadStore = create<UploadStoreState>()(
	persist(
		(set) => ({
			uploadTasks: [],
			isUploadWidgetExpanded: true,
			addUploadTask: (task) =>
				set((state) => ({
					uploadTasks: [...state.uploadTasks, task],
				})),
			updateUploadProgress: (id, progress, uploadedBytes, speed) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.map((task) =>
						task.id === id
							? {
									...task,
									progress,
									uploadedBytes,
									speed: speed ?? null,
								}
							: task,
					),
				})),
			setUploadStatus: (id, status, errorMessage) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.map((task) =>
						task.id === id
							? {
									...task,
									status,
									errorMessage: errorMessage ?? null,
									finishedTime:
										status === "completed" || status === "failed" ? Date.now() : null,
								}
							: task,
					),
				})),
			setUploadId: (id, uploadId) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.map((task) =>
						task.id === id ? { ...task, uploadId, etags: task.etags || [] } : task,
					),
				})),
			setUploadFileId: (id, fileId) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.map((task) =>
						task.id === id ? { ...task, fileId } : task,
					),
				})),
			addETag: (id, etag) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.map((task) =>
						task.id === id ? { ...task, etags: [...(task.etags || []), etag] } : task,
					),
				})),
			removeUploadTask: (id) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.filter((task) => task.id !== id),
				})),
			clearCompletedTasks: () =>
				set((state) => ({
					uploadTasks: state.uploadTasks.filter((task) => task.status !== "completed"),
				})),
			removeCompletedTasksOlderThan: (timestamp) =>
				set((state) => ({
					uploadTasks: state.uploadTasks.filter((task) => {
						if (task.status !== "completed") return true
						if (!task.finishedTime) return true
						return task.finishedTime > timestamp
					}),
				})),
			toggleUploadWidget: () =>
				set((state) => ({
					isUploadWidgetExpanded: !state.isUploadWidgetExpanded,
				})),
			setUploadWidgetExpanded: (expanded) =>
				set(() => ({
					isUploadWidgetExpanded: expanded,
				})),
		}),
		{
			name: "file-manager-upload",
			partialize: (state) => ({
				uploadTasks: state.uploadTasks,
				isUploadWidgetExpanded: state.isUploadWidgetExpanded,
			}),
			onRehydrateStorage: () => (state) => {
				if (!state) return
				state.uploadTasks = state.uploadTasks.map((task) => {
					const nextTask = {
						...task,
						targetPath: task.targetPath ?? "/",
					}
					if (
						nextTask.status === "uploading" ||
						nextTask.status === "pending" ||
						nextTask.status === "paused"
					) {
						return { ...nextTask, status: "interrupted" }
					}
					return nextTask
				})
			},
		},
	),
)
