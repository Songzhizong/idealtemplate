# Auth Feature - DDD 架构原则

## 🎯 核心理念：Colocation（同位共存）

Auth 模块遵循 **领域驱动设计 (DDD)** 和 **Colocation** 原则，将所有相关代码放在一起，而不是按文件类型分散到不同目录。

---

## 📦 Auth 作为一个"内部 NPM 包"

### 心态转变

不要把 `features/auth` 看作是"私有闭包"，而要把它看作是一个 **内部 NPM 包**：

```typescript
// 就像使用 NPM 包一样
import { useAuth, User, Permission } from "@/features/auth"

// 而不是从全局目录导入
// ❌ import { User } from "@/types/user"
// ❌ import { useAuth } from "@/hooks/use-auth"
```

---

## 🗂️ 完整的文件结构

```
src/features/auth/
├── types/
│   └── index.ts                    # ✅ User, Permission, AuthResponse (Schema + Types)
│
├── api/
│   ├── login.ts                    # ✅ POST /auth/login
│   ├── logout.ts                   # ✅ POST /auth/logout
│   └── get-current-user.ts         # ✅ GET /auth/me
│
├── hooks/
│   └── use-auth.ts                 # ✅ 统一 Hook（整合所有功能）
│
├── components/
│   ├── permission-guard.tsx        # ✅ 权限守卫组件
│   └── login-form.tsx              # ✅ 登录表单
│
└── index.ts                        # ⭐ Public API（模块的公共入口）
```

---

## 🔑 关键设计：index.ts 作为 Public API

### src/features/auth/index.ts

```typescript
/**
 * Auth Feature - Public API
 *
 * 这是 Auth 模块的公共入口，类似于 NPM 包的 index.ts
 * 其他模块应该从这里导入，而不是直接访问内部文件
 */

// ============================================
// Types & Schemas (Public API)
// ============================================
export type { User, Permission, AuthResponse } from "./types"
export { UserSchema, PermissionSchema, AuthResponseSchema } from "./types"

// ============================================
// Hooks (Public API)
// ============================================
export { useAuth } from "./hooks/use-auth"
export { useAuthStore } from "@/lib/auth-store"

// ============================================
// API Hooks (Public API)
// ============================================
export { useLogin, useLogout, useCurrentUser } from "./api/..."

// ============================================
// Components (Public API)
// ============================================
export { PermissionGuard, LoginForm } from "./components/..."
```

---

## ✅ 正确的使用方式

### 在其他 Feature 中使用

```typescript
// ✅ 正确：从 auth 模块的公共入口导入
import { useAuth, User, Permission } from "@/features/auth"

// src/features/dashboard/components/header.tsx
export function Header() {
  const { user, logout } = useAuth()

  return (
    <header>
      <span>Welcome, {user?.name}</span>
      <button onClick={() => logout()}>Logout</button>
    </header>
  )
}
```

### 在路由守卫中使用

```typescript
// src/routes/_authenticated.tsx
import { authStore } from "@/lib/auth-store"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = authStore.getState()

    if (!isAuthenticated) {
      throw redirect({ to: "/login" })
    }
  },
})
```

---

## 🚫 避免的反模式

### ❌ 反模式 1：按文件类型分类

```
src/
├── types/
│   ├── user.ts          # ❌ User 类型
│   ├── auth.ts          # ❌ Auth 类型
│   └── product.ts       # ❌ Product 类型
├── hooks/
│   ├── use-auth.ts      # ❌ Auth Hook
│   └── use-user.ts      # ❌ User Hook
└── api/
    ├── auth.ts          # ❌ Auth API
    └── user.ts          # ❌ User API
```

**问题**：修改"用户头像字段"时，需要在 3 个不同目录间跳转。

### ❌ 反模式 2：直接访问内部文件

```typescript
// ❌ 错误：绕过 Public API，直接访问内部文件
import { User } from "@/features/auth/types"
import { useAuth } from "@/features/auth/hooks/use-auth"
```

**问题**：破坏了模块封装，内部重构会影响所有使用者。

### ❌ 反模式 3：Global 垃圾桶效应

```
src/
├── global/
│   ├── user.ts          # ❌ 因为多个页面用
│   ├── product.ts       # ❌ 因为购物车和订单都用
│   └── order.ts         # ❌ 因为历史记录和详情都用
```

**问题**：最后所有业务逻辑都变成 Global，目录结构失去分类意义。

---

## 📊 依赖方向原则

### 健康的依赖关系

```
┌─────────────────────────────────────────┐
│  Features (业务功能层)                   │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ Dashboard   │  │   Orders    │      │
│  └──────┬──────┘  └──────┬──────┘      │
│         │                │              │
│         └────────┬───────┘              │
│                  ↓                      │
│         ┌────────────────┐              │
│         │     Auth       │ ← 基础 Feature │
│         └────────────────┘              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Lib (基础设施层)                        │
│  ┌────────────┐  ┌────────────┐        │
│  │ auth-store │  │ api-client │        │
│  └────────────┘  └────────────┘        │
└─────────────────────────────────────────┘
```

