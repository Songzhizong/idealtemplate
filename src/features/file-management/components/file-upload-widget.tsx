"use client"

import {
	ChevronDown,
	ChevronUp,
	Clock,
	File,
	FileArchive,
	FileAudio,
	FileCode,
	FileImage,
	FileText,
	FileVideo,
	FolderOpen,
	Pause,
	Play,
	RefreshCcw,
	Trash2,
	Upload,
	X,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { type UploadTask, useUploadStore } from "../store/upload-store"
import { formatDuration, formatFileSize, formatSpeed } from "../utils/file-utils"

interface FileUploadWidgetProps {
	onPause: (taskId: string) => void
	onCancel: (taskId: string, uploadId?: string) => void
	onResume: (taskId: string, file: File, uploadId?: string, catalogId?: string | null) => void
	onRetry: (taskId: string) => Promise<boolean> | boolean
	onPauseAll: () => void
	onResumeAll: () => number
	onCancelAll: () => void
	onLocate: (task: UploadTask) => void
}

const AUTO_CLEAR_KEY = "file-manager-upload-auto-cleanup"
const AUTO_CLEAR_THRESHOLD = 24 * 60 * 60 * 1000
const AUTO_CLEAR_INTERVAL = 5 * 60 * 1000

type FileIconMeta = {
	Icon: typeof File
	colorClass: string
	extensionLabel: string | null
}

function getFileExtension(fileName: string) {
	const segments = fileName.split(".")
	if (segments.length <= 1) return ""
	return segments[segments.length - 1]?.toLowerCase() ?? ""
}

function getFileIconMeta(fileName: string): FileIconMeta {
	const ext = getFileExtension(fileName)
	const docExts = ["pdf", "doc", "docx", "txt", "rtf", "md"]
	const archiveExts = ["zip", "rar", "7z", "iso", "tar", "gz"]
	const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg"]
	const videoExts = ["mp4", "mkv", "mov", "avi", "webm"]
	const audioExts = ["mp3", "wav", "flac", "aac", "ogg"]
	const codeExts = ["json", "js", "ts", "tsx", "jsx", "html", "css", "py", "go", "java", "c", "cpp"]

	if (docExts.includes(ext)) {
		return { Icon: FileText, colorClass: "text-info", extensionLabel: null }
	}
	if (archiveExts.includes(ext)) {
		return { Icon: FileArchive, colorClass: "text-warning", extensionLabel: null }
	}
	if (imageExts.includes(ext)) {
		return { Icon: FileImage, colorClass: "text-success", extensionLabel: null }
	}
	if (videoExts.includes(ext)) {
		return { Icon: FileVideo, colorClass: "text-primary", extensionLabel: null }
	}
	if (audioExts.includes(ext)) {
		return { Icon: FileAudio, colorClass: "text-accent-foreground", extensionLabel: null }
	}
	if (codeExts.includes(ext)) {
		return { Icon: FileCode, colorClass: "text-foreground", extensionLabel: null }
	}
	return {
		Icon: File,
		colorClass: "text-muted-foreground",
		extensionLabel: ext ? ext.slice(0, 4).toUpperCase() : null,
	}
}

function UploadTaskItem({
	task,
	onPause,
	onResume,
	onCancel,
	onRetry,
	onLocate,
}: {
	task: UploadTask
	onPause: () => void
	onResume: () => void
	onCancel: () => void
	onRetry: () => void
	onLocate: () => void
}) {
	const showEta = task.status === "uploading" && task.speed && task.speed > 0
	const eta =
		showEta && task.speed ? formatDuration((task.fileSize - task.uploadedBytes) / task.speed) : null
	const fileIconMeta = getFileIconMeta(task.fileName)
	const errorMessage =
		task.errorMessage ??
		(task.status === "interrupted"
			? "需要重新选择文件"
			: task.status === "failed"
				? "上传失败"
				: null)

	const statusText = (() => {
		switch (task.status) {
			case "completed":
				return "上传完成"
			case "failed":
				return task.errorMessage ?? "上传失败"
			case "paused":
				return "已暂停"
			case "interrupted":
				return "中断，需恢复"
			case "pending":
				return "排队中"
			default:
				return "上传中..."
		}
	})()

	return (
		<div className="border-b border-border/50 px-4 py-3 last:border-b-0">
			<div className="flex items-center gap-3">
				<div className="relative flex size-8 items-center justify-center rounded-full bg-muted/60">
					<div
						className={cn(
							"absolute inset-0 rounded-full border-2",
							task.status === "uploading"
								? "animate-spin border-primary border-t-transparent"
								: task.status === "failed"
									? "border-destructive"
									: "border-muted-foreground/60",
						)}
					/>
					{task.status === "failed" && (
						<fileIconMeta.Icon className="size-4 text-destructive" />
					)}
					{task.status === "completed" && (
						<fileIconMeta.Icon className="size-4 text-primary" />
					)}
					{task.status !== "failed" && task.status !== "completed" && (
						<fileIconMeta.Icon
							className={cn(
								"size-4",
								task.status === "uploading" ? fileIconMeta.colorClass : "text-muted-foreground",
							)}
						/>
					)}
					{fileIconMeta.extensionLabel && (
						<span className="absolute -bottom-1 -right-1 rounded-sm bg-background/80 px-0.5 text-[8px] text-muted-foreground">
							{fileIconMeta.extensionLabel}
						</span>
					)}
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium" title={task.fileName}>
						{task.fileName}
					</p>
					<p className="text-[11px] text-muted-foreground">
						上传至：{task.targetPath ?? "/"}
					</p>
					<p className="text-xs text-muted-foreground">
						{task.status === "uploading" && (
							<>
								<span>{task.progress}%</span>
								<span className="mx-1">•</span>
								<span>
									{formatFileSize(task.uploadedBytes)} / {formatFileSize(task.fileSize)}
								</span>
								<span className="mx-1">•</span>
								<span className={task.speed ? "text-primary" : "text-muted-foreground"}>
									{task.speed ? formatSpeed(task.speed) : "计算中"}
								</span>
								{eta && (
									<>
										<span className="mx-1">•</span>
										<span className="text-primary">预计 {eta}</span>
									</>
								)}
							</>
						)}
						{task.status === "completed" && (
							<>
								<span>{formatFileSize(task.fileSize)}</span>
								<span className="mx-1">•</span>
								<span>{statusText}</span>
							</>
						)}
						{task.status === "paused" && (
							<>
								<span>{task.progress}%</span>
								<span className="mx-1">•</span>
								<span>
									{formatFileSize(task.uploadedBytes)} / {formatFileSize(task.fileSize)}
								</span>
								<span className="mx-1">•</span>
								<span>{statusText}</span>
							</>
						)}
						{task.status === "pending" && (
							<>
								<span>{formatFileSize(task.fileSize)}</span>
								<span className="mx-1">•</span>
								<span>{statusText}</span>
							</>
						)}
						{task.status === "failed" && <span>{statusText}</span>}
						{task.status === "interrupted" && <span>{statusText}</span>}
					</p>
					{(task.status === "failed" || task.status === "interrupted") && errorMessage && (
						<p className="mt-1 text-xs text-destructive">原因：{errorMessage}</p>
					)}
				</div>

				<div className="flex items-center gap-1">
					{task.status === "completed" && task.fileId && (
						<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onLocate}>
							<FolderOpen className="size-3.5" />
						</Button>
					)}
					{task.status === "uploading" && (
						<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPause}>
							<Pause className="size-3.5" />
						</Button>
					)}
					{task.status === "failed" && (
						<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRetry}>
							<RefreshCcw className="size-3.5" />
						</Button>
					)}
					{(task.status === "paused" || task.status === "interrupted") && (
						<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onResume}>
							<Play className="size-3.5" />
						</Button>
					)}
					{task.status !== "completed" && (
						<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
							<X className="size-3.5" />
						</Button>
					)}
				</div>
			</div>

			{(task.status === "uploading" || task.status === "paused") && (
				<div className="ml-11 mt-2">
					<Progress value={task.progress} className="h-1" />
				</div>
			)}
		</div>
	)
}

