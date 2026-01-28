# AI 前端起步模板

面向 AI 辅助开发优化的 React 19 + TypeScript 全栈类型安全起步模板。采用特性驱动架构（Feature-Based），内置 TanStack Router、TanStack Query，以 Zod 为核心的类型驱动开发模式。

## ✨ 核心特性

- **🎯 类型驱动开发** - Zod Schema 定义数据结构，自动推导 TypeScript 类型
- **🚀 极速开发体验** - Vite + pnpm + HMR，秒级启动和热更新
- **🔒 全栈类型安全** - 从 API 到 UI 的端到端类型保护
- **📁 特性化架构** - 按业务领域组织代码，而非文件类型
- **🎨 开箱即用的 UI** - shadcn/ui + Tailwind CSS 4.0，无障碍访问
- **🔄 智能状态管理** - TanStack Query (服务端) + Zustand (客户端) + Nuqs (URL)
- **🧪 完整测试方案** - Vitest + Testing Library + MSW API 模拟
- **🤖 AI 优化** - 严格的代码规范和类型约束，提升 AI 辅助编程准确率

## 📦 技术栈

### 核心框架
- **React 19** - 最新的 React 生态
- **TypeScript 5+** - 严格模式，禁用 `any`
- **Vite** - 下一代前端构建工具
- **pnpm** - 快速、节省磁盘空间的包管理器

### 路由与数据
- **TanStack Router** - 类型安全的文件路由系统
- **TanStack Query v5** - 强大的服务端状态管理
- **Ky** - 轻量级 HTTP 客户端 (~3kb)

### UI 与样式
- **Tailwind CSS 4.0** - 原子化 CSS 工具类
- **shadcn/ui** - 基于 Radix UI 的可访问组件库
- **Lucide React** - 现代化图标库
- **Motion** - 流畅的动画效果

### 表单与验证
- **Zod** - Schema 验证和类型推导
- **React Hook Form** - 高性能表单状态管理
- **@hookform/resolvers** - Zod 集成

### 状态管理
- **TanStack Query** - 服务端状态（API 数据、缓存）
- **Zustand** - 全局 UI 状态（侧边栏、模态框等）
- **Nuqs** - 类型安全的 URL 状态（筛选、分页）

### 开发工具
- **Vitest** - Vite 原生的单元测试框架
- **Testing Library** - 用户行为驱动的组件测试
- **MSW** - API 模拟，支持前后端并行开发
- **Biome** - 统一的代码检查和格式化工具
- **@t3-oss/env-core** - 环境变量类型验证

### 工具库
- **date-fns v4** - 函数式日期处理库
- **Recharts** - 图表组件（shadcn/ui charts 底层）
- **ts-reset** - TypeScript 类型增强

## 🚀 快速开始

### 环境要求

- Node.js >= 20.0.0
- pnpm >= 9.0.0

### 安装

```bash
# 启用 pnpm（使用 Corepack）
corepack enable && corepack prepare pnpm@latest --activate

# 安装依赖
pnpm install

# 初始化 MSW（仅需运行一次）
pnpm msw:init

# 启动开发服务器
pnpm dev
```

访问 http://localhost:5173 查看应用。

## 📜 可用脚本

### 开发
```bash
pnpm dev              # 启动开发服务器
pnpm build            # 生产环境构建
pnpm preview          # 预览生产构建
```

### 测试与质量
```bash
pnpm test             # 运行测试
pnpm test:watch       # 监听模式运行测试
pnpm typecheck        # TypeScript 类型检查
pnpm lint             # 运行 Biome 代码检查
pnpm format           # 格式化代码
```

### 工具
```bash
pnpm msw:init         # 初始化 MSW（生成 public/mockServiceWorker.js）
pnpm routes:generate  # 生成 TanStack Router 路由树
```

## 📂 项目结构

