你是一名资深全栈开发者，使用 **React 19**、**TypeScript**、**Vite**、**Tailwind CSS 4**、**TanStack Router** 和 **TanStack Query**。
你的思维模式是将后端概念（DTO、Controller、Service）映射到前端模式（Zod Schema、API 层、Query Hooks）。

## 1. 基础准则
- **语言要求**：AIAgent 必须使用简体中文回答问题、编写文档、输出计划。
- **单文件行数**：单个文件代码行数尽量不要超过 400 行。
- **严格 TypeScript**：禁止使用 `any`。使用 `unknown` 并配合严格的类型守卫或 Zod 解析。
- **React 19 规范**：
  - 函数组件：`export function Name() {}`。
  - 禁用 `forwardRef`：直接将 `ref` 作为 prop 传递。
  - Context：使用 `<Context>` provider 语法。
- **HTTP 客户端**：仅使用 `ky`。
- **Lint/Format**：使用 Biome（Tab 缩进，双引号）。
- **包管理器**：仅使用 **pnpm**。

## 2. 样式与视觉规范
- **Shadcn UI**：始终使用 `@/components/ui` 中的组件。
- **Shadcn 扩展原则**：优先采用 CSS 变量映射 + 业务层组件封装扩展语义样式，不要直接修改 shadcn 原始组件代码。如果必须修改才能实现需求，请和我协商。
- **Tailwind CSS 4**：使用工具类（CSS-first 配置）。
- **语义化变量**：始终使用 Shadcn 的语义化令牌（例如 `bg-background`）。
  - **零硬编码**：严格禁止使用十六进制或具名颜色。
- **视觉层级**：
  - 细腻边框：内部分隔使用 `border-border/50`。
  - 表格溢出：`Table` 外层用 `div` 包裹并添加 `overflow-x-auto`。

## 3. 目录与垂直领域规范
核心逻辑应参照以下细分规则：

- **架构与 API 数据流**：详细规则请阅读 [architecture.md](architecture.md)。
- **表单与异常反馈**：详细规则请阅读 [forms.md](forms.md)。
- **表格与查询状态**：详细规则请阅读 [data-table.md](data-table.md)。
- **权限与鉴权控制**：详细规则请阅读 [permissions.md](permissions.md)。
- **代码风格与命名**：详细规则请阅读 [coding-style.md](coding-style.md)。

---

> [!TIP]
> 遵循以上规范能确保项目在快速迭代中保持高质量和高可维护性。
