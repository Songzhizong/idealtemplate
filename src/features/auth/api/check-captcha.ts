import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "@/lib/api-client"

/**
 * Check Captcha Request Schema
 */
export const CheckCaptchaRequestSchema = z.object({
	username: z.string().min(1, "Username is required"),
})

export type CheckCaptchaRequest = z.infer<typeof CheckCaptchaRequestSchema>

/**
 * Check Captcha Response Interface
 */
export interface CheckCaptchaResponse {
	required: boolean
}

/**
 * Fetcher - 检查是否需要验证码
 */
const checkCaptcha = async (request: CheckCaptchaRequest): Promise<CheckCaptchaResponse> => {
	const json = await api
		.withAuthClientId()
		.post("nexus-api/iam/login/captcha/check", {
			json: request,
		})
		.json()
	return json as CheckCaptchaResponse
}

/**
 * React Query Hook - 检查是否需要验证码
 * @example
 * const { data } = useCheckCaptcha(username)
 */
export const useCheckCaptcha = (username: string) => {
	return useQuery({
		queryKey: ["captcha-check", username],
		queryFn: () => checkCaptcha({ username }),
		enabled: !!username,
	})
}
