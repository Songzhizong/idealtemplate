import type React from "react"
import { useMemo } from "react"
import { useThemeStore } from "@/hooks/use-theme-store"

/**
 * 简单的 Hash 算法，为字符串生成固定的索引
 */
export function getHashIndex(str: string, length: number): number {
	let hash = 0
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash)
	}
	return Math.abs(hash) % (length || 1)
}

export type ColorVariant = "soft" | "solid" | "outline"

interface ColorHashOptions {
	variant?: ColorVariant
	bgOpacity?: number // 0-1
	borderOpacity?: number // 0-1
}

/**
 * 基于字符串生成稳定颜色样式的 Hook
 */
export function useColorHash(str: string, options: ColorHashOptions = {}) {
	const { variant = "soft", bgOpacity, borderOpacity } = options
	const { getActivePreset, getEffectiveMode } = useThemeStore()
	const preset = getActivePreset()
	const mode = getEffectiveMode()

	const categoricalColors = preset?.schemes[mode]?.charts?.categorical || []

	return useMemo(() => {
		const colorIndex = getHashIndex(str, categoricalColors.length)
		const fallbackColor = "hsl(var(--muted-foreground))"
		const baseColor = categoricalColors[colorIndex] || fallbackColor

		// 默认透明度设置
		const isDark = mode === "dark"
		const defaultBgOpacity =
			variant === "soft" ? (isDark ? 0.15 : 0.1) : variant === "solid" ? 1 : 0
		const defaultBorderOpacity =
			variant === "outline" ? 1 : variant === "soft" ? (isDark ? 0.3 : 0.2) : 0

		const finalBgOpacity = bgOpacity ?? defaultBgOpacity
		const finalBorderOpacity = borderOpacity ?? defaultBorderOpacity

		// 转换为十六进制透明度后缀
		const toHexOpacity = (opacity: number) => {
			const hex = Math.round(opacity * 255).toString(16)
			return hex.padStart(2, "0")
		}

		const bgOpacityHex = toHexOpacity(finalBgOpacity)
		const borderOpacityHex = toHexOpacity(finalBorderOpacity)

		const style: React.CSSProperties = {
			color: variant === "solid" ? "hsl(var(--primary-foreground))" : baseColor,
			backgroundColor: variant === "solid" ? baseColor : `${baseColor}${bgOpacityHex}`,
			borderColor: `${baseColor}${borderOpacityHex}`,
		}

		return {
			baseColor,
			style,
		}
	}, [str, categoricalColors, variant, bgOpacity, borderOpacity, mode])
}
