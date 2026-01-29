import type { ReactNode } from "react"
import { useAuthStore } from "@/lib/auth-store"
import type { Permission } from "@/types/auth"

type PermissionGuardProps = {
	/**
	 * 需要的权限（单个或多个）
	 */
	permission?: Permission | Permission[]

	/**
	 * 权限检查模式
	 * - "any": 拥有任意一个权限即可（OR 逻辑）
	 * - "all": 必须拥有所有权限（AND 逻辑）
	 */
	mode?: "any" | "all"

	/**
	 * 有权限时渲染的内容
	 */
	children: ReactNode

	/**
	 * 无权限时渲染的内容（可选）
	 */
	fallback?: ReactNode
}

/**
 * Permission Guard Component
 * 根据用户权限控制组件渲染
 *
 * @example
 * // 单个权限
 * <PermissionGuard permission="user:delete">
 *   <Button>Delete User</Button>
 * </PermissionGuard>
 *
 * @example
 * // 多个权限（任意一个）
 * <PermissionGuard permission={["user:edit", "user:delete"]} mode="any">
 *   <Button>Manage User</Button>
 * </PermissionGuard>
 *
 * @example
 * // 多个权限（全部需要）
 * <PermissionGuard permission={["admin:read", "admin:write"]} mode="all" fallback={<p>Access Denied</p>}>
 *   <AdminPanel />
 * </PermissionGuard>
 */
export function PermissionGuard({
	permission,
	mode = "all",
	children,
	fallback = null,
}: PermissionGuardProps) {
	const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore()

	// 如果没有指定权限，直接渲染（相当于无权限检查）
	if (!permission) {
		return children
	}

	// 单个权限检查
	if (typeof permission === "string") {
		return hasPermission(permission) ? children : fallback
	}

	// 多个权限检查
	const hasAccess = mode === "any" ? hasAnyPermission(permission) : hasAllPermissions(permission)

	return hasAccess ? children : fallback
}
