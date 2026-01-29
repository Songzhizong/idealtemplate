import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { BaseLayout } from "@/components/layout/base-layout"
import { authStore, useAuthStore } from "@/lib/auth-store"

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ location }) => {
		// Redirect to login if not authenticated
		if (!authStore.getState().isAuthenticated) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			})
		}
	},
	component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
	const isAuthenticated = authStore((state) => state.isAuthenticated)

	// If not authenticated, don't render children to avoid triggering any authenticated queries
	// while the router is redirecting.
	if (!isAuthenticated) {
		return null
	}

	return (
		<BaseLayout>
			<Outlet />
		</BaseLayout>
	)
}
