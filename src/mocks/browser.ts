import { setupWorker } from "msw/browser"
import { env } from "@/lib/env"
import { handlers } from "@/mocks/handlers"

export const worker = setupWorker(...handlers)

export async function enableMocking() {
	// 只在 VITE_ENABLE_MOCK=true 时启用 MSW
	// 用于开发环境或静态部署（如 GitHub Pages）
	if (env.VITE_ENABLE_MOCK !== "true") {
		return
	}

	console.log("Starting MSW...")
	await worker.start({
		onUnhandledRequest: "bypass",
	})
	console.log("[MSW] Mocking enabled.")
}
