import { setupWorker } from "msw/browser"
import { env } from "@/lib/env"
import { handlers } from "@/mocks/handlers"

export const worker = setupWorker(...handlers)

export async function enableMocking() {
	if (env.VITE_ENABLE_MOCK !== "true") {
		return
	}

	console.log("Starting MSW...")
	await worker.start({
		onUnhandledRequest: "bypass",
	})
	console.log("[MSW] Mocking enabled.")
}
