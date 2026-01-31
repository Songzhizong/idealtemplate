import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { queryClient } from "@/app/query-client"
import { useLogout } from "@/features/auth"
import { useAuthStore } from "@/lib/auth-store"

/**
 * Hook to handle logout logic
 */
export function useLogoutHandler() {
	const navigate = useNavigate()
	const logoutMutation = useLogout()
	const isLoggingOut = logoutMutation.isPending

	const handleLogout = async () => {
		try {
			// 1. 调用退出登录接口 (via Mutation)
			const data = await logoutMutation.mutateAsync()

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
			// 性能优化: 使用 getState() 调用 action,不会触发订阅
			useAuthStore.getState().logout()

			// 3. 提示并跳转
			toast.success("已成功退出登录")
			void navigate({ to: "/login" })
		} catch (error) {
			console.error("Logout error:", error)
			// 即使接口失败，也要确保本地状态清除
			queryClient.clear()
			useAuthStore.getState().logout()
			void navigate({ to: "/login" })
		}
	}

	return {
		handleLogout,
		isLoggingOut,
	}
}
