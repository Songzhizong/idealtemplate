import { createFileRoute, redirect } from "@tanstack/react-router"
import { PERMISSIONS } from "@/config/permissions"
import { UsersPage } from "@/features/users"
import { authStore } from "@/lib/auth-store"

export const Route = createFileRoute("/_authenticated/users")({
	beforeLoad: () => {
		const { hasPermission } = authStore.getState()
		if (!hasPermission(PERMISSIONS.USERS_READ)) {
			throw redirect({
				to: "/errors/403",
			})
		}
	},
	component: UsersPage,
	staticData: {
		title: "用户管理",
	},
})
