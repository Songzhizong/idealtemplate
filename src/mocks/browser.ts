import { setupWorker } from "msw/browser"
import { env } from "@/lib/env"
import { handlers } from "@/mocks/handlers"

export const worker = setupWorker(...handlers)

export async function enableMocking() {
	// 在开发模式下需要显式启用 VITE_ENABLE_MOCK
	// 在生产模式下也可以通过 VITE_ENABLE_MOCK=true 启用（用于 GitHub Pages 等静态部署）
	if (import.meta.env.DEV && env.VITE_ENABLE_MOCK !== "true") {
		return
	}

	if (!import.meta.env.DEV && env.VITE_ENABLE_MOCK !== "true") {
		return
	}

	console.log("Starting MSW...")
	await worker.start({
		onUnhandledRequest: "bypass",
	})
	console.log("[MSW] Mocking enabled.")
}
