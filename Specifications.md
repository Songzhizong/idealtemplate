# 面向 AI 的前端架构规范

## 1. 核心设计理念

*   **Type-Driven (类型驱动)**: 先定义 Schema (DTO)，再生成 UI。这是连接后端思维与前端工程的桥梁。
*   **Colocation (同位共存)**: 将功能相关的代码（API、类型、组件、路由）放在一起，而非按文件类型拆分，减少 AI 检索上下文的幻觉。
*   **Fail Fast (快速失败)**: HTTP 响应必须经过 Zod 运行时校验，后端接口变更时前端立即报错，而非 UI 渲染时崩溃。
*   **AI-First Configuration**（以 Cursor 为例）: 通过 `.cursorrules` 和强类型推断，最大化 AI 辅助编程的准确率。

---

## 2. 技术栈选型

| 类别              | 技术                         | 核心价值 / 备注                                             |
|:----------------|:---------------------------|:------------------------------------------------------|
| **语言**          | **TypeScript 5+**          | 开启 `strict: true`，禁止 `any`。                           |
| **框架**          | **React 19**               | 使用最新的 Hooks 生态。                                       |
| **构建**          | **Vite**                   | 极速 HMR。                                               |
| **测试框架**        | **Vitest**                 | 与 Vite 原生集成，极速单元测试。                                   |
| **组件测试**        | **Testing Library**        | 测试用户交互行为。                                             |
| **包管理器**        | **pnpm**                   | **严格依赖管理**，杜绝幽灵依赖；安装速度快，节省磁盘空间。                       |
| **样式**          | **Tailwind CSS 4.0**       | 原子化 CSS，AI 生成准确率极高。                                   |
| **UI 组件**       | **shadcn/ui**              | 基于 **Radix UI (无头组件)** 和 Tailwind 构建，兼顾极致的可访问性与定制自由度。 |
| **图标**          | **Lucide React**           | 统一风格。                                                 |
| **路由**          | **TanStack Router**        | **文件路由**，全类型安全的路由参数管理。                                |
| **服务端状态**       | **TanStack Query (v5)**    | 替代 useEffect 获取数据，处理缓存/重试。                            |
| **客户端状态**       | **Zustand**                | 仅用于全局非业务状态（如 Sidebar 展开/收起）。                          |
| **URL 状态**      | **Nuqs**                   | 类型安全的 URL 参数管理（筛选、分页）。                                |
| **契约/校验**       | **Zod**                    | Single Source of Truth，定义所有数据结构。                      |
| **环境配置**        | **@t3-oss/env-core**       | 环境变量类型校验，防止 `process.env` 拼写错误。                       |
| **HTTP**        | **Ky**                     | **基于 Fetch API**，轻量 (~3kb)，内置重试机制。                    |
| **API Mock**    | **MSW**                    | 定义 Zod 后直接生成 Mock 接口，前后端并行开发。                         |
| **Lint/Format** | **Biome**                  | 替代 ESLint + Prettier，速度更快，配置更少。                       |
| **日期时间**        | **date-fns (v4)**          | **函数式编程**，Tree-shakable。                              |
| **图表**          | **Recharts**               | **Shadcn/ui Charts** 的底层依赖。                           |
| **动画**          | **Motion** (Framer Motion) | 简单的用 Tailwind class，复杂的用 Motion。                      |
| **类型增强**        | **ts-reset**               | 修复 TS 内置类型的缺陷，消灭隐式 any。                               |

---

## 3. 目录结构 (Domain Driven Design)

采用 **Feature-based** 结构

