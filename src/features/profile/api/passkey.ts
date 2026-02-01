import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { webauthnUtils } from "@/lib/webauthn"

export interface Passkey {
	id: string
	credentialNickname: string
	createdTime: number
	lastUsedTime: number
}

/**
 * Passkey 注册：获取注册选项
 */
export const fetchPasskeyRegistrationOptions =
	async (): Promise<PublicKeyCredentialCreationOptions> => {
		const response = (await api.get("nexus-api/iam/passkey/registration/options").json()) as {
			publicKey?: unknown
		}
		const options = response.publicKey || response
		return webauthnUtils.parseOptions(options) as PublicKeyCredentialCreationOptions
	}

/**
 * Passkey 注册：提交凭证进行校验
 */
export const fetchPasskeyRegistrationVerify = async (
	displayName: string,
	credential: PublicKeyCredential,
): Promise<Passkey> => {
	const body = webauthnUtils.formatCredential(credential)
	return api
		.post(
			`nexus-api/iam/passkey/registration?credentialNickname=${encodeURIComponent(displayName)}`,
			{
				json: body,
			},
		)
		.json<Passkey>()
}

/**
 * Passkey 列表
 */
export const fetchPasskeys = async (): Promise<Passkey[]> => {
	return api.get("nexus-api/iam/passkey/list").json<Passkey[]>()
}

/**
 * 更新 Passkey 昵称
 */
export const updatePasskey = async (id: string, nickname: string): Promise<void> => {
	await api.put(`nexus-api/iam/passkey/${id}`, {
		json: { nickname },
	})
}

/**
 * 删除 Passkey
 */
export const deletePasskey = async (id: string): Promise<void> => {
	await api.delete(`nexus-api/iam/passkey/${id}`)
}

/**
 * Hooks
 */

export const usePasskeys = () => {
	return useQuery({
		queryKey: ["passkeys"],
		queryFn: fetchPasskeys,
	})
}

export const useRegisterPasskey = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (displayName: string) => {
			const options = await fetchPasskeyRegistrationOptions()
			const credential = (await navigator.credentials.create({
				publicKey: options,
			})) as PublicKeyCredential

			if (!credential) {
				throw new Error("Failed to create credential")
			}

			return fetchPasskeyRegistrationVerify(displayName, credential)
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["passkeys"] })
		},
	})
}

export const useUpdatePasskey = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, nickname }: { id: string; nickname: string }) => updatePasskey(id, nickname),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["passkeys"] })
		},
	})
}

export const useDeletePasskey = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: deletePasskey,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["passkeys"] })
		},
	})
}
