import type { ThemePreset } from "@/types/theme"

export const coreBlue: ThemePreset = {
  "key": "core-blue",
  "name": "基石蓝",
  "description": "一种冷静、可信赖的系统级蓝色，用于承载默认交互与关键信息，强调稳定性、专业感与长期可用性，适合作为企业级产品与管理后台的基础主色。",
  "schemes": {
    "light": {
      /* ----------------------------------
       * 1. 品牌 & 破坏性操作
       * ---------------------------------- */
      brand: {
        primary: {
          default: "#2563eb",
          hover: "#1d4ed8",
          active: "#1e40af",
          pressed: "#1e3a8a",
          fg: "#ffffff",

          subtle: "rgba(37,99,235,0.1)",
          onSubtle: "#1e40af",

          border: "rgba(37,99,235,0.35)",
          subtleBorder: "rgba(37,99,235,0.2)",
          contrastText: "#1e3a8a",
        },
        secondary: {
          default: "#f1f5f9",
          hover: "#e2e8f0",
          active: "#cbd5e1",
          pressed: "#94a3b8",
          fg: "#0f172a",

          subtle: "#f8fafc",
          onSubtle: "#334155",

          border: "#e2e8f0",
          subtleBorder: "#f1f5f9",
        },
      },

      destructive: {
        default: "#dc2626",
        hover: "#b91c1c",
        active: "#991b1b",
        pressed: "#7f1d1d",
        fg: "#ffffff",

        subtle: "rgba(220,38,38,0.1)",
        onSubtle: "#991b1b",

        border: "rgba(220,38,38,0.35)",
        subtleBorder: "rgba(220,38,38,0.2)",
      },

      /* ----------------------------------
       * 2. 语义状态
       * ---------------------------------- */
      status: {
        success: {
          default: "#16a34a",
          hover: "#15803d",
          active: "#166534",
          pressed: "#14532d",
          fg: "#ffffff",

          subtle: "rgba(34,197,94,0.12)",
          onSubtle: "#166534",

          border: "rgba(22,163,74,0.4)",
          subtleBorder: "rgba(22,163,74,0.25)",
        },
        warning: {
          default: "#f59e0b",
          hover: "#d97706",
          active: "#b45309",
          pressed: "#92400e",
          fg: "#ffffff",

          subtle: "rgba(245,158,11,0.15)",
          onSubtle: "#92400e",

          border: "rgba(245,158,11,0.4)",
          subtleBorder: "rgba(245,158,11,0.25)",
        },
        error: {
          default: "#dc2626",
          hover: "#b91c1c",
          active: "#991b1b",
          pressed: "#7f1d1d",
          fg: "#ffffff",

          subtle: "rgba(220,38,38,0.12)",
          onSubtle: "#991b1b",

          border: "rgba(220,38,38,0.4)",
          subtleBorder: "rgba(220,38,38,0.25)",
        },
        info: {
          default: "#2563eb",
          hover: "#1d4ed8",
          active: "#1e40af",
          pressed: "#1e3a8a",
          fg: "#ffffff",

          subtle: "rgba(37,99,235,0.12)",
          onSubtle: "#1e40af",

          border: "rgba(37,99,235,0.4)",
          subtleBorder: "rgba(37,99,235,0.25)",
        },
      },

      /* ----------------------------------
       * 3. 文字系统
       * ---------------------------------- */
      text: {
        primary: "#020617",
        secondary: "#334155",
        tertiary: "#64748b",
        placeholder: "#94a3b8",
        disabled: "#cbd5e1",
        inverse: "#ffffff",
        link: {
          default: "#2563eb",
          hover: "#1d4ed8",
          active: "#1e40af",
        },
      },

      /* ----------------------------------
       * 4. 背景 / 海拔
       * ---------------------------------- */
      background: {
        canvas: "#f8fafc",
        layout: "#f1f5f9",
        container: "#ffffff",
        surface: "#f8fafc",
        elevated: "#ffffff",

        muted: {
          default: "#f1f5f9",
          fg: "#475569",
        },
        accent: {
          default: "rgba(37,99,235,0.1)",
          fg: "#1e40af",
        },

        glass: {
          bg: "rgba(255,255,255,0.75)",
          border: "rgba(15,23,42,0.08)",
        },

        mask: "rgba(15,23,42,0.45)",
        tooltip: "#020617",
      },

      /* ----------------------------------
       * 5. 表单
       * ---------------------------------- */
      form: {
        input: "#ffffff",
        border: "#e2e8f0",
        borderHover: "#cbd5e1",
        ring: "#2563eb",
        label: "#020617",
        description: "#64748b",
        required: "#dc2626",
        addon: "#f1f5f9",
        readonly: "#f8fafc",
      },

      /* ----------------------------------
       * 6. 边框
       * ---------------------------------- */
      border: {
        base: "#e2e8f0",
        strong: "#cbd5e1",
        subtle: "#f1f5f9",
        focus: "#2563eb",
      },

      /* ----------------------------------
       * 7. 交互与反馈
       * ---------------------------------- */
      action: {
        selection: "rgba(37,99,235,0.25)",
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
          thumb: "#cbd5e1",
          hover: "#94a3b8",
        },
      },

      /* ----------------------------------
       * 8. 组件级
       * ---------------------------------- */
      component: {
        table: {
          headerBg: "#f8fafc",
          rowHover: "rgba(37,99,235,0.05)",
          rowStriped: "#ffffff",
          border: "#e2e8f0",
        },
        tabs: {
          listBg: "#f1f5f9",
          triggerBg: "#ffffff",
          indicator: "#2563eb",
        },
        sidebar: {
          bg: "#ffffff",
          fg: "#020617",
          border: "#e2e8f0",
          ring: "#2563eb",
          accent: "rgba(37,99,235,0.1)",
          onAccent: "#1e40af",
        },
      },

      /* ----------------------------------
       * 9. 阴影 & 光效
       * ---------------------------------- */
      effects: {
        shadow: {
          sm: "0 1px 2px rgba(2,6,23,0.06)",
          md: "0 4px 12px rgba(2,6,23,0.08)",
          lg: "0 12px 32px rgba(2,6,23,0.12)",
        },
        glow: "0 0 0 1px rgba(37,99,235,0.25)",
      },

      /* ----------------------------------
       * 10. 数据可视化
       * ---------------------------------- */
      charts: {
        categorical: [
          "#2563eb",
          "#16a34a",
          "#f59e0b",
          "#dc2626",
          "#7c3aed",
          "#0891b2",
          "#0284c7",
          "#e11d48",
          "#ca8a04",
          "#9333ea",
          "#0ea5e9",
          "#22c55e",
        ],
        semantic: {
          positive: "#16a34a",
          negative: "#dc2626",
          neutral: "#64748b",
          warning: "#f59e0b",
        },
      },
    },
    "dark": {
      brand: {
        primary: {
          default: "#2563eb",
          hover: "#3b82f6",
          active: "#1d4ed8",
          pressed: "#1e40af",
          fg: "#eff6ff",

          subtle: "rgba(37,99,235,0.18)",
          onSubtle: "#bfdbfe",

          border: "rgba(96,165,250,0.4)",
          subtleBorder: "rgba(96,165,250,0.22)",
          contrastText: "#dbeafe",
        },
        secondary: {
          default: "#1f2937",
          hover: "#27303b",
          active: "#2f3945",
          pressed: "#374151",
          fg: "#e5e7eb",

          subtle: "#1b2430",
          onSubtle: "#cbd5e1",

          border: "#334155",
          subtleBorder: "#293241",
        },
      },

      destructive: {
        default: "#dc2626",
        hover: "#ef4444",
        active: "#b91c1c",
        pressed: "#991b1b",
        fg: "#fee2e2",

        subtle: "rgba(220,38,38,0.18)",
        onSubtle: "#fecaca",

        border: "rgba(239,68,68,0.45)",
        subtleBorder: "rgba(239,68,68,0.25)",
      },

      status: {
        success: {
          default: "#22c55e",
          hover: "#4ade80",
          active: "#16a34a",
          pressed: "#15803d",
          fg: "#ecfdf5",

          subtle: "rgba(34,197,94,0.14)",
          onSubtle: "#86efac",

          border: "rgba(34,197,94,0.4)",
          subtleBorder: "rgba(34,197,94,0.2)",
        },
        warning: {
          default: "#fbbf24",
          hover: "#facc15",
          active: "#f59e0b",
          pressed: "#d97706",
          fg: "#fffbeb",

          subtle: "rgba(251,191,36,0.16)",
          onSubtle: "#fde68a",

          border: "rgba(251,191,36,0.45)",
          subtleBorder: "rgba(251,191,36,0.25)",
        },
        error: {
          default: "#ef4444",
          hover: "#f87171",
          active: "#dc2626",
          pressed: "#b91c1c",
          fg: "#fee2e2",

          subtle: "rgba(239,68,68,0.18)",
          onSubtle: "#fecaca",

          border: "rgba(239,68,68,0.45)",
          subtleBorder: "rgba(239,68,68,0.25)",
        },
        info: {
          default: "#60a5fa",
          hover: "#93c5fd",
          active: "#3b82f6",
          pressed: "#2563eb",
          fg: "#eff6ff",

          subtle: "rgba(96,165,250,0.16)",
          onSubtle: "#bfdbfe",

          border: "rgba(96,165,250,0.45)",
          subtleBorder: "rgba(96,165,250,0.25)",
        },
      },

      text: {
        primary: "#e5e7eb",
        secondary: "#9ca3af",
        tertiary: "#6b7280",
        placeholder: "#4b5563",
        disabled: "#374151",
        inverse: "#020617",
        link: {
          default: "#60a5fa",
          hover: "#93c5fd",
          active: "#3b82f6",
        },
      },

      background: {
        canvas: "#0b1220",
        layout: "#0f172a",
        container: "#111827",
        surface: "#1e293b",
        elevated: "#2d3748",

        muted: {
          default: "#1f2937",
          fg: "#9ca3af",
        },
        accent: {
          default: "rgba(37,99,235,0.2)",
          fg: "#bfdbfe",
        },

        glass: {
          bg: "rgba(15,23,42,0.6)",
          border: "rgba(255,255,255,0.06)",
        },

        mask: "rgba(2,6,23,0.72)",
        tooltip: "#020617",
      },

      form: {
        input: "#0f172a",
        border: "#243041",
        borderHover: "#334155",
        ring: "#2563eb",
        label: "#d1d5db",
        description: "#9ca3af",
        required: "#ef4444",
        addon: "#1f2937",
        readonly: "#020617",
      },

      border: {
        base: "#1f2937",
        strong: "#334155",
        subtle: "#162032",
        focus: "#2563eb",
      },

      action: {
        selection: "rgba(37,99,235,0.35)",
        disabled: {
          bg: "#020617",
          text: "#475569",
          border: "#1e293b",
        },
        skeleton: {
          base: "#111827",
          shimmer: "#1f2937",
        },
        scrollbar: {
          thumb: "#334155",
          hover: "#475569",
        },
      },

      component: {
        table: {
          headerBg: "#0f172a",
          rowHover: "rgba(37,99,235,0.08)",
          rowStriped: "#0b1220",
          border: "#1f2937",
        },
        tabs: {
          listBg: "#0f172a",
          triggerBg: "#020617",
          indicator: "#2563eb",
        },
        sidebar: {
          bg: "#020617",
          fg: "#e5e7eb",
          border: "#1f2937",
          ring: "#2563eb",
          accent: "rgba(37,99,235,0.22)",
          onAccent: "#bfdbfe",
        },
      },

      effects: {
        shadow: {
          sm: "0 1px 2px rgba(0,0,0,0.45)",
          md: "0 8px 24px rgba(0,0,0,0.55)",
          lg: "0 16px 48px rgba(0,0,0,0.65)",
        },
        glow:
          "0 0 0 1px rgba(37,99,235,0.28), 0 0 28px rgba(37,99,235,0.35)",
      },

      charts: {
        categorical: [
          "#60a5fa",
          "#22c55e",
          "#fbbf24",
          "#ef4444",
          "#a78bfa",
          "#22d3ee",
          "#38bdf8",
          "#4ade80",
          "#fb7185",
          "#eab308",
          "#c084fc",
          "#93c5fd",
        ],
        semantic: {
          positive: "#22c55e",
          negative: "#ef4444",
          neutral: "#9ca3af",
          warning: "#fbbf24",
        },
      },
    }
  }
}
