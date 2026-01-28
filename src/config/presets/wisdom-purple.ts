import type { ThemePreset } from "@/types/theme"

export const wisdomPurple: ThemePreset = {
  "key": "wisdom-purple",
  "name": "智曜紫",
  "description": "面向智能与高阶能力的主题色，融合理性与创造力，用于 AI 功能、高级模块与专业工具场景，强调洞察力、差异化与未来感。",
  "schemes": {
    "light": {
      brand: {
        primary: {
          default: "#7c3aed",
          hover: "#6d28d9",
          active: "#5b21b6",
          pressed: "#4c1d95",
          fg: "#ffffff",

          subtle: "#ede9fe",
          onSubtle: "#5b21b6",

          border: "#c4b5fd",
          subtleBorder: "#ddd6fe",
        },
        secondary: {
          default: "#64748b",
          hover: "#475569",
          active: "#334155",
          pressed: "#1e293b",
          fg: "#ffffff",

          subtle: "#f1f5f9",
          onSubtle: "#334155",

          border: "#cbd5e1",
          subtleBorder: "#e2e8f0",
        },
      },

      destructive: {
        default: "#df0428",
        hover: "#c70323",
        active: "#a8021e",
        pressed: "#8a0118",
        fg: "#ffffff",

        subtle: "#fee2e2",
        onSubtle: "#991b1b",

        border: "#fecaca",
        subtleBorder: "#fee2e2",
      },

      status: {
        success: {
          default: "#059669",
          hover: "#047857",
          active: "#065f46",
          pressed: "#064e3b",
          fg: "#ffffff",

          subtle: "#d1fae5",
          onSubtle: "#065f46",

          border: "#6ee7b7",
          subtleBorder: "#a7f3d0",
        },
        warning: {
          default: "#d97706",
          hover: "#b45309",
          active: "#92400e",
          pressed: "#78350f",
          fg: "#ffffff",

          subtle: "#fef3c7",
          onSubtle: "#92400e",

          border: "#fde68a",
          subtleBorder: "#fef3c7",
        },
        error: {
          default: "#dc2626",
          hover: "#b91c1c",
          active: "#991b1b",
          pressed: "#7f1d1d",
          fg: "#ffffff",

          subtle: "#fee2e2",
          onSubtle: "#991b1b",

          border: "#fecaca",
          subtleBorder: "#fee2e2",
        },
        info: {
          default: "#2563eb",
          hover: "#1d4ed8",
          active: "#1e40af",
          pressed: "#1e3a8a",
          fg: "#ffffff",

          subtle: "#dbeafe",
          onSubtle: "#1e40af",

          border: "#bfdbfe",
          subtleBorder: "#dbeafe",
        },
      },

      text: {
        primary: "#0f172a",
        secondary: "#334155",
        tertiary: "#64748b",
        placeholder: "#94a3b8",
        disabled: "#cbd5e1",
        inverse: "#ffffff",
        link: {
          default: "#7c3aed",
          hover: "#6d28d9",
          active: "#5b21b6",
        },
      },

      background: {
        canvas: "#f8fafc",
        layout: "#f1f5f9",
        container: "#ffffff",
        surface: "#f8fafc",
        elevated: "#ffffff",

        muted: {
          default: "#f1f5f9",
          fg: "#334155",
        },
        accent: {
          default: "#ede9fe",
          fg: "#5b21b6",
        },

        glass: {
          bg: "rgba(255,255,255,0.6)",
          border: "rgba(124,58,237,0.2)",
        },

        mask: "rgba(15,23,42,0.4)",
        tooltip: "#0f172a",
      },

      form: {
        input: "#ffffff",
        border: "#cbd5e1",
        borderHover: "#a5b4fc",
        ring: "#7c3aed",
        label: "#0f172a",
        description: "#64748b",
        required: "#dc2626",
        addon: "#f1f5f9",
        readonly: "#f8fafc",
      },

      border: {
        base: "#e2e8f0",
        strong: "#cbd5e1",
        subtle: "#f1f5f9",
        focus: "#7c3aed",
      },

      action: {
        selection: "rgba(124,58,237,0.2)",
        disabled: {
          bg: "#f1f5f9",
          text: "#94a3b8",
          border: "#e2e8f0",
        },
        skeleton: {
          base: "#e5e7eb",
          shimmer: "#f1f5f9",
        },
        scrollbar: {
          thumb: "#c7d2fe",
          hover: "#a5b4fc",
        },
      },

      component: {
        table: {
          headerBg: "#f1f5f9",
          rowHover: "#ede9fe",
          rowStriped: "#f8fafc",
          border: "#e2e8f0",
        },
        tabs: {
          listBg: "#f1f5f9",
          triggerBg: "#ffffff",
          indicator: "#7c3aed",
        },
        sidebar: {
          bg: "#f8fafc",
          fg: "#0f172a",
          border: "#e2e8f0",
          ring: "#7c3aed",
          accent: "#ede9fe",
          onAccent: "#5b21b6",
        },
      },

      effects: {
        shadow: {
          sm: "0 1px 2px rgba(15,23,42,0.06)",
          md: "0 4px 12px rgba(15,23,42,0.08)",
          lg: "0 12px 32px rgba(15,23,42,0.12)",
        },
        glow: "0 0 0 0 rgba(124,58,237,0)",
      },

      charts: {
        categorical: [
          "#7c3aed",
          "#2563eb",
          "#059669",
          "#d97706",
          "#dc2626",
          "#0891b2",
          "#9333ea",
          "#4f46e5",
          "#16a34a",
          "#ca8a04",
          "#b91c1c",
          "#0ea5e9",
        ],
        semantic: {
          positive: "#059669",
          negative: "#dc2626",
          neutral: "#64748b",
          warning: "#d97706",
        },
      },
    },
    "dark": {
      brand: {
        primary: {
          default: "#7c3aed",
          hover: "#8b5cf6",
          active: "#6d28d9",
          pressed: "#5b21b6",
          fg: "#ffffff",

          subtle: "rgba(124,58,237,0.2)",
          onSubtle: "#c4b5fd",

          border: "#5b21b6",
          subtleBorder: "rgba(124,58,237,0.25)",
          contrastText: "#ede9fe",
        },
        secondary: {
          default: "#475569",
          hover: "#64748b",
          active: "#334155",
          pressed: "#1e293b",
          fg: "#ffffff",

          subtle: "#1e293b",
          onSubtle: "#cbd5e1",

          border: "#334155",
          subtleBorder: "#1e293b",
        },
      },

      destructive: {
        default: "#df0428",
        hover: "#f43f5e",
        active: "#be123c",
        pressed: "#9f1239",
        fg: "#ffffff",

        subtle: "rgba(223,4,40,0.25)",
        onSubtle: "#fecaca",

        border: "#9f1239",
        subtleBorder: "rgba(223,4,40,0.3)",
      },

      status: {
        success: {
          default: "#059669",
          hover: "#10b981",
          active: "#047857",
          pressed: "#065f46",
          fg: "#ffffff",

          subtle: "rgba(5,150,105,0.25)",
          onSubtle: "#a7f3d0",

          border: "#047857",
          subtleBorder: "rgba(5,150,105,0.3)",
        },
        warning: {
          default: "#d97706",
          hover: "#f59e0b",
          active: "#b45309",
          pressed: "#92400e",
          fg: "#ffffff",

          subtle: "rgba(217,119,6,0.25)",
          onSubtle: "#fde68a",

          border: "#b45309",
          subtleBorder: "rgba(217,119,6,0.3)",
        },
        error: {
          default: "#dc2626",
          hover: "#f87171",
          active: "#b91c1c",
          pressed: "#991b1b",
          fg: "#ffffff",

          subtle: "rgba(220,38,38,0.25)",
          onSubtle: "#fecaca",

          border: "#b91c1c",
          subtleBorder: "rgba(220,38,38,0.3)",
        },
        info: {
          default: "#2563eb",
          hover: "#60a5fa",
          active: "#1d4ed8",
          pressed: "#1e40af",
          fg: "#ffffff",

          subtle: "rgba(37,99,235,0.25)",
          onSubtle: "#bfdbfe",

          border: "#1d4ed8",
          subtleBorder: "rgba(37,99,235,0.3)",
        },
      },

      text: {
        primary: "#e5e7eb",
        secondary: "#cbd5e1",
        tertiary: "#94a3b8",
        placeholder: "#64748b",
        disabled: "#475569",
        inverse: "#0f172a",
        link: {
          default: "#a78bfa",
          hover: "#c4b5fd",
          active: "#8b5cf6",
        },
      },

      background: {
        canvas: "#0b1220",
        layout: "#0f172a",
        container: "#111827",
        surface: "#1e1b2e",
        elevated: "#1f1b3a",

        muted: {
          default: "#1e293b",
          fg: "#cbd5e1",
        },
        accent: {
          default: "rgba(124,58,237,0.25)",
          fg: "#ede9fe",
        },

        glass: {
          bg: "rgba(124,58,237,0.12)",
          border: "rgba(124,58,237,0.35)",
        },

        mask: "rgba(2,6,23,0.7)",
        tooltip: "#1f2933",
      },

      form: {
        input: "#0f172a",
        border: "#334155",
        borderHover: "#7c3aed",
        ring: "#8b5cf6",
        label: "#e5e7eb",
        description: "#94a3b8",
        required: "#f87171",
        addon: "#1e293b",
        readonly: "#020617",
      },

      border: {
        base: "#1e293b",
        strong: "#334155",
        subtle: "#0f172a",
        focus: "#7c3aed",
      },

      action: {
        selection: "rgba(124,58,237,0.35)",
        disabled: {
          bg: "#020617",
          text: "#475569",
          border: "#1e293b",
        },
        skeleton: {
          base: "#1e293b",
          shimmer: "#334155",
        },
        scrollbar: {
          thumb: "#5b21b6",
          hover: "#7c3aed",
        },
      },

      component: {
        table: {
          headerBg: "#0f172a",
          rowHover: "rgba(124,58,237,0.15)",
          rowStriped: "#020617",
          border: "#1e293b",
        },
        tabs: {
          listBg: "#0f172a",
          triggerBg: "#020617",
          indicator: "#7c3aed",
        },
        sidebar: {
          bg: "#0f172a",
          fg: "#e5e7eb",
          border: "#1e293b",
          ring: "#7c3aed",
          accent: "rgba(124,58,237,0.25)",
          onAccent: "#ede9fe",
        },
      },

      effects: {
        shadow: {
          sm: "0 1px 2px rgba(0,0,0,0.4)",
          md: "0 8px 24px rgba(0,0,0,0.5)",
          lg: "0 24px 48px rgba(0,0,0,0.6)",
        },
        glow: "0 0 32px rgba(124,58,237,0.45)",
      },

      charts: {
        categorical: [
          "#a78bfa",
          "#60a5fa",
          "#34d399",
          "#fbbf24",
          "#f87171",
          "#22d3ee",
          "#c4b5fd",
          "#818cf8",
          "#6ee7b7",
          "#fde68a",
          "#fecaca",
          "#67e8f9",
        ],
        semantic: {
          positive: "#34d399",
          negative: "#f87171",
          neutral: "#94a3b8",
          warning: "#fbbf24",
        },
      },
    }
  }
}
