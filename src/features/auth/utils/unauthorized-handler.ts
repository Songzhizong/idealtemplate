import { showUnauthorizedDialog } from "@/features/auth"
import { authStore } from "@/lib/auth-store"

/**
 * 未授权处理器的状态管理
 */
let unauthorizedTimer: NodeJS.Timeout | null = null
let isUnauthorizedHandling = false

/**
 * 处理未授权后的重定向逻辑
 */
function handleUnauthorizedRedirect() {
	authStore.getState().logout()
	const currentPath = window.location.pathname
	if (!currentPath.includes("/login")) {
		// 不重置标志位，让页面刷新后自动重置
		// 这样可以防止在跳转过程中再次触发弹框
		window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
	} else {
		// 如果已经在登录页，重置标志位
		isUnauthorizedHandling = false
	}
}

/**
 * 创建防抖的未授权处理器
 *
 * 防止同一页面多个接口同时返回 401 时重复触发
 * 使用防抖机制确保只显示一次模态框并执行一次重定向
 *
 * @param debounceMs - 防抖延迟时间（毫秒），默认 300ms
 * @returns 防抖后的未授权处理函数
 */
export function createDebouncedUnauthorizedHandler(debounceMs = 300) {
	return () => {
		// 如果已经在登录页，不需要处理
		if (window.location.pathname.includes("/login")) {
			return
		}

		// 如果已经在处理中，直接返回
		if (isUnauthorizedHandling) {
			return
		}

		// 清除之前的定时器
		if (unauthorizedTimer) {
			clearTimeout(unauthorizedTimer)
		}

		// 设置新的定时器，debounceMs 内的多次调用只执行一次
		unauthorizedTimer = setTimeout(async () => {
			isUnauthorizedHandling = true

			// 显示模态框并等待用户确认
			await showUnauthorizedDialog({
				title: "登录已过期",
				description: "您的登录状态已过期，请重新登录。",
				confirmText: "确认",
				onConfirm: handleUnauthorizedRedirect,
			})
		}, debounceMs)
	}
}
