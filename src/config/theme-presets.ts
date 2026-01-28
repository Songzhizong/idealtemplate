/**
 * Design Token System - Theme Presets
 * Pre-configured color schemes for light and dark modes
 */

import type { ThemePreset, ThemeConfig } from "@/types/theme"
import { crimsonFlame } from "./presets/crimson-flame"
import { emeraldGreen } from "./presets/emerald-green"
import { coreBlue } from "./presets/core-blue"
import { wisdomPurple } from "@/config/presets/wisdom-purple.ts";

export const themePresets: ThemePreset[] = [
  coreBlue,
  crimsonFlame,
  emeraldGreen,
  wisdomPurple,
]

export const defaultThemeSettings: ThemeConfig = {
  "mode": "system",
  "activePreset": "core-blue",
  "fontFamily": "inter",
  "layout": {
    "menuLayout": "single",
    "containerWidth": "fixed",
    "sidebarWidth": 260,
    "sidebarCollapsedWidth": 64,
    "headerHeight": 64
  },
  "ui": {
    "showBreadcrumb": true,
    "showBreadcrumbIcon": true,
    "pageAnimation": "slide-left",
    "borderRadius": 12
  }
}
