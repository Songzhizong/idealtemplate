import { createFileRoute, redirect } from "@tanstack/react-router"
import { LoginPage } from "@/features/auth/components/login-page"
import { authStore } from "@/lib/auth-store"

export const Route = createFileRoute("/_blank/login")({
	beforeLoad: ({ location }) => {
		// Redirect to home if already authenticated
		if (authStore.getState().isAuthenticated) {
			throw redirect({
				to: "/",
				search: {
					redirect: location.href,
				},
			})
		}
	},
	component: LoginPage,
})