export function FileUploadWidget({
	onPause,
	onCancel,
	onResume,
	onRetry,
	onPauseAll,
	onResumeAll,
	onCancelAll,
	onLocate,
}: FileUploadWidgetProps) {
	const {
		uploadTasks,
		isUploadWidgetExpanded,
		toggleUploadWidget,
		clearCompletedTasks,
		removeCompletedTasksOlderThan,
		setUploadWidgetExpanded,
	} = useUploadStore()
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const [resumeTarget, setResumeTarget] = useState<UploadTask | null>(null)
	const [activeTab, setActiveTab] = useState<"all" | "active" | "error">("all")
	const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(true)
	const [cancelAllOpen, setCancelAllOpen] = useState(false)
	const collapseTimerRef = useRef<number | null>(null)
	const AUTO_COLLAPSE_DELAY = 4000

	const activeUploads = uploadTasks.filter(
		(task) => task.status === "uploading" || task.status === "pending",
	)
	const completedUploads = uploadTasks.filter((task) => task.status === "completed")
	const finishedUploads = uploadTasks.filter(
		(task) => task.status === "completed" || task.status === "failed",
	)
	const interruptedUploads = uploadTasks.filter((task) => task.status === "interrupted")
	const failedUploads = uploadTasks.filter((task) => task.status === "failed")
	const canPauseAll = activeUploads.length > 0
	const canResumeAll = uploadTasks.some(
		(task) =>
			task.status === "paused" || task.status === "failed" || task.status === "interrupted",
	)
	const canClearCompleted = completedUploads.length > 0
	const canCancelAll = activeUploads.length > 0
	const recoveryLabel =
		interruptedUploads.length > 0 && failedUploads.length === 0 ? "一键恢复" : "全部重试"
	const totalProgress =
		activeUploads.length > 0
			? Math.round(
					activeUploads.reduce((acc, task) => acc + task.progress, 0) / activeUploads.length,
				)
			: 100

	const tasksByTab = useMemo(() => {
		if (activeTab === "active") {
			return uploadTasks.filter(
				(task) =>
					task.status === "uploading" || task.status === "pending" || task.status === "paused",
			)
		}
		if (activeTab === "error") {
			return uploadTasks.filter((task) => task.status === "failed" || task.status === "interrupted")
		}
		return uploadTasks
	}, [activeTab, uploadTasks])

	useEffect(() => {
		const stored = window.localStorage.getItem(AUTO_CLEAR_KEY)
		if (stored === null) return
		setAutoCleanupEnabled(stored === "true")
	}, [])

	useEffect(() => {
		window.localStorage.setItem(AUTO_CLEAR_KEY, String(autoCleanupEnabled))
	}, [autoCleanupEnabled])

	useEffect(() => {
		if (activeUploads.length === 0 && uploadTasks.length > 0) {
			if (collapseTimerRef.current) window.clearTimeout(collapseTimerRef.current)
			collapseTimerRef.current = window.setTimeout(() => {
				setUploadWidgetExpanded(false)
			}, AUTO_COLLAPSE_DELAY)
			return
		}
		if (collapseTimerRef.current) window.clearTimeout(collapseTimerRef.current)
	}, [activeUploads.length, uploadTasks.length, setUploadWidgetExpanded])

	useEffect(() => {
		if (!autoCleanupEnabled) return
		const cleanup = () => {
			removeCompletedTasksOlderThan(Date.now() - AUTO_CLEAR_THRESHOLD)
		}
		cleanup()
		const timer = window.setInterval(cleanup, AUTO_CLEAR_INTERVAL)
		return () => window.clearInterval(timer)
	}, [autoCleanupEnabled, removeCompletedTasksOlderThan])

	if (uploadTasks.length === 0) return null

	return (
		<div className="fixed bottom-6 right-6 z-50">
			<input
				ref={fileInputRef}
				type="file"
				className="hidden"
				onChange={(event) => {
					const file = event.target.files?.[0]
					if (!file || !resumeTarget) return
					if (file.name !== resumeTarget.fileName || file.size !== resumeTarget.fileSize) {
						toast.error("文件不匹配，请选择原始文件")
						event.target.value = ""
						return
					}
					onResume(resumeTarget.id, file, resumeTarget.uploadId, resumeTarget.catalogId)
					setResumeTarget(null)
					event.target.value = ""
				}}
			/>
			<div
				className={cn(
					"overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg",
					isUploadWidgetExpanded ? "w-[520px]" : "w-[360px]",
				)}
			>
				{/** biome-ignore lint/a11y/useSemanticElements: 不这么用报错 */}
				<div
					role="button"
					tabIndex={0}
					onClick={toggleUploadWidget}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault()
							toggleUploadWidget()
						}
					}}
					className="flex w-full cursor-pointer items-center justify-between bg-muted/40 px-4 py-3 text-left outline-none transition-colors hover:bg-muted/60"
				>
					<div className="flex items-center gap-3">
						<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
							<Upload className="size-4" />
						</div>
						<div>
							<p className="text-sm font-medium">
								{activeUploads.length > 0
									? `${activeUploads.length} 个任务进行中`
									: `${finishedUploads.length} 个任务已结束`}
							</p>
							{activeUploads.length > 0 && (
								<p className="text-xs text-muted-foreground">{totalProgress}%</p>
							)}
						</div>
					</div>
					<div className="flex items-center gap-1">
						{isUploadWidgetExpanded ? (
							<ChevronDown className="size-4" />
						) : (
							<ChevronUp className="size-4" />
						)}
					</div>
				</div>

				{activeUploads.length > 0 && <Progress value={totalProgress} className="h-px rounded-none" />}

				{isUploadWidgetExpanded && (
					<div>
						<div className="px-4 pb-2 pt-3">
							<div className="flex items-center gap-2">
								<Tabs
									value={activeTab}
									onValueChange={(value) => setActiveTab(value as typeof activeTab)}
									className="flex-1"
								>
									<TabsList className="grid w-full grid-cols-3">
										<TabsTrigger value="all">全部 {uploadTasks.length}</TabsTrigger>
										<TabsTrigger value="active">
											上传中 {activeUploads.length}
										</TabsTrigger>
										<TabsTrigger value="error">
											失败/中断 {failedUploads.length + interruptedUploads.length}
										</TabsTrigger>
									</TabsList>
								</Tabs>
								<TooltipProvider>
									<div className="flex items-center gap-1">
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7"
													disabled={!canPauseAll}
													onClick={onPauseAll}
												>
													<Pause className="size-3.5" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>全部暂停</TooltipContent>
										</Tooltip>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7"
													disabled={!canResumeAll}
													onClick={() => {
														const missing = onResumeAll()
														if (missing > 0) {
															toast.info("部分任务需要重新选择文件后才能恢复")
														}
													}}
												>
													<Play className="size-3.5" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>全部开始</TooltipContent>
										</Tooltip>
										{(failedUploads.length > 0 || interruptedUploads.length > 0) && (
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() => {
															const missing = onResumeAll()
															if (missing > 0) {
																toast.info("部分任务需要重新选择文件后才能恢复")
															}
														}}
													>
														<RefreshCcw className="size-3.5" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>{recoveryLabel}</TooltipContent>
											</Tooltip>
										)}
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7"
													disabled={!canCancelAll}
													onClick={() => {
														if (!canCancelAll) return
														if (activeUploads.length > 0) {
															setCancelAllOpen(true)
															return
														}
														onCancelAll()
													}}
												>
													<X className="size-3.5" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>取消全部</TooltipContent>
										</Tooltip>
										{canClearCompleted && (
											<Tooltip>
												<TooltipTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={clearCompletedTasks}
													>
														<Trash2 className="size-3.5" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>清空已完成</TooltipContent>
											</Tooltip>
										)}
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className={cn("h-7 w-7", autoCleanupEnabled && "text-primary")}
													onClick={() => setAutoCleanupEnabled((prev) => !prev)}
												>
													<Clock className="size-3.5" />
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												{autoCleanupEnabled
													? "已开启自动清理（24 小时）"
													: "开启自动清理（24 小时）"}
											</TooltipContent>
										</Tooltip>
									</div>
								</TooltipProvider>
							</div>
						</div>
						<div className="max-h-80 overflow-y-auto">
							{tasksByTab.map((task) => (
								<UploadTaskItem
									key={task.id}
									task={task}
									onPause={() => onPause(task.id)}
									onRetry={async () => {
										const ok = await onRetry(task.id)
										if (!ok) {
											setResumeTarget(task)
											fileInputRef.current?.click()
										}
									}}
									onResume={() => {
										setResumeTarget(task)
										fileInputRef.current?.click()
									}}
									onCancel={() => onCancel(task.id, task.uploadId)}
									onLocate={() => onLocate(task)}
								/>
							))}
						</div>
					</div>
				)}
			</div>
			<AlertDialog open={cancelAllOpen} onOpenChange={setCancelAllOpen}>
				<AlertDialogContent size="sm">
					<AlertDialogHeader>
						<AlertDialogTitle>确认取消并清空？</AlertDialogTitle>
						<AlertDialogDescription>
							当前有 {activeUploads.length} 个任务正在上传，确定要取消上传并清空记录吗？
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>继续上传</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => {
								onCancelAll()
								setCancelAllOpen(false)
							}}
						>
							确定取消并清空
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
