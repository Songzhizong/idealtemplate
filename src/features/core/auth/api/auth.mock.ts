import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/mocks/registry"
import { PERMISSIONS } from "@/types/auth"
import { LoginResponseType } from "./login"

export const authHandlers = [
	// Check Captcha
	http.post("*/nexus-api/iam/login/captcha/check", async () => {
		await delay(200)
		return HttpResponse.json({
			required: false, // Set to true to test captcha flow
		})
	}),

	// Generate Captcha
	http.get("*/nexus-api/iam/captcha/generate", async () => {
		await delay(200)
		return HttpResponse.json({
			imageBase64:
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
			provider: "mock",
		})
	}),

	// Password Login
	http.post("*/nexus-api/iam/login/password", async () => {
		await delay(500)
		return HttpResponse.json({
			type: LoginResponseType.SELECT_ACCOUNT,
			selectAccountTicket: {
				ticket: "mock-select-ticket-123",
				accounts: [
					{
						uid: "1",
						account: "张三",
						phone: "138****8888",
						email: "zhangsan@cloudcompute.com",
						registrationTime: Date.now() - 1000 * 60 * 60 * 24 * 365,
						lastActiveTime: Date.now() - 1000 * 60 * 60 * 2,
						blocked: false,
						accountExpired: false,
					},
					{
						uid: "2",
						account: "张三 (企业账号)",
						phone: "138****8888",
						email: "zhangsan@enterprise.com",
						registrationTime: Date.now() - 1000 * 60 * 60 * 24 * 30 * 6,
						lastActiveTime: Date.now() - 1000 * 60 * 60 * 24,
						blocked: false,
						accountExpired: false,
					},
				],
			},
		})
	}),

	// Select Account
	http.post("*/nexus-api/iam/login/select-account", async () => {
		await delay(500)
		return HttpResponse.json({
			type: LoginResponseType.TOKEN,
			token: {
				token_type: "Bearer",
				access_token: "mock-token-selected-456",
			},
		})
	}),

	// Get Permissions
	http.get("*/nexus-api/iam/front/apps/:appId/available-permission-idents", async () => {
		await delay(200)
		return HttpResponse.json([PERMISSIONS.USERS_READ])
	}),

	// Logout
	http.post("*/nexus-api/iam/logout", async () => {
		await delay(200)
		return HttpResponse.json({
			logoutIframeUris: [],
		})
	}),
]

// 主动注入
mockRegistry.register(...authHandlers)
