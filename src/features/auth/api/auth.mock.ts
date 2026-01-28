import { delay, HttpResponse, http } from "msw"
import type { UserProfile } from "./get-current-user"
import { LoginResponseType } from "./login"

const MOCK_USER: UserProfile = {
	userId: "1",
	containerId: null,
	name: "Admin User",
	account: "admin",
	phone: "13800000000",
	email: "admin@example.com",
	mfaEnabled: false,
	tenantId: "1",
	tenantName: "Default Tenant",
	tenantAbbreviation: "DT",
	accessibleTenants: [
		{
			id: "1",
			name: "Default Tenant",
			abbreviation: "DT",
			blocked: false,
		},
	],
}

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
			type: LoginResponseType.TOKEN,
			token: {
				token_type: "Bearer",
				access_token: "mock-token-12345",
			},
		})
	}),

	// Get Current User Profile
	http.get("*/nexus-api/iam/me/profile", async () => {
		await delay(200)
		return HttpResponse.json(MOCK_USER)
	}),

	// Get Permissions
	http.get("*/nexus-api/iam/front/apps/:appId/available-permission-idents", async () => {
		await delay(200)
		return HttpResponse.json(["*", "admin", "dashboard:view"])
	}),

	// Logout
	http.post("*/nexus-api/iam/logout", async () => {
		await delay(200)
		return HttpResponse.json({
			logoutIframeUris: [],
		})
	}),
]
