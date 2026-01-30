import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { queryClient } from "@/app/query-client"
import { useAuthContext } from "@/context/auth-context"
import { useAuthStore } from "@/lib/auth-store"

/**
 * Hook to handle logout logic
 */
export function useLogoutHandler() {
	const navigate = useNavigate()
	const authStore = useAuthStore()
	const { logout: logoutApi, isLoggingOut } = useAuthContext()

	const handleLogout = async () => {
		try {
			// 1. 调用退出登录接口 (via Context)
			const data = await logoutApi()

			// 2. 立即清除查询缓存并停止所有请求
			// 这一步非常重要，可以防止页面在跳转过程中继续发起已认证的请求
			await queryClient.cancelQueries()
			queryClient.clear()

			// 3. 处理单点登录登出 (Iframes)
			if (data.logoutIframeUris && data.logoutIframeUris.length > 0) {
				data.logoutIframeUris.forEach((uri) => {
					const iframe = document.createElement("iframe")
					iframe.style.display = "none"
					iframe.src = uri
					document.body.appendChild(iframe)

					// 稍后移除 iframe 以保持 DOM 清洁
					setTimeout(() => {
						if (document.body.contains(iframe)) {
							document.body.removeChild(iframe)
						}
					}, 3000)
				})
			}

			// 2. 清除 Store 状态
			authStore.logout()

			// 3. 提示并跳转
			toast.success("已成功退出登录")
			void navigate({ to: "/login" })
		} catch (error) {
			console.error("Logout error:", error)
			// 即使接口失败，也要确保本地状态清除
			queryClient.clear()
			authStore.logout()
			toast.error("退出登录时发生错误，已强制退出")
			void navigate({ to: "/login" })
		}
	}

	return {
		handleLogout,
		isLoggingOut,
	}
}
