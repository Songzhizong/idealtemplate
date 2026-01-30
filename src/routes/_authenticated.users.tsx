import { createFileRoute, redirect } from "@tanstack/react-router"
import { UsersPage } from "@/features/users"
import { authStore } from "@/lib/auth-store"

export const Route = createFileRoute("/_authenticated/users")({
	beforeLoad: () => {
		const { hasPermission } = authStore.getState()
		if (!hasPermission("users:read")) {
			throw redirect({
				to: "/errors/403",
			})
		}
	},
	component: UsersPage,
})
