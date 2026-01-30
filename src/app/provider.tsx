import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { RouterProvider } from "@tanstack/react-router"
import { NuqsAdapter } from "nuqs/adapters/react"
import { Toaster } from "sonner"
import { queryClient } from "@/app/query-client"
import { router } from "@/app/router"
import { ThemeProvider } from "@/components/theme-provider"

import { AuthProvider } from "@/features/auth/components/auth-provider"

export function AppProvider() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
					<NuqsAdapter>
						<RouterProvider router={router} />
					</NuqsAdapter>
					<Toaster position="top-center" richColors />
					{import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
				</ThemeProvider>
			</AuthProvider>
		</QueryClientProvider>
	)
}
