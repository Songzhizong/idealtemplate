import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/mocks/registry"
import type { UserProfile } from "@/types/auth"
import { Api } from "./login-log"
import type { Passkey } from "./passkey"
import type { PasswordStatus } from "./password"
import type { MySession } from "./session"

/**
 * 模拟个人中心状态
 * 通过闭包维持状态，模拟真实的业务逻辑
 */
const profileState = {
	profile: {
		userId: "1",
		containerId: null,
		name: "Github Copilot",
		account: "copilot",
		phone: "18888888888",
		email: "copilot@github.com",
		mfaEnabled: false,
		tenantId: "1",
		tenantName: "开发社区",
		tenantAbbreviation: "DEV",
		accessibleTenants: [
			{
				id: "1",
				name: "开发社区",
				abbreviation: "DEV",
				blocked: false,
			},
			{
				id: "2",
				name: "测试环境",
				abbreviation: "TEST",
				blocked: false,
			},
		],
	} as UserProfile,

	passwordStatus: {
		configured: true,
		passwordTime: new Date(Date.now() - 86400000 * 30).toISOString(),
		passwordExpireTime: new Date(Date.now() + 86400000 * 60).toISOString(),
	} as PasswordStatus,

	totp: {
		exists: false,
	},

	recoveryCodes: {
		codes: [] as string[],
		exists: false,
		remainingCount: 0,
	},

	passkeys: [
		{
			id: "pk_1",
			credentialNickname: "MacBook Pro TouchID",
			createdTime: Date.now() - 86400000 * 10,
			lastUsedTime: Date.now() - 86400000 * 2,
		},
	] as Passkey[],

	sessions: [
		{
			id: "sess_1",
			loginIp: "127.0.0.1",
			location: "本地访问",
			device: "Chrome 121 / macOS 14.2",
			loginChannel: "PASSWORD",
			latestActivity: Date.now(),
			createdTime: Date.now() - 3600000,
			current: true,
		},
		{
			id: "sess_2",
			loginIp: "192.168.1.105",
			location: "上海市",
			device: "Safari / iPhone 15 Pro",
			loginChannel: "PASSKEY",
			latestActivity: Date.now() - 7200000,
			createdTime: Date.now() - 86400000,
			current: false,
		},
	] as MySession[],
}