```text
src/
├── app/                  # 全局应用配置
│   ├── provider.tsx      # QueryClientProvider, Toaster 等包裹器
│   ├── router.tsx        # TanStack Router 根定义
│   └── globals.css       # Tailwind 引入
├── assets/               # 静态资源
├── components/           # 公共/基础 UI 组件
│   ├── ui/               # shadcn/ui 组件 (Button, Input, Form...)
│   └── common/           # 项目级通用组件 (PageContainer, DataTable...)
├── hooks/                # 全局通用 Hooks (use-mobile, use-debounce...)
├── lib/                  # 基础设施库 (Infrastructure)
│   ├── api-client.ts     # [核心] 封装 Zod 校验与 Toast 报错的 Ky 实例
│   ├── env.ts            # T3 Env 环境变量校验
│   └── utils.ts          # tailwind-merge 等工具
├── types/                # 全局共享类型 (如 API 响应包裹层)
│   └── api.d.ts
├── features/             # [核心] 业务功能模块
│   └── dashboard/        # 示例模块
│       ├── api/          # API 定义层
│       │   ├── get-stats.ts   # 包含 Schema, Type, QueryHook
│       │   └── update-profile.ts # 包含 Schema, MutationHook
│       ├── components/   # 模块私有组件
│       │   ├── stats-card.tsx
│       │   └── profile-form.tsx  # 包含表单逻辑
│       └── routes/       # 路由文件 (若使用文件路由则位于 src/routes/dashboard)
└── main.tsx              # 入口文件
```

---

## 4. AI 编码指令配置 (.cursorrules)

在项目根目录创建 `.cursorrules` 文件，这是给 AI 的“系统提示词”。

````markdown
# .cursorrules

You are an expert Full-Stack Developer utilizing React 19, TypeScript, Vite, Tailwind CSS, TanStack Router, and TanStack Query.
Your mindset maps Backend concepts (DTO, Controller, Service) to Frontend patterns (Zod Schema, Api Layer, Query Hooks).

## General Rules
- **Strict TypeScript**: Never use `any`. Use `unknown` and strict type guards/zod parsing.
- **Functional Components**: Use `export function ComponentName() {}`.
- **Shadcn UI**: Always use components from `@/components/ui`. Do not invent new UI styles unless necessary.
- **Tailwind**: Use utility classes. No CSS modules. Use `clsx` and `tailwind-merge` for conditional classes.
- **HTTP Client**: Use `ky` exclusively. Do not use `axios` or native `fetch`.
- **Dark Mode Compatibility**: When defining colors, ALWAYS use Shadcn's semantic variables (e.g., `bg-background`, `text-muted-foreground`, `border-border`) instead of hardcoded colors (e.g., `bg-white`, `text-gray-500`). This ensures automatic dark mode support.

## Tooling & Package Management
- **Package Manager**: Exclusively use **pnpm**.
- **Commands**:
  - Install: `pnpm install`
  - Add: `pnpm add <package>` (or `pnpm add -D <package>` for devDeps)
  - Run: `pnpm dev`, `pnpm build`, `pnpm test`
- **Strictness**: pnpm is strict by default. If a dependency is missing, do not assume it is hoisted. Add it explicitly to `package.json`.

## Architecture Guidelines (Feature-Based)
1. **Schema First (DTO)**: Before writing components, define the data structure using Zod in the `api` folder.
2. **API Layer**:
   - Use `ky` to fetch data. Always use `.json()` to extract the body.
   - APIs must return parsed Zod data.
   - Use `useQuery` for GET and `useMutation` for POST/PUT/DELETE.
3. **State Management**:
   - Server State -> React Query.
   - URL State (Search/Pagination) -> `nuqs`.
   - Global UI State -> Zustand.
   - **Form State -> React Hook Form + Zod Resolver**.

## Form Handling (Strict Rules)
- Always use `react-hook-form` controlled by `zodResolver`.
- Do NOT use `useState` for form fields.
- Define the form schema using Zod immediately before the component or in the `api` folder.
- Example Pattern:
  ```tsx
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ... }
  })
  ```

## Error Handling
- **Global**: Do not manually `try/catch` API calls in components for generic errors (401/500). The `api-client` (Ky hooks) handles these via `sonner`.
- **Form Errors**: Use `form.setError` for server-side validation errors (422).

## Code Style
- Filenames: `kebab-case.ts/tsx`
- Component Names: `PascalCase`
- Hook Names: `useCamelCase`
- Interface/Type Names: `PascalCase` (No `I` prefix)