### 依赖规则

1. ✅ **Dashboard → Auth**（业务层依赖基础 Feature）
2. ✅ **Orders → Auth**（业务层依赖基础 Feature）
3. ✅ **Auth → Lib**（Feature 依赖基础设施层）
4. ❌ **Auth → Dashboard**（避免循环依赖）
5. ❌ **Lib → Features**（基础设施层不应依赖业务层）

---

## 🎯 高内聚的优势

### 1. 修改时只需关注一个目录

```
# 需求：给 User 添加 "avatar" 字段

修改文件：
✅ src/features/auth/types/index.ts        # 更新 Schema
✅ src/features/auth/components/header.tsx # 显示头像
✅ src/features/auth/api/get-current-user.ts # API 返回头像

所有修改都在 features/auth/ 目录内！
```

### 2. AI 更容易理解上下文

```
# AI 看到路径就知道业务上下文
src/features/auth/...        → 这是认证相关的代码
src/features/dashboard/...   → 这是仪表盘相关的代码
src/features/orders/...      → 这是订单相关的代码
```

### 3. 模块可以独立测试和维护

```typescript
// 测试 Auth 模块时，只需关注 features/auth/
describe("Auth Feature", () => {
  it("should login successfully", () => {
    // 所有相关代码都在同一个目录
  })
})
```

---

## 🔄 与传统架构的对比

### 传统架构（按文件类型分类）

```
修改 User 头像字段：
1. src/types/user.ts           # 更新类型
2. src/api/user.ts             # 更新 API
3. src/hooks/use-user.ts       # 更新 Hook
4. src/components/Header.tsx   # 更新 UI

需要在 4 个不同目录间跳转！
```

### DDD 架构（按业务领域分类）

```
修改 User 头像字段：
1. src/features/auth/types/index.ts
2. src/features/auth/api/get-current-user.ts
3. src/features/auth/components/header.tsx

所有修改都在 features/auth/ 内！
```

---

## 📚 实际案例

### 案例 1：Dashboard 使用 Auth

```typescript
// src/features/dashboard/components/stats-card.tsx
import { useAuth } from "@/features/auth"

export function StatsCard() {
  const { user, hasPermission } = useAuth()

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      {hasPermission("stats:view") && <StatsChart />}
    </div>
  )
}
```

### 案例 2：Orders 使用 Auth

```typescript
// src/features/orders/api/create-order.ts
import type { User } from "@/features/auth"

export const createOrder = async (userId: User["id"]) => {
  // 使用 Auth 模块导出的类型
}
```

### 案例 3：Profile 使用 Auth

```typescript
// src/features/profile/components/profile-form.tsx
import { useAuth, type User } from "@/features/auth"

export function ProfileForm() {
  const { user, refetchUser } = useAuth()

  // 编辑用户信息
}
```

---

## 🎓 最佳实践总结

1. **定义位置**：所有 Auth 相关代码（类型、API、组件、Hook）都放在 `features/auth/`
2. **复用方式**：通过 `@/features/auth` 导出给全局使用
3. **心态转变**：把 `features/auth` 看作一个内部 NPM 包
4. **依赖方向**：其他 Feature 可以依赖 Auth，但 Auth 不应依赖其他 Feature
5. **Public API**：通过 `index.ts` 控制哪些内容对外暴露
6. **避免 Global**：不要因为"多个页面复用"就把代码移到 `src/global`

---

## 🚀 迁移指南

如果你的项目还在使用传统架构，可以这样迁移：

### 步骤 1：创建 Feature 目录

```bash
mkdir -p src/features/auth/{types,api,hooks,components}
```

### 步骤 2：移动文件

```bash
# 移动类型定义
mv src/types/user.ts src/features/auth/types/index.ts

# 移动 API
mv src/api/auth.ts src/features/auth/api/

# 移动 Hooks
mv src/hooks/use-auth.ts src/features/auth/hooks/
```

### 步骤 3：创建 Public API

```typescript
// src/features/auth/index.ts
export * from "./types"
export * from "./hooks/use-auth"
export * from "./api/..."
export * from "./components/..."
```

### 步骤 4：更新导入路径

```typescript
// 全局搜索替换
// 从: import { User } from "@/types/user"
// 到: import { User } from "@/features/auth"
```

---

## 🎉 总结

Auth Feature 现在是一个**高内聚、低耦合**的模块：

- ✅ 所有相关代码都在 `features/auth/` 目录
- ✅ 通过 `index.ts` 提供清晰的 Public API
- ✅ 其他模块可以安全地依赖它
- ✅ 内部重构不影响外部使用者
- ✅ AI 可以通过路径快速理解业务上下文

这就是 **领域驱动设计 (DDD)** 在前端架构中的最佳实践！
