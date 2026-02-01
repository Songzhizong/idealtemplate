import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { api } from "@/lib/api-client"

/**
 * 个人密码状态
 */
export interface PasswordStatus {
	configured: boolean
	passwordTime?: string | null
	passwordExpireTime?: string | null
}

/**
 * 修改个人密码请求 Schema
 */
export const ChangePasswordRequestSchema = z.object({
	oldPassword: z.string().optional(),
	newPassword: z.string().min(1, "新密码不能为空"),
})

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>

/**
 * 获取个人密码状态
 */
export const fetchPasswordStatus = async (): Promise<PasswordStatus> => {
	const data = await api.get("nexus-api/iam/me/password-status").json()
	return data as PasswordStatus
}

/**
 * 修改个人密码
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
	await api.post("nexus-api/iam/me/change-password", {
		json: data,
	})
}

/**
 * Hook - 获取密码状态
 */
export const usePasswordStatus = () => {
	return useQuery({
		queryKey: ["password-status"],
		queryFn: fetchPasswordStatus,
	})
}

/**
 * Hook - 修改密码
 */
export const useChangePassword = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: changePassword,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["password-status"] })
		},
	})
}
