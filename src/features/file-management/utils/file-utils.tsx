"use client"

import {
	Archive,
	File,
	FileCode,
	FileImage,
	FileSpreadsheet,
	FileText,
	Film,
	Music,
	Presentation,
} from "lucide-react"
import type { ReactNode } from "react"

export function formatFileSize(bytes: number) {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
	const units = ["B", "KB", "MB", "GB", "TB"]
	let size = bytes
	let unitIndex = 0
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024
		unitIndex += 1
	}
	return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export function formatSpeed(bytesPerSecond: number) {
	return `${formatFileSize(bytesPerSecond)}/s`
}

export function formatDuration(totalSeconds: number) {
	if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "即将完成"
	const seconds = Math.ceil(totalSeconds)
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const remaining = seconds % 60
	if (hours > 0) return `${hours}h ${minutes}m`
	if (minutes > 0) return `${minutes}m ${remaining}s`
	return `${remaining}s`
}

export function parseObjectSize(value: string | null | undefined) {
	if (!value) return 0
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : 0
}

export function isImageType(contentType: string) {
	return contentType.startsWith("image/")
}

export function isVideoType(contentType: string) {
	return contentType.startsWith("video/")
}

export function isAudioType(contentType: string) {
	return contentType.startsWith("audio/")
}

export function isPdfType(contentType: string) {
	return contentType === "application/pdf"
}

export function isOfficeType(contentType: string) {
	return (
		contentType.includes("officedocument") ||
		contentType.includes("msword") ||
		contentType.includes("excel") ||
		contentType.includes("powerpoint")
	)
}

export type FileStyle = {
	bgColor: string
	iconColor: string
	icon: ReactNode
}

export function getFileStyle(fileName: string, contentType: string, size?: "sm" | "md"): FileStyle {
	const ext = fileName.split(".").pop()?.toLowerCase() || ""
	const iconSize = size === "sm" ? "size-4" : "size-7"

	// PDF
	if (ext === "pdf" || isPdfType(contentType)) {
		return {
			bgColor: "bg-red-500/10",
			iconColor: "text-red-500",
			icon: <FileText className={iconSize} />,
		}
	}

	// Spreadsheet / Excel
	if (
		["xlsx", "xls", "csv"].includes(ext) ||
		contentType.includes("spreadsheet") ||
		contentType.includes("excel")
	) {
		return {
			bgColor: "bg-blue-500/10",
			iconColor: "text-blue-500",
			icon: <FileSpreadsheet className={iconSize} />,
		}
	}

	// Word / Document
	if (
		["docx", "doc"].includes(ext) ||
		contentType.includes("officedocument.wordprocessingml") ||
		contentType.includes("msword")
	) {
		return {
			bgColor: "bg-blue-500/10",
			iconColor: "text-blue-500",
			icon: <FileText className={iconSize} />,
		}
	}

	// Presentation / PPT
	if (
		["pptx", "ppt"].includes(ext) ||
		contentType.includes("officedocument.presentationml") ||
		contentType.includes("powerpoint")
	) {
		return {
			bgColor: "bg-blue-500/10",
			iconColor: "text-blue-500",
			icon: <Presentation className={iconSize} />,
		}
	}

	// Video
	if (isVideoType(contentType) || ["mp4", "avi", "mov", "mkv", "wmv"].includes(ext)) {
		return {
			bgColor: "bg-violet-500/10",
			iconColor: "text-violet-500",
			icon: <Film className={iconSize} />,
		}
	}

	// Audio
	if (isAudioType(contentType) || ["mp3", "wav", "flac", "aac", "ogg"].includes(ext)) {
		return {
			bgColor: "bg-green-500/10",
			iconColor: "text-green-500",
			icon: <Music className={iconSize} />,
		}
	}

	// Archive
	if (
		["zip", "rar", "7z", "tar", "gz"].includes(ext) ||
		contentType.includes("zip") ||
		contentType.includes("rar") ||
		contentType.includes("7z")
	) {
		return {
			bgColor: "bg-yellow-500/10",
			iconColor: "text-yellow-500",
			icon: <Archive className={iconSize} />,
		}
	}

	// Image
	if (isImageType(contentType) || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
		return {
			bgColor: "bg-pink-500/10",
			iconColor: "text-pink-500",
			icon: <FileImage className={iconSize} />,
		}
	}

	// Code / Config
	if (
		[
			"json",
			"js",
			"ts",
			"tsx",
			"jsx",
			"html",
			"css",
			"py",
			"go",
			"java",
			"c",
			"cpp",
			"md",
		].includes(ext) ||
		contentType.includes("text/")
	) {
		return {
			bgColor: "bg-slate-500/10",
			iconColor: "text-slate-500",
			icon: <FileCode className={iconSize} />,
		}
	}

	// Default
	return {
		bgColor: "bg-primary/10",
		iconColor: "text-primary",
		icon: <File className={iconSize} />,
	}
}

export function getFileIcon(contentType: string): ReactNode {
	const style = getFileStyle("", contentType, "sm")
	return <span className={style.iconColor}>{style.icon}</span>
}
