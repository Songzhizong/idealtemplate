/**
 * Design Token System - Core Utilities
 * Simplified to use only shadcn/ui HSL variables
 */

import type { ColorPalette, ThemeMode, ThemePreset } from "@/types/theme"

/**
 * Convert RGB to HSL format for CSS variables
 */
function rgbToHSL(r: number, g: number, b: number): { h: number; s: number; l: number } {
	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	let h = 0
	let s = 0
	const l = (max + min) / 2

	if (max !== min) {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6
				break
			case g:
				h = ((b - r) / d + 2) / 6
				break
			case b:
				h = ((r - g) / d + 4) / 6
				break
		}
	}
	return { h, s, l }
}

/**
 * Format HSL values to shadcn string
 */
function formatHSL(h: number, s: number, l: number, a?: number): string {
	const hsl = `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
	if (a !== undefined && a < 1) {
		return `${hsl} / ${a}`
	}
	return hsl
}

/**
 * Convert hex color to HSL format for CSS variables
 */
export function hexToHSL(hex: string): string {
	if (!hex) return "0 0% 0%"

	// Handle rgba strings
	if (hex?.startsWith("rgba") || hex?.startsWith("rgb")) {
		const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
		if (match?.[1] && match?.[2] && match?.[3]) {
			const r = Number.parseInt(match[1], 10) / 255
			const g = Number.parseInt(match[2], 10) / 255
			const b = Number.parseInt(match[3], 10) / 255
			const a = match[4] !== undefined ? Number.parseFloat(match[4]) : 1

			const { h, s, l } = rgbToHSL(r, g, b)
			return formatHSL(h, s, l, a)
		}
	}

	let cleanHex = hex.replace(/^#/, "")

	// Handle 3-digit hex
	if (cleanHex.length === 3) {
		cleanHex = cleanHex
			.split("")
			.map((char) => char + char)
			.join("")
	}

	// Validate hex length
	if (cleanHex.length !== 6) {
		return "0 0% 0%"
	}

	const r = Number.parseInt(cleanHex.substring(0, 2), 16) / 255
	const g = Number.parseInt(cleanHex.substring(2, 4), 16) / 255
	const b = Number.parseInt(cleanHex.substring(4, 6), 16) / 255

	const { h, s, l } = rgbToHSL(r, g, b)
	return formatHSL(h, s, l)
}

/**
 * Flatten color palette to shadcn/ui HSL variables
 */
export function flattenColorPalette(palette: ColorPalette): Record<string, string> {
	const vars: Record<string, string> = {}

	// Core shadcn/ui variables
	vars["--primary"] = hexToHSL(palette.brand.primary.default)
	vars["--primary-foreground"] = hexToHSL(palette.brand.primary.fg)
	vars["--primary-hover"] = hexToHSL(palette.brand.primary.hover)
	vars["--primary-active"] = hexToHSL(palette.brand.primary.active)
	vars["--secondary"] = hexToHSL(palette.brand.secondary.default)
	vars["--secondary-foreground"] = hexToHSL(palette.brand.secondary.fg)
	vars["--destructive"] = hexToHSL(palette.destructive.default)
	vars["--destructive-foreground"] = hexToHSL(palette.destructive.fg)
	vars["--brand-text"] = hexToHSL(palette.brand.primary.fg)

	vars["--foreground"] = hexToHSL(palette.text.primary)
	vars["--background"] = hexToHSL(palette.background.canvas)

	vars["--card"] = hexToHSL(palette.background.container)
	vars["--card-foreground"] = hexToHSL(palette.text.primary)
	vars["--popover"] = hexToHSL(palette.background.elevated)
	vars["--popover-foreground"] = hexToHSL(palette.text.primary)

	vars["--muted"] = hexToHSL(palette.background.muted.default)
	vars["--muted-foreground"] = hexToHSL(palette.text.tertiary)
	vars["--accent"] = hexToHSL(palette.background.accent.default)
	vars["--accent-foreground"] = hexToHSL(palette.background.accent.fg)

	vars["--border"] = hexToHSL(palette.border.base)
	vars["--input"] = hexToHSL(palette.form.border)
	vars["--form-input"] = hexToHSL(palette.form.input)
	vars["--ring"] = hexToHSL(palette.form.ring)
	vars["--form-ring"] = hexToHSL(palette.form.ring)

	// Custom semantic variables for direct CSS use
	vars["--bg-container"] = hexToHSL(palette.background.container)
	vars["--border-base"] = hexToHSL(palette.border.base)
	vars["--text-primary"] = hexToHSL(palette.text.primary)
	vars["--text-secondary"] = hexToHSL(palette.text.secondary)

	// Sidebar variables
	vars["--sidebar-background"] = hexToHSL(palette.component.sidebar.bg)
	vars["--sidebar-foreground"] = hexToHSL(palette.component.sidebar.fg)
	vars["--sidebar-primary"] = hexToHSL(palette.brand.primary.default)
	vars["--sidebar-primary-foreground"] = hexToHSL(palette.brand.primary.fg)
	vars["--sidebar-accent"] = hexToHSL(palette.component.sidebar.accent)
	vars["--sidebar-accent-foreground"] = hexToHSL(palette.component.sidebar.onAccent)
	vars["--sidebar-border"] = hexToHSL(palette.component.sidebar.border)
	vars["--sidebar-ring"] = hexToHSL(palette.form.ring)

	// Extended semantic colors
	vars["--success"] = hexToHSL(palette.status.success.default)
	vars["--success-foreground"] = hexToHSL(palette.status.success.fg)
	vars["--warning"] = hexToHSL(palette.status.warning.default)
	vars["--warning-foreground"] = hexToHSL(palette.status.warning.fg)
	vars["--error"] = hexToHSL(palette.status.error.default)
	vars["--error-foreground"] = hexToHSL(palette.status.error.fg)
	vars["--info"] = hexToHSL(palette.status.info.default)
	vars["--info-foreground"] = hexToHSL(palette.status.info.fg)

	// Table component colors
	vars["--table-header-bg"] = hexToHSL(palette.component.table.headerBg)
	vars["--table-row-hover"] = hexToHSL(palette.component.table.rowHover)
	vars["--table-row-striped"] = hexToHSL(palette.component.table.rowStriped)
	vars["--table-border"] = hexToHSL(palette.component.table.border)

	return vars
}

/**
 * Apply theme to DOM by injecting CSS variables
 */
export function updateThemeVariables(preset: ThemePreset, mode: ThemeMode): void {
	const palette = preset.schemes[mode]
	const cssVars = flattenColorPalette(palette)

	const root = document.documentElement

	// Apply all CSS variables
	for (const [key, value] of Object.entries(cssVars)) {
		root.style.setProperty(key, value)
	}

	// Update data attribute for mode-specific styling
	root.setAttribute("data-theme", mode)
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): ThemeMode {
	if (typeof window === "undefined") return "light"
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/**
 * Resolve effective theme mode (handles "system" option)
 */
export function resolveThemeMode(configMode: "light" | "dark" | "system"): ThemeMode {
	if (configMode === "system") {
		return getSystemTheme()
	}
	return configMode
}
