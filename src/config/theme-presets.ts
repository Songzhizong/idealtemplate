/**
 * Design Token System - Theme Presets
 * Pre-configured color schemes for light and dark modes
 */

import type { ThemePreset } from "@/types/theme"

export const themePresets: ThemePreset[] = [
  {
    key: "sky-blue",
    name: "天空蓝",
    description: "优化后的现代化蓝色主题，更具呼吸感与专业度",
    schemes: {
      light: {
        brand: {
          primary: "#3b82f6",
          primaryHover: "#2563eb",
          primaryActive: "#1d4ed8",
          primaryBg: "#eff6ff",
          text: "#ffffff"
        },
        functional: {
          success: "#10b981",
          successBg: "#ecfdf5",
          warning: "#f59e0b",
          warningBg: "#fffbeb",
          error: "#ef4444",
          errorBg: "#fef2f2",
          info: "#0ea5e9",
          infoBg: "#f0f9ff"
        },
        text: {
          primary: "#1e293b",
          secondary: "#475569",
          tertiary: "#94a3b8",
          inverse: "#ffffff",
          link: "#3b82f6",
          linkHover: "#2563eb"
        },
        background: {
          canvas: "#f1f5f9",
          container: "#ffffff",
          elevated: "#ffffff",
          layout: "#f8fafc",
          hover: "#f1f5f9",
          active: "#eff6ff"
        },
        border: {
          base: "#e2e8f0",
          strong: "#cbd5e1",
          subtle: "#f1f5f9"
        },
        shadow: {
          sm: "0 1px 2px 0 rgba(59, 130, 246, 0.05)",
          md: "0 4px 6px -1px rgba(59, 130, 246, 0.1)",
          lg: "0 10px 15px -3px rgba(59, 130, 246, 0.1)"
        }
      },
      dark: {
        brand: {
          primary: "#60a5fa",
          primaryHover: "#93c5fd",
          primaryActive: "#3b82f6",
          primaryBg: "#172554",
          text: "#ffffff"
        },
        functional: {
          success: "#34d399",
          successBg: "#064e3b",
          warning: "#fbbf24",
          warningBg: "#451a03",
          error: "#f87171",
          errorBg: "#450a0a",
          info: "#38bdf8",
          infoBg: "#082f49"
        },
        text: {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
          tertiary: "#64748b",
          inverse: "#0f172a",
          link: "#60a5fa",
          linkHover: "#93c5fd"
        },
        background: {
          canvas: "#0f172a",
          container: "#1e293b",
          elevated: "#1e293b",
          layout: "#020617",
          hover: "#334155",
          active: "#1e3a8a"
        },
        border: {
          base: "#334155",
          strong: "#475569",
          subtle: "#1e293b"
        },
        shadow: {
          sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
          md: "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
          lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
        }
      }
    }
  },
  {
    key: "deep-blue",
    name: "深邃蓝",
    description: "沉稳内敛的深蓝色调，专为高密度数据与企业级管理系统打造，强调权威与清晰。",
    schemes: {
      light: {
        brand: {
          primary: "#1d4ed8",
          primaryHover: "#1e40af",
          primaryActive: "#172554",
          primaryBg: "#eff6ff",
          text: "#ffffff"
        },
        functional: {
          success: "#059669",
          successBg: "#ecfdf5",
          warning: "#d97706",
          warningBg: "#fffbeb",
          error: "#dc2626",
          errorBg: "#fef2f2",
          info: "#0284c7",
          infoBg: "#f0f9ff"
        },
        text: {
          primary: "#0f172a",
          secondary: "#334155",
          tertiary: "#64748b",
          inverse: "#ffffff",
          link: "#1d4ed8",
          linkHover: "#1e40af"
        },
        background: {
          canvas: "#f8fafc",
          container: "#ffffff",
          elevated: "#ffffff",
          layout: "#f1f5f9",
          hover: "#f1f5f9",
          active: "#e2e8f0"
        },
        border: {
          base: "#e2e8f0",
          strong: "#94a3b8",
          subtle: "#f1f5f9"
        },
        shadow: {
          sm: "0 1px 2px 0 rgba(29, 78, 216, 0.05)",
          md: "0 4px 6px -1px rgba(29, 78, 216, 0.08)",
          lg: "0 10px 15px -3px rgba(29, 78, 216, 0.08)"
        }
      },
      dark: {
        brand: {
          primary: "#3b82f6",
          primaryHover: "#60a5fa",
          primaryActive: "#2563eb",
          primaryBg: "#172554",
          text: "#ffffff"
        },
        functional: {
          success: "#34d399",
          successBg: "#064e3b",
          warning: "#fbbf24",
          warningBg: "#451a03",
          error: "#f87171",
          errorBg: "#450a0a",
          info: "#38bdf8",
          infoBg: "#082f49"
        },
        text: {
          primary: "#f8fafc",
          secondary: "#cbd5e1",
          tertiary: "#64748b",
          inverse: "#0f172a",
          link: "#3b82f6",
          linkHover: "#60a5fa"
        },
        background: {
          canvas: "#020617",
          container: "#0f172a",
          elevated: "#1e293b",
          layout: "#020617",
          hover: "#1e293b",
          active: "#1e3a8a"
        },
        border: {
          base: "#1e293b",
          strong: "#334155",
          subtle: "#0f172a"
        },
        shadow: {
          sm: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
          md: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
          lg: "0 10px 15px -3px rgba(0, 0, 0, 0.6)"
        }
      }
    }
  },
  {
    key: "emerald-green",
    name: "翡翠绿",
    description: "沉稳自然的绿色主题，专业且护眼",
    schemes: {
      light: {
        brand: {
          primary: "#059669",
          primaryHover: "#047857",
          primaryActive: "#064e3b",
          primaryBg: "#ecfdf5",
          text: "#ffffff"
        },
        functional: {
          success: "#52c41a",
          successBg: "#f6ffed",
          warning: "#faad14",
          warningBg: "#fffbe6",
          error: "#ef4444",
          errorBg: "#fef2f2",
          info: "#0ea5e9",
          infoBg: "#f0f9ff"
        },
        text: {
          primary: "#1f2937",
          secondary: "#4b5563",
          tertiary: "#9ca3af",
          inverse: "#ffffff",
          link: "#059669",
          linkHover: "#047857"
        },
        background: {
          canvas: "#f3f4f6",
          container: "#ffffff",
          elevated: "#ffffff",
          layout: "#ffffff",
          hover: "#f9fafb",
          active: "#ecfdf5"
        },
        border: {
          base: "#e5e7eb",
          strong: "#d1d5db",
          subtle: "#f3f4f6"
        },
        shadow: {
          sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        }
      },
      dark: {
        brand: {
          primary: "#10b981",
          primaryHover: "#6ee7b7",
          primaryActive: "#059669",
          primaryBg: "#064e3b",
          text: "#ffffff"
        },
        functional: {
          success: "#4ade80",
          successBg: "#14532d",
          warning: "#fbbf24",
          warningBg: "#451a03",
          error: "#f87171",
          errorBg: "#450a0a",
          info: "#38bdf8",
          infoBg: "#0c4a6e"
        },
        text: {
          primary: "#f3f4f6",
          secondary: "#9ca3af",
          tertiary: "#6b7280",
          inverse: "#111827",
          link: "#34d399",
          linkHover: "#6ee7b7"
        },
        background: {
          canvas: "#0f172a",
          container: "#1e293b",
          elevated: "#334155",
          layout: "#1e293b",
          hover: "#334155",
          active: "#064e3b"
        },
        border: {
          base: "#374151",
          strong: "#4b5563",
          subtle: "#1e293b"
        },
        shadow: {
          sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
          md: "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
          lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
        }
      }
    }
  },
  {
    "key": "crimson-flame",
    "name": "炽枫红",
    "description": "热情且极具冲击力的红色主题，适用于品牌感强烈的专业界面",
    "schemes": {
      "light": {
        "brand": {
          "primary": "#df0428",
          "primaryHover": "#f43f5e",
          "primaryActive": "#be123c",
          "primaryBg": "#fff1f2",
          "text": "#ffffff"
        },
        "functional": {
          "success": "#10b981",
          "successBg": "#ecfdf5",
          "warning": "#f59e0b",
          "warningBg": "#fffbeb",
          "error": "#e11d48",
          "errorBg": "#fff1f2",
          "info": "#3b82f6",
          "infoBg": "#eff6ff"
        },
        "text": {
          "primary": "#111827",
          "secondary": "#4b5563",
          "tertiary": "#9ca3af",
          "inverse": "#ffffff",
          "link": "#df0428",
          "linkHover": "#f43f5e"
        },
        "background": {
          "canvas": "#f9fafb",
          "container": "#ffffff",
          "elevated": "#ffffff",
          "layout": "#ffffff",
          "hover": "#f3f4f6",
          "active": "#fff1f2"
        },
        "border": {
          "base": "#e5e7eb",
          "strong": "#d1d5db",
          "subtle": "#f3f4f6"
        },
        "shadow": {
          "sm": "0 1px 2px 0 rgba(223, 4, 40, 0.05)",
          "md": "0 4px 6px -1px rgba(223, 4, 40, 0.1)",
          "lg": "0 10px 15px -3px rgba(223, 4, 40, 0.1)"
        }
      },
      "dark": {
        "brand": {
          "primary": "#f43f5e",
          "primaryHover": "#fb7185",
          "primaryActive": "#e11d48",
          "primaryBg": "#4c0519",
          "text": "#ffffff"
        },
        "functional": {
          "success": "#34d399",
          "successBg": "#064e3b",
          "warning": "#fbbf24",
          "warningBg": "#451a03",
          "error": "#fb7185",
          "errorBg": "#4c0519",
          "info": "#60a5fa",
          "infoBg": "#1e3a8a"
        },
        "text": {
          "primary": "#f9fafb",
          "secondary": "#d1d5db",
          "tertiary": "#9ca3af",
          "inverse": "#111827",
          "link": "#fb7185",
          "linkHover": "#fda4af"
        },
        "background": {
          "canvas": "#0f172a",
          "container": "#1e293b",
          "elevated": "#334155",
          "layout": "#1e293b",
          "hover": "#334155",
          "active": "#4c0519"
        },
        "border": {
          "base": "#334155",
          "strong": "#475569",
          "subtle": "#1e293b"
        },
        "shadow": {
          "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
          "md": "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
          "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.6)"
        }
      }
    }
  },
  {
    key: "sunset-orange",
    name: "日落橘",
    description: "温暖而克制的橙色主题，强调行动力与活力",
    schemes: {
      light: {
        brand: {
          primary: "#ea580c",        // 核心主色
          primaryHover: "#c2410c",   // Hover 加深，增加稳重感
          primaryActive: "#9a3412",  // Active 更深
          primaryBg: "#fff7ed",      // 极浅的橙色背景，用于选中态或浅色标签
          text: "#ffffff",           // 强制白色文字，确保在橙色背景上的可读性
        },
        functional: {
          success: "#52c41a",
          successBg: "#f6ffed",
          warning: "#fab005",        // 调整为更偏黄的金色，防止与主色橙色混淆
          warningBg: "#fff9db",
          error: "#f03e3e",
          errorBg: "#fff5f5",
          info: "#1890ff",           // 保持蓝色作为信息提示，冷暖对比清晰
          infoBg: "#e6f7ff",
        },
        text: {
          primary: "#1f1f1f",        // 略微加深的黑色，提升锐度
          secondary: "#6b7280",      // 中性灰
          tertiary: "#9ca3af",
          inverse: "#ffffff",
          link: "#ea580c",
          linkHover: "#c2410c",
        },
        background: {
          canvas: "#f8f9fa",         // 极为中性的浅灰背景
          container: "#ffffff",
          elevated: "#ffffff",
          layout: "#ffffff",
          hover: "#fdfdfd",
          active: "#fff7ed",         // 与 primaryBg 呼应
        },
        border: {
          base: "#e5e7eb",
          strong: "#d1d5db",
          subtle: "#f3f4f6",
        },
        shadow: {
          sm: "0 1px 2px 0 rgba(234, 88, 12, 0.05)",  // 阴影带有一点点主色倾向，但极淡
          md: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
          lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
        },
      },
      dark: {
        brand: {
          primary: "#f97316",        // 暗黑模式下稍微提亮，增加可读性
          primaryHover: "#fb923c",
          primaryActive: "#ea580c",
          primaryBg: "#431407",      // 深褐/深橙色背景
          text: "#ffffff",           // 强制白色文字，解决暗色模式下橙色按钮文字不清晰的问题
        },
        functional: {
          success: "#73d13d",
          successBg: "#162312",
          warning: "#ffd43b",
          warningBg: "#352e0e",
          error: "#ff6b6b",
          errorBg: "#2f1616",
          info: "#40a9ff",
          infoBg: "#111d2c",
        },
        text: {
          primary: "#e5e7eb",
          secondary: "#9ca3af",
          tertiary: "#6b7280",
          inverse: "#1a1a1a",
          link: "#f97316",
          linkHover: "#fb923c",
        },
        background: {
          canvas: "#0c0c0c",         // 接近纯黑的深灰
          container: "#171717",      // 常用容器色
          elevated: "#262626",
          layout: "#121212",
          hover: "#262626",
          active: "#431407",
        },
        border: {
          base: "#2e2e2e",
          strong: "#404040",
          subtle: "#1f1f1f",
        },
        shadow: {
          sm: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
          md: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
          lg: "0 10px 15px -3px rgba(0, 0, 0, 0.6)",
        },
      },
    },
  },
  {
    key: "royal-purple",
    name: "优雅紫",
    description: "专业、神秘且现代的紫色主题",
    schemes: {
      light: {
        brand: {
          primary: "#6c5dd3",
          primaryHover: "#594bb0",
          primaryActive: "#4b3ea1",
          primaryBg: "#f2f0fa",
          text: "#ffffff"
        },
        functional: {
          success: "#52c41a",
          successBg: "#f6ffed",
          warning: "#faad14",
          warningBg: "#fffbe6",
          error: "#f5222d",
          errorBg: "#fff1f0",
          info: "#1890ff",
          infoBg: "#e6f7ff"
        },
        text: {
          primary: "#1a1a1a",
          secondary: "#666666",
          tertiary: "#999999",
          inverse: "#ffffff",
          link: "#6c5dd3",
          linkHover: "#594bb0"
        },
        background: {
          canvas: "#f5f7fa",
          container: "#ffffff",
          elevated: "#ffffff",
          layout: "#ffffff",
          hover: "#f7f7fa",
          active: "#f2f0fa"
        },
        border: {
          base: "#e0e0e0",
          strong: "#bdbdbd",
          subtle: "#f0f0f0"
        },
        shadow: {
          sm: "0 1px 2px 0 rgba(108, 93, 211, 0.05)",
          md: "0 4px 6px -1px rgba(108, 93, 211, 0.1)",
          lg: "0 10px 15px -3px rgba(108, 93, 211, 0.1)"
        }
      },
      dark: {
        brand: {
          primary: "#8b79f8",
          primaryHover: "#9e93e6",
          primaryActive: "#6c5dd3",
          primaryBg: "#1e1c2e",
          text: "#ffffff"
        },
        functional: {
          success: "#73d13d",
          successBg: "#162312",
          warning: "#ffc53d",
          warningBg: "#2b2111",
          error: "#ff4d4f",
          errorBg: "#2a1215",
          info: "#40a9ff",
          infoBg: "#111d2c"
        },
        text: {
          primary: "#e8e8e8",
          secondary: "#a0a0a0",
          tertiary: "#707070",
          inverse: "#1a1a1a",
          link: "#8477d9",
          linkHover: "#9e93e6"
        },
        background: {
          canvas: "#0a0a0a",
          container: "#1a1a1a",
          elevated: "#242424",
          layout: "#141414",
          hover: "#242424",
          active: "#1e1c2e"
        },
        border: {
          base: "#303030",
          strong: "#404040",
          subtle: "#1f1f1f"
        },
        shadow: {
          sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
          md: "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
          lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
        }
      }
    }
  },
  {
    "key": "distant-mountain-blue",
    "name": "远山黛",
    "description": "优化了对比度与视觉层级的企业级主题，增强了暗色模式的易读性",
    "schemes": {
      "light": {
        "brand": {
          "primary": "#0f172a",
          "primaryHover": "#1e293b",
          "primaryActive": "#334155",
          "primaryBg": "#f1f5f9",
          "text": "#ffffff"
        },
        "functional": {
          "success": "#059669",
          "successBg": "#ecfdf5",
          "warning": "#d97706",
          "warningBg": "#fffbeb",
          "error": "#dc2626",
          "errorBg": "#fef2f2",
          "info": "#0284c7",
          "infoBg": "#f0f9ff"
        },
        "text": {
          "primary": "#0f172a",
          "secondary": "#475569",
          "tertiary": "#94a3b8",
          "inverse": "#ffffff",
          "link": "#0f172a",
          "linkHover": "#2563eb"  // 修改: 链接悬停建议带点颜色，不仅是变浅，提示交互性
        },
        "background": {
          "canvas": "#f8fafc",
          "container": "#ffffff",
          "elevated": "#ffffff",
          "layout": "#f1f5f9",
          "hover": "#f8fafc",     // 修改: 悬停背景稍微亮一点，避免显得脏
          "active": "#e2e8f0"
        },
        "border": {
          "base": "#e2e8f0",      // 建议: 变浅，减少网格视觉噪音 (原 #cbd5e1)
          "strong": "#cbd5e1",    // 原 base 下移至 strong
          "subtle": "#f1f5f9"
        },
        "shadow": {
          "sm": "0 1px 2px 0 rgba(15, 23, 42, 0.06)", // 微调透明度
          "md": "0 4px 6px -1px rgba(15, 23, 42, 0.08)",
          "lg": "0 10px 15px -3px rgba(15, 23, 42, 0.08)"
        }
      },
      "dark": {
        "brand": {
          "primary": "#60a5fa",
          "primaryHover": "#93c5fd",
          "primaryActive": "#3b82f6",
          "primaryBg": "#1e293b",
          "text": "#0f172a"       // 关键修改: 暗色模式下，亮色按钮配深色文字，提升可读性和高级感
        },
        "functional": {
          "success": "#34d399",
          "successBg": "rgba(6, 78, 59, 0.4)", // 建议: 使用透明度增加背景融合感
          "warning": "#fbbf24",
          "warningBg": "rgba(69, 26, 3, 0.4)",
          "error": "#f87171",
          "errorBg": "rgba(69, 10, 10, 0.4)",
          "info": "#38bdf8",
          "infoBg": "rgba(12, 74, 110, 0.4)"
        },
        "text": {
          "primary": "#f1f5f9",   // 稍微降低纯白亮度，护眼
          "secondary": "#cbd5e1", // 提亮二级文字，增加对比度
          "tertiary": "#64748b",
          "inverse": "#0f172a",
          "link": "#60a5fa",
          "linkHover": "#93c5fd"
        },
        "background": {
          "canvas": "#020617",
          "container": "#0f172a", // 保持板岩色
          "elevated": "#1e293b",
          "layout": "#020617",
          "hover": "#1e293b",
          "active": "#334155"
        },
        "border": {
          "base": "#1e293b",      // 这种深色边框在暗色模式更自然
          "strong": "#334155",
          "subtle": "#0f172a"
        },
        "shadow": {
          "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
          "md": "0 4px 6px -1px rgba(0, 0, 0, 0.6)",
          "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.7)"
        }
      }
    }
  },
]

export const defaultThemeSettings = {
  mode: "system" as const,
  activePreset: "sky-blue",
  fontFamily: "inter",
  layout: {
    menuLayout: "single" as const,
    containerWidth: "fixed" as const,
    sidebarWidth: 240,
    sidebarCollapsedWidth: 64,
    headerHeight: 64,
  },
  ui: {
    showBreadcrumb: true,
    showBreadcrumbIcon: true,
    pageAnimation: "slide-left" as const,
    borderRadius: 12,
  },
}
