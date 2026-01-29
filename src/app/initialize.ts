/**
 * Application Initialization
 *
 * 在应用启动前配置全局基础设施
 * 这里是配置跨层依赖的正确位置
 */

import { authStore } from "@/lib/auth-store"
import { configureApiClient } from "@/lib/api-client"

/**
 * 配置 API Client 的认证行为
 * 注入 Auth 业务逻辑到基础设施层
 */
export function initializeApiClient() {
	configureApiClient({
		getToken: () => authStore.getState().token,
		getTenantId: () => {
			const state = authStore.getState()
			return state.tenantId ?? state.user?.tenantId ?? null
		},
		onUnauthorized: () => {
			authStore.getState().logout()
			const currentPath = window.location.pathname
			if (!currentPath.includes("/login")) {
				window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
			}
		},
	})
}

/**
 * 初始化所有全局配置
 * 在应用渲染前调用
 */
export function initializeApp() {
	initializeApiClient()
	initializeClickTracker()
}

/**
 * 追踪最后一次点击的位置，用于动画起源点
 */
function initializeClickTracker() {
	if (typeof window === "undefined") return

	document.addEventListener(
		"mousedown",
		(e) => {
			const cx = window.innerWidth / 2
			const cy = window.innerHeight / 2
			// 计算点击位置相对于中心点的偏移量（缩放 10% 作为一个起始点的微调）
			const dx = (e.clientX - cx) * 0.1
			const dy = (e.clientY - cy) * 0.1

			document.documentElement.style.setProperty("--last-click-x", `${e.clientX}px`)
			document.documentElement.style.setProperty("--last-click-y", `${e.clientY}px`)
			document.documentElement.style.setProperty("--last-click-offset-x", `${dx}px`)
			document.documentElement.style.setProperty("--last-click-offset-y", `${dy}px`)
		},
		true,
	)
}