## Example: API & Hook Definition
```typescript
// features/users/api/get-user.ts
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

// 1. Define Schema (DTO)
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type User = z.infer<typeof UserSchema>;

// 2. Define Fetcher (Using Ky)
const getUser = async (id: string) => {
  // Use .json<T>() isn't enough, we must validate with Zod
  const json = await api.get(`users/${id}`).json();
  return UserSchema.parse(json); // Runtime Validation (Fail Fast)
};

// 3. Define Hook
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
  });
};
```
````

---

## 5. 核心架构模式规范

### 5.1 HTTP 请求层封装 (基础设施)

在 `src/lib/api-client.ts` 中实现 Ky 实例配置，替代传统的 Axios Interceptors。

```typescript
import ky from 'ky';
import { env } from '@/lib/env';

export const api = ky.create({
  prefixUrl: env.VITE_API_BASE_URL,
  timeout: 10000,
  retry: {
    limit: 2, // 自动重试失败请求 (Ky 内置特性)
    methods: ['get'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem('token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          // Ky 默认会抛出 HTTPError，这里主要处理业务逻辑副作用
          if (response.status === 401) {
             // 处理 Token 过期跳转
             window.location.href = '/login';
          }
          // 可以结合 sonner 进行全局 toast 提示
        }
        return response;
      },
    ],
  },
});
```

### 5.2 数据获取流程 (Standard Flow)

1.  **定义 Schema**: 在 features/xxx/api 中定义 Zod Schema。
2.  **编写 Hook**: 封装 useQuery (GET) 或 useMutation (POST)。
    *   **注意**: Ky 的 `.json()` 返回 Promise，且若 Status Code 非 2xx 会自动抛错，刚好被 TanStack Query 捕获。
3.  **UI 消费**: 组件直接调用 Hook，获得强类型数据。

### 5.3 表单处理流程 (Form Flow)

使用 **React Hook Form** + **Zod**，这是 AI 写代码最容易出错的地方，需严格规范：

1.  **Schema 定义**:
    ```typescript
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });
    ```
2.  **Hook 初始化**:
    ```typescript
    const form = useForm({ resolver: zodResolver(loginSchema) });
    ```
3.  **UI 绑定**: 使用 Shadcn 的 `<Form>` 组件包裹，AI 能自动生成带 `<FormControl>`, `<FormMessage>` 的标准代码。

### 5.4 路由鉴权 (Auth Guard)

利用 TanStack Router 的 `beforeLoad` 生命周期进行权限控制，避免在 useEffect 中跳转。

```typescript
// src/routes/_authenticated.tsx (示例)
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
```

---

## 6. 开发环境与工作流

*   **Setup**:
    - VSCode 插件: Biome, Tailwind CSS IntelliSense, Pretty TypeScript Errors.
*   **Git Hooks**:
    *   配置 simple-git-hooks，在 Commit 前强制运行 `biome check` 和 `tsc --noEmit`。确保没有类型错误的代码才能提交。
*   **Mocking**:
    *   开发初期后端未就绪时，使用 **MSW (Mock Service Worker)**。
    *   MSW 原生拦截 Fetch API，与 Ky 配合比 Axios 更顺滑（无需 Adapter）。
    *   **技巧**: 让 AI 根据你定义好的 Zod Schema 自动生成 Mock Data (faker.js)。

### 包管理器规范 (Package Management)

- **Engine Locking**: 在 package.json 中强制锁定 pnpm 和 Node 版本，防止版本不一致导致的构建错误。

- **Setup (初始化)**: 推荐使用 Node.js 内置的 Corepack 启用 pnpm，无需全局安装。
  `corepack enable && corepack prepare pnpm@latest --activate`

- **Workflow**: 始终提交 `pnpm-lock.yaml` 文件。不要提交 `node_modules`。

---

## 7. 给开发者的建议

1.  **相信类型**: 如果出现红色波浪线，不要用 `as any` 解决。这通常意味着你的 Schema 定义和后端返回不一致，或者逻辑有漏洞。
2.  **AI 结对**: 遇到复杂的类型定义（如泛型组件），直接把 Zod Schema 发给 Cursor，让它帮你写 Types。
3.  **保持原子化**: 一个文件尽量只做一件事。如果组件超过 200 行，考虑拆分出子组件放在同级目录。