```
src/
├── app/                    # 全局应用配置
│   ├── provider.tsx        # 根 Provider（QueryClient、Toast 等）
│   ├── router.tsx          # TanStack Router 根配置
│   ├── query-client.ts     # TanStack Query 客户端设置
│   ├── theme-config.ts     # 主题配置
│   └── globals.css         # 全局样式（Tailwind 导入）
│
├── assets/                 # 静态资源（图片、SVG）
│
├── components/             # 共享/可复用组件
│   ├── ui/                 # shadcn/ui 组件（Button、Input、Form 等）
│   ├── common/             # 项目级共享组件（PageContainer 等）
│   └── layout/             # 布局组件（Header、Sidebar 等）
│
├── features/               # 业务功能模块（核心）
│   └── {feature-name}/     # 例如：dashboard、auth、users
│       ├── api/            # API 层（Zod Schema + Query/Mutation Hooks）
│       │   ├── get-*.ts    # GET 端点（useQuery hooks）
│       │   └── update-*.ts # POST/PUT/DELETE 端点（useMutation hooks）
│       ├── components/     # 功能特定组件
│       └── routes/         # 功能路由（如果不使用文件路由）
│
├── hooks/                  # 全局自定义 Hooks
│   ├── use-mobile.ts       # 响应式工具
│   └── use-ui-store.ts     # UI 状态管理（Zustand）
│
├── lib/                    # 基础设施/工具层
│   ├── api-client.ts       # Ky HTTP 客户端（含 Zod 验证）
│   ├── env.ts              # 环境变量验证
│   └── utils.ts            # 工具函数（cn、tailwind-merge 等）
│
├── types/                  # 全局共享类型
│   └── api.d.ts            # API 响应包装器、通用类型
│
├── routes/                 # 文件路由（TanStack Router）
│   └── *.tsx               # 路由文件（自动生成路由树）
│
├── mocks/                  # MSW 模拟处理器
│   ├── browser.ts          # MSW 浏览器设置
│   └── handlers.ts         # API 模拟处理器
│
├── test/                   # 测试配置
│   └── setup.ts            # Vitest 全局设置
│
├── main.tsx                # 应用入口
└── routeTree.gen.ts        # 自动生成的路由树（请勿编辑）
```

## 🎯 核心开发模式

### API 层模式

每个 API 文件遵循以下结构：

```typescript
// 1. 定义 Zod Schema（DTO）
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

// 2. 推导 TypeScript 类型
export type User = z.infer<typeof UserSchema>;

// 3. 定义获取函数（含运行时验证）
const getUser = async (id: string) => {
  const json = await api.get(`users/${id}`).json();
  return UserSchema.parse(json); // 快速失败，Schema 不匹配时报错
};

// 4. 导出 React Query Hook
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
  });
}
```

### 表单处理模式

```typescript
// 1. 定义表单 Schema
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// 2. 在组件中使用
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { email: '', password: '' },
});

// 3. 提交处理
const onSubmit = (data: z.infer<typeof formSchema>) => {
  // data 已经过类型验证
};
```

## ⚙️ 配置说明

### 环境变量

在 `.env` 文件中配置：

```env
VITE_API_BASE_URL=http://localhost:5173/api
VITE_APP_TITLE=IDEAL Template
```

环境变量通过 `@t3-oss/env-core` 进行类型验证，在 `src/lib/env.ts` 中定义。

### API 模拟（MSW）

- MSW 仅在开发环境启用
- 首次使用需运行 `pnpm msw:init` 生成 Service Worker
- 在 `src/mocks/handlers.ts` 中定义模拟接口

### 路由

- 使用文件路由，路由文件位于 `src/routes/`
- 路由树自动生成，无需手动维护
- 支持类型安全的路由参数和搜索参数

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch
```

- 单元测试：与源文件同目录，使用 `.test.ts` 后缀
- 组件测试：使用 Testing Library 进行用户交互测试
- API 模拟：MSW 拦截开发环境的网络请求

## 🔧 代码规范

- **文件命名**：`kebab-case.ts` 或 `kebab-case.tsx`
- **组件命名**：`PascalCase` 函数名
- **Hook 命名**：`useCamelCase` 函数名
- **类型/接口**：`PascalCase`（无 `I` 前缀）
- **导入别名**：`@/*` 映射到 `src/*`

### Git Hooks

项目配置了 pre-commit hooks，提交前自动运行：
- `pnpm lint` - 代码检查
- `pnpm typecheck` - 类型检查

## 📚 更多文档

- [完整技术规范](docs/Specifications.md) - 详细的架构设计和开发规范
- [shadcn/ui 文档](https://ui.shadcn.com/) - UI 组件使用指南
- [TanStack Router 文档](https://tanstack.com/router) - 路由系统文档
- [TanStack Query 文档](https://tanstack.com/query) - 数据获取和缓存

## 📄 许可证

MIT License