export const profileHandlers = [
	// 获取个人资料
	http.get("*/nexus-api/iam/me/profile", async () => {
		await delay(300)
		return HttpResponse.json(profileState.profile)
	}),

	// 获取密码状态
	http.get("*/nexus-api/iam/me/password-status", async () => {
		await delay(200)
		return HttpResponse.json(profileState.passwordStatus)
	}),

	// 修改密码
	http.post("*/nexus-api/iam/me/change-password", async () => {
		await delay(800)
		profileState.passwordStatus.passwordTime = new Date().toISOString()
		return HttpResponse.json({ success: true })
	}),

	// TOTP 状态
	http.get("*/nexus-api/iam/factor/totp/status", async () => {
		await delay(200)
		return HttpResponse.json({ exists: profileState.totp.exists })
	}),

	// 生成 TOTP QR (Base64)
	http.post("*/nexus-api/iam/factor/totp/generate_qrcode_base64", async () => {
		await delay(500)
		return HttpResponse.json({
			qrCodeBase64:
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
		})
	}),

	// 确认 TOTP
	http.post("*/nexus-api/iam/factor/totp/confirmation", async () => {
		await delay(500)
		profileState.totp.exists = true
		profileState.profile.mfaEnabled = true
		return HttpResponse.json({ success: true })
	}),

	// 删除 TOTP
	http.delete("*/nexus-api/iam/factor/totp/delete", async () => {
		await delay(500)
		profileState.totp.exists = false
		profileState.profile.mfaEnabled = false
		return HttpResponse.json({ success: true })
	}),

	// 恢复码状态
	http.get("*/nexus-api/iam/factor/recovery-code/status", async () => {
		await delay(200)
		return HttpResponse.json({
			exists: profileState.recoveryCodes.exists,
			remainingCount: profileState.recoveryCodes.remainingCount,
		})
	}),

	// 生成恢复码
	http.post("*/nexus-api/iam/factor/recovery-code/generate", async () => {
		await delay(600)
		profileState.recoveryCodes.exists = true
		profileState.recoveryCodes.remainingCount = 10
		profileState.recoveryCodes.codes = Array.from({ length: 10 }, () =>
			Math.random().toString(36).substring(2, 10).toUpperCase(),
		)
		return HttpResponse.json(profileState.recoveryCodes.codes)
	}),

	// 删除恢复码
	http.post("*/nexus-api/iam/factor/recovery-code/delete", async () => {
		await delay(400)
		profileState.recoveryCodes.exists = false
		profileState.recoveryCodes.remainingCount = 0
		profileState.recoveryCodes.codes = []
		return HttpResponse.json({ success: true })
	}),

	// 启用 MFA
	http.post("*/nexus-api/iam/me/enable_mfa", async () => {
		await delay(300)
		profileState.profile.mfaEnabled = true
		return HttpResponse.json({ success: true })
	}),

	// 禁用 MFA
	http.post("*/nexus-api/iam/me/disable_mfa", async () => {
		await delay(300)
		profileState.profile.mfaEnabled = false
		return HttpResponse.json({ success: true })
	}),

	// Passkey 列表
	http.get("*/nexus-api/iam/passkey/list", async () => {
		await delay(300)
		return HttpResponse.json(profileState.passkeys)
	}),

	// Passkey 注册选项
	http.get("*/nexus-api/iam/passkey/registration/options", async () => {
		await delay(200)
		// 返回一个符合 WebAuthn 规范的模拟选项
		return HttpResponse.json({
			publicKey: {
				challenge: "Y2hhbGxlbmdl",
				rp: { name: "Ideal Template", id: window.location.hostname },
				user: {
					id: "dXNlcklk",
					name: profileState.profile.email,
					displayName: profileState.profile.name,
				},
				pubKeyCredParams: [{ alg: -7, type: "public-key" }],
				timeout: 60000,
				attestation: "none",
			},
		})
	}),

	// Passkey 注册验证
	http.post("*/nexus-api/iam/passkey/registration", async ({ request }) => {
		await delay(1000)
		const url = new URL(request.url)
		const nickname = url.searchParams.get("credentialNickname") || "New Passkey"

		const newPasskey: Passkey = {
			id: `pk_${Math.random().toString(36).substring(2, 9)}`,
			credentialNickname: nickname,
			createdTime: Date.now(),
			lastUsedTime: Date.now(),
		}
		profileState.passkeys.push(newPasskey)
		return HttpResponse.json(newPasskey)
	}),

	// 更新 Passkey
	http.put("*/nexus-api/iam/passkey/:id", async ({ params, request }) => {
		const { id } = params
		const { nickname } = (await request.json()) as { nickname: string }
		await delay(300)
		const pk = profileState.passkeys.find((p) => p.id === id)
		if (pk) {
			pk.credentialNickname = nickname
		}
		return HttpResponse.json({ success: true })
	}),

	// 删除 Passkey
	http.delete("*/nexus-api/iam/passkey/:id", async ({ params }) => {
		const { id } = params
		await delay(300)
		profileState.passkeys = profileState.passkeys.filter((p) => p.id !== id)
		return HttpResponse.json({ success: true })
	}),

	// 活动会话列表
	http.get("*/nexus-api/iam/me/sessions", async () => {
		await delay(300)
		return HttpResponse.json(profileState.sessions)
	}),

	// 注销会话
	http.delete("*/nexus-api/iam/me/sessions/:id", async ({ params }) => {
		const { id } = params
		await delay(400)
		profileState.sessions = profileState.sessions.filter((s) => s.id !== id)
		return HttpResponse.json({ success: true })
	}),

	// 登录日志
	http.get("*/nexus-api/iam/login-log/current-user", async ({ request }) => {
		const url = new URL(request.url)
		const page = Number.parseInt(url.searchParams.get("pageNumber") || "1")
		const size = Number.parseInt(url.searchParams.get("pageSize") || "10")

		await delay(400)

		const total = 25
		const logs: Api.LoginLog.LoginLogVO[] = Array.from({ length: size }, (_, i) => {
			const index = (page - 1) * size + i
			if (index >= total) return null as unknown as Api.LoginLog.LoginLogVO
			return {
				id: `log_${index}`,
				platform: "WEB",
				userId: profileState.profile.userId,
				tenantId: profileState.profile.tenantId!,
				channel: Api.LoginLog.LoginChannel.PASSWORD,
				clientId: "system-ui",
				clientName: "管理系统前端",
				loginIp: "127.0.0.1",
				loginLocation: "本地网络",
				userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
				device: "Chrome / macOS",
				loginTime: Date.now() - index * 3600000,
				success: true,
			}
		}).filter(Boolean)

		return HttpResponse.json({
			content: logs,
			totalElements: total,
			totalPages: Math.ceil(total / size),
			size: size,
			number: page,
		})
	}),
]

// 注册处理器
mockRegistry.register(...profileHandlers)
