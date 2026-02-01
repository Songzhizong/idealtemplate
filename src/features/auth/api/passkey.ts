import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { env } from "@/lib/env.ts"
import { webauthnUtils } from "@/lib/webauthn"
import { handleLoginResponse, type LoginResponse } from "./login"

/**
 * Passkey 登录：获取断言选项（PublicKeyCredentialRequestOptions 的源数据，后端返回为字符串JSON）
 */
export const fetchPasskeyAssertionOptions =
	async (): Promise<PublicKeyCredentialRequestOptions> => {
		const platform = env.VITE_PLATFORM_CODE
		const response = (await api
			.get(`nexus-api/iam/passkey/assertion/options/${platform}`)
			.json()) as { publicKey?: unknown }
		const options = response.publicKey || response
		return webauthnUtils.parseOptions(options) as PublicKeyCredentialRequestOptions
	}

/**
 * Passkey 登录：提交浏览器返回的断言进行校验
 */
export const fetchPasskeyAssertionVerify = async (
	credential: PublicKeyCredential,
): Promise<LoginResponse> => {
	const body = webauthnUtils.formatCredential(credential)
	const response = await api.withAuthClientId().post("nexus-api/iam/passkey/assertion", {
		json: body,
		throwHttpErrors: false,
	})

	return handleLoginResponse(response)
}

/**
 * Hook - Passkey 登录
 */
export const usePasskeyLogin = () => {
	return useMutation({
		mutationFn: async () => {
			const options = await fetchPasskeyAssertionOptions()
			const credential = (await navigator.credentials.get({
				publicKey: options,
			})) as PublicKeyCredential

			if (!credential) {
				throw new Error("Failed to get credential")
			}

			return fetchPasskeyAssertionVerify(credential)
		},
	})
}
