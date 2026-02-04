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
				"data:image/png;base64,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",
			provider: "classic",
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
