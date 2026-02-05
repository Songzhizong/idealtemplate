import { AlertCircle, Copy, Download, Key, Lock, Shield, Smartphone, Trash2 } from "lucide-react"
import React, { type ChangeEvent, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuthStore } from "@/lib/auth-store"
import { validateWithToast } from "@/lib/utils"
import { ChangePasswordRequestSchema, useChangePassword, usePasswordStatus } from "../api/password"
import {
	useDeleteRecoveryCode,
	useGenerateRecoveryCode,
	useRecoveryCodeStatus,
} from "../api/recovery-code"
import {
	useConfirmTotp,
	useDeleteTotp,
	useDisableMfa,
	useEnableMfa,
	useTotpGenerateQr,
	useTotpStatus,
} from "../api/totp"
import { PasskeyManagement } from "./passkey-management"

export function SecuritySettings() {
	const user = useAuthStore((state) => state.user)
	const { data: passwordStatus } = usePasswordStatus()
	const hasPassword = passwordStatus?.configured ?? true
	const changePasswordMutation = useChangePassword()

	const { data: totpStatus } = useTotpStatus()
	const generateQr = useTotpGenerateQr()
	const confirmMutation = useConfirmTotp()
	const deleteMutation = useDeleteTotp()
	const enableMfaMutation = useEnableMfa()
	const disableMfaMutation = useDisableMfa()

	const [isPasswordExpanded, setIsPasswordExpanded] = useState(false)
	const [password, setPassword] = useState({
		oldPassword: "",
		newPassword: "",
		confirm: "",
	})

	const [passwordStrength, setPasswordStrength] = useState(0)

	const [isSetupDialogOpen, setIsSetupDialogOpen] = useState(false)
	const [verificationCode, setVerificationCode] = useState("")
	const [qrCodeBase64, setQrCodeBase64] = useState("")
	const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
	const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false)
	const [isDeleteRecoveryDialogOpen, setIsDeleteRecoveryDialogOpen] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isSetupDialogOpen) {
			// Small delay to ensure the dialog is fully rendered
			const timer = setTimeout(() => {
				inputRef.current?.focus()
			}, 100)
			return () => clearTimeout(timer)
		}
	}, [isSetupDialogOpen])

	const handlePasswordChange = (field: string, value: string) => {
		setPassword({ ...password, [field]: value })
		if (field === "newPassword") {
			// Simple password strength calculation
			let strength = 0
			if (value.length >= 8) strength += 25
			if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength += 25
			if (/\d/.test(value)) strength += 25
			if (/[^a-zA-Z\d]/.test(value)) strength += 25
			setPasswordStrength(strength)
		}
	}

	const handleSavePassword = async () => {
		if (password.newPassword !== password.confirm) {
			toast.error("新密码和确认密码不匹配")
			return
		}

		const requestData = {
			...(hasPassword && password.oldPassword ? { oldPassword: password.oldPassword } : {}),
			newPassword: password.newPassword,
		}

		const validatedData = validateWithToast(ChangePasswordRequestSchema, requestData)
		if (!validatedData) return

		try {
			await changePasswordMutation.mutateAsync(validatedData)
			toast.success("密码已成功修改")
			setPassword({ oldPassword: "", newPassword: "", confirm: "" })
			setPasswordStrength(0)
			setIsPasswordExpanded(false)
		} catch (error) {
			// Handle API error
			console.error("Failed to change password:", error)
		}
	}

	const handleSetupTotp = async () => {
		try {
			const data = await generateQr.refetch()
			if (data.data?.qrCodeBase64) {
				setQrCodeBase64(data.data.qrCodeBase64)
				setIsSetupDialogOpen(true)
			}
		} catch (error) {
			console.error("Failed to generate TOTP QR:", error)
			toast.error("获取二维码失败")
		}
	}

	const handleConfirmTotp = async () => {
		if (verificationCode.length !== 6) {
			toast.error("请输入 6 位验证码")
			return
		}

		if (confirmMutation.isPending) return

		try {
			await confirmMutation.mutateAsync(verificationCode)
			toast.success("身份验证器已成功绑定")
			setIsSetupDialogOpen(false)
			setVerificationCode("")
			setQrCodeBase64("")
		} catch (error) {
			console.error("Failed to confirm TOTP:", error)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			if (verificationCode.length === 6) {
				void handleConfirmTotp()
			}
		}
	}

	const handleDeleteTotp = async () => {
		try {
			await deleteMutation.mutateAsync()
			toast.success("身份验证器已移除")
		} catch (error) {
			console.error("Failed to delete TOTP:", error)
		}
	}

	const handleToggleMfa = async (enabled: boolean) => {
		try {
			if (enabled) {
				await enableMfaMutation.mutateAsync()
				toast.success("双因素认证已启用")
			} else {
				await disableMfaMutation.mutateAsync()
				toast.success("双因素认证已禁用")
			}
		} catch (error) {
			console.error("Failed to toggle MFA:", error)
		}
	}

	const { data: recoveryCodeStatus } = useRecoveryCodeStatus()
	const generateRecoveryCodesMutation = useGenerateRecoveryCode()
	const deleteRecoveryCodesMutation = useDeleteRecoveryCode()

	const handleGenerateRecoveryCodes = async () => {
		try {
			const codes = await generateRecoveryCodesMutation.mutateAsync()
			setGeneratedCodes(codes)
			setIsRecoveryDialogOpen(true)
			toast.success("已成功生成新的恢复代码")
		} catch (error) {
			console.error("Failed to generate recovery codes:", error)
		}
	}

	const handleDeleteRecoveryCodes = async () => {
		try {
			await deleteRecoveryCodesMutation.mutateAsync()
			setIsDeleteRecoveryDialogOpen(false)
			toast.success("恢复代码已删除")
		} catch (error) {
			console.error("Failed to delete recovery codes:", error)
		}
	}

	const handleCopyRecoveryCodes = () => {
		void navigator.clipboard.writeText(generatedCodes.join("\n"))
		toast.success("恢复代码已复制到剪贴板")
	}

	const handleDownloadRecoveryCodes = () => {
		const blob = new Blob([generatedCodes.join("\n")], { type: "text/plain" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "recovery-codes.txt"
		a.click()
		toast.success("恢复代码已下载")
	}

	const getStrengthColor = () => {
		if (passwordStrength >= 75) return "bg-success"
		if (passwordStrength >= 50) return "bg-warning"
		if (passwordStrength >= 25) return "bg-info"
		return "bg-destructive"
	}

	const getStrengthText = () => {
		if (passwordStrength >= 75) return "强"
		if (passwordStrength >= 50) return "中等"
		if (passwordStrength >= 25) return "弱"
		return "非常弱"
	}

	return (
		<div className="space-y-6">
			{/* Change Password */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<Lock className="size-5" />
								<CardTitle>{hasPassword ? "修改密码" : "设置密码"}</CardTitle>
							</div>
							<CardDescription>
								{hasPassword
									? "定期更新你的密码以保护账号安全"
									: "你尚未设置密码，请设置一个强密码来保护你的账号"}
							</CardDescription>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsPasswordExpanded(!isPasswordExpanded)}
						>
							{isPasswordExpanded ? "收起" : hasPassword ? "修改密码" : "设置密码"}
						</Button>
					</div>
				</CardHeader>
				{isPasswordExpanded && (
					<CardContent className="space-y-4">
						{hasPassword && (
							<div className="grid gap-2">
								<Label htmlFor="currentPassword">当前密码</Label>
								<Input
									id="currentPassword"
									type="password"
									value={password.oldPassword}
									onChange={(e: ChangeEvent<HTMLInputElement>) =>
										handlePasswordChange("oldPassword", e.target.value)
									}
									placeholder="输入当前密码"
								/>
							</div>
						)}

						<div className="grid gap-2">
							<Label htmlFor="newPassword">新密码</Label>
							<Input
								id="newPassword"
								type="password"
								value={password.newPassword}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									handlePasswordChange("newPassword", e.target.value)
								}
								placeholder="输入新密码"
							/>
							{password.newPassword && (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Progress value={passwordStrength} className="h-2">
											<div
												className={`h-full ${getStrengthColor()} transition-all`}
												style={{ width: `${passwordStrength}%` }}
											/>
										</Progress>
										<span className="min-w-16 text-sm text-muted-foreground">
											{getStrengthText()}
										</span>
									</div>
									<p className="text-sm text-muted-foreground">
										密码应包含至少 8 个字符，包括大小写字母、数字和特殊字符
									</p>
								</div>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="confirmPassword">确认新密码</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={password.confirm}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									handlePasswordChange("confirm", e.target.value)
								}
								placeholder="再次输入新密码"
							/>
						</div>

						<div className="flex justify-end">
							<Button onClick={handleSavePassword}>{hasPassword ? "更新密码" : "保存密码"}</Button>
						</div>
					</CardContent>
				)}
			</Card>

			{/* Two-Factor Authentication */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Shield className="size-5" />
						<CardTitle>双因素认证 (2FA)</CardTitle>
					</div>
					<CardDescription>为你的账号添加额外的安全保护层</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<div className="mb-1 flex items-center gap-2">
								<h3 className="font-medium">启用双因素认证</h3>
								<Badge variant={user?.mfaEnabled ? "default" : "secondary"}>
									{user?.mfaEnabled ? "已启用" : "已禁用"}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">登录时需要输入验证码以增强安全性</p>
						</div>
						<Switch
							checked={user?.mfaEnabled ?? false}
							onCheckedChange={handleToggleMfa}
							disabled={enableMfaMutation.isPending || disableMfaMutation.isPending}
						/>
					</div>

					<Separator />

					<div className="space-y-4">
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-start gap-3">
								<Smartphone className="mt-0.5 size-5 text-muted-foreground" />
								<div>
									<div className="mb-1 flex items-center gap-2">
										<h4 className="font-medium">身份验证应用</h4>
										<Badge variant={totpStatus?.exists ? "default" : "secondary"}>
											{totpStatus?.exists ? "已配置" : "未配置"}
										</Badge>
									</div>
									<p className="text-sm text-muted-foreground">
										使用 Google Authenticator 或 Microsoft Authenticator 获取验证码
									</p>
								</div>
							</div>

							<div className="flex gap-3">
								{!totpStatus?.exists && (
									<AlertDialog open={isSetupDialogOpen} onOpenChange={setIsSetupDialogOpen}>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												onClick={(e) => {
													e.preventDefault()
													void handleSetupTotp()
												}}
											>
												配置验证应用
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent className="sm:max-w-md">
											<AlertDialogHeader>
												<AlertDialogTitle>设置身份验证器</AlertDialogTitle>
												<AlertDialogDescription>
													请使用身份验证应用扫描下方二维码，并输入生成的 6 位验证码
												</AlertDialogDescription>
											</AlertDialogHeader>
											<div className="flex flex-col items-center justify-center gap-6 py-4">
												{qrCodeBase64 ? (
													<div className="rounded-lg bg-background p-2 border border-border">
														<img src={qrCodeBase64} alt="TOTP QR Code" className="size-48" />
													</div>
												) : (
													<div className="size-48 animate-pulse rounded-lg bg-muted flex items-center justify-center">
														加载中...
													</div>
												)}
												<div className="w-full space-y-2">
													<Label htmlFor="otp-code">验证码</Label>
													<Input
														id="otp-code"
														ref={inputRef}
														placeholder="XXXXXX"
														value={verificationCode}
														onChange={(e) => setVerificationCode(e.target.value)}
														onKeyDown={handleKeyDown}
														maxLength={6}
														className="text-center text-lg tracking-[0.5em] font-mono"
													/>
												</div>
											</div>
											<AlertDialogFooter>
												<AlertDialogCancel onClick={() => setVerificationCode("")}>
													取消
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={(e) => {
														e.preventDefault()
														void handleConfirmTotp()
													}}
													disabled={confirmMutation.isPending || verificationCode.length !== 6}
												>
													{confirmMutation.isPending ? "验证中..." : "确认绑定"}
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}

								{totpStatus?.exists && (
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
											>
												移除
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>确认移除身份验证器？</AlertDialogTitle>
												<AlertDialogDescription>
													移除后，你的账号安全性将会降低。下次登录将不再需要验证码。
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>取消</AlertDialogCancel>
												<AlertDialogAction
													onClick={handleDeleteTotp}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
												>
													确认移除
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}
							</div>
						</div>

						<Separator />

						<div className="space-y-4">
							{totpStatus?.exists && !recoveryCodeStatus?.exists && (
								<div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning-subtle p-3 text-sm text-warning">
									<AlertCircle className="size-5 shrink-0" />
									<div className="flex-1">
										<p className="font-medium">建议开启恢复代码</p>
										<p className="text-warning/80">
											你已启用身份验证器，建议生成恢复代码以防无法访问验证设备。
										</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										className="border-warning/30 bg-background hover:bg-warning/10"
										onClick={handleGenerateRecoveryCodes}
										disabled={generateRecoveryCodesMutation.isPending}
									>
										立即生成
									</Button>
								</div>
							)}

							<div className="flex items-start justify-between gap-3">
								<div className="flex items-start gap-3">
									<Key className="mt-0.5 size-5 text-muted-foreground" />
									<div>
										<div className="mb-1 flex items-center gap-2">
											<h4 className="font-medium">恢复代码</h4>
											<Badge variant={recoveryCodeStatus?.exists ? "default" : "secondary"}>
												{recoveryCodeStatus?.exists
													? `已配置 (${recoveryCodeStatus.remainingCount} 个可用)`
													: "未配置"}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground max-w-xl">
											恢复码可在无法使用双因素认证设备时，帮助你恢复账户访问。请妥善保存。
										</p>
									</div>
								</div>

								<div className="flex gap-3">
									<AlertDialog open={isRecoveryDialogOpen} onOpenChange={setIsRecoveryDialogOpen}>
										<AlertDialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												onClick={(e) => {
													e.preventDefault()
													void handleGenerateRecoveryCodes()
												}}
												disabled={generateRecoveryCodesMutation.isPending}
											>
												{recoveryCodeStatus?.exists ? "重新生成" : "生成恢复代码"}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent className="sm:max-w-md">
											<AlertDialogHeader>
												<AlertDialogTitle>新的恢复代码</AlertDialogTitle>
												<AlertDialogDescription>
													请将这些代码保存在安全的地方。每个代码只能使用一次。
													<strong>一旦关闭此窗口，你将无法再次查看这些代码。</strong>
												</AlertDialogDescription>
											</AlertDialogHeader>
											<div className="rounded-lg bg-muted p-4">
												<div className="grid grid-cols-2 gap-2 font-mono text-sm text-center">
													{generatedCodes.map((code, index) => (
														<div
															key={code}
															className="flex items-center justify-center gap-2 rounded border border-border bg-background py-1"
														>
															<span className="text-muted-foreground text-xs">{index + 1}.</span>
															<span>{code}</span>
														</div>
													))}
												</div>
											</div>
											<AlertDialogFooter className="flex-col gap-2 sm:flex-row">
												<div className="flex gap-2 w-full sm:w-auto">
													<Button
														variant="outline"
														onClick={handleCopyRecoveryCodes}
														className="flex-1 sm:flex-initial"
													>
														<Copy className="mr-2 size-4" />
														复制
													</Button>
													<Button
														variant="outline"
														onClick={handleDownloadRecoveryCodes}
														className="flex-1 sm:flex-initial"
													>
														<Download className="mr-2 size-4" />
														下载
													</Button>
												</div>
												<AlertDialogAction className="w-full sm:w-auto">我已保存</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>

									{recoveryCodeStatus?.exists && (
										<AlertDialog
											open={isDeleteRecoveryDialogOpen}
											onOpenChange={setIsDeleteRecoveryDialogOpen}
										>
											<AlertDialogTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
												>
													<Trash2 className="size-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>确认删除恢复代码？</AlertDialogTitle>
													<AlertDialogDescription>
														删除后，如果你丢失了身份验证设备，将无法通过恢复码找回账号。
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>取消</AlertDialogCancel>
													<AlertDialogAction
														onClick={handleDeleteRecoveryCodes}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														disabled={deleteRecoveryCodesMutation.isPending}
													>
														确认删除
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									)}
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<PasskeyManagement />
		</div>
	)
}
