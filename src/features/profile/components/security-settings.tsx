import { Copy, Download, Key, Lock, Plus, Shield, Smartphone, Trash2 } from "lucide-react"
import { type ChangeEvent, useState } from "react"
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

export function SecuritySettings() {
	const [hasPassword] = useState(true) // TODO: Get from API
	const [isPasswordExpanded, setIsPasswordExpanded] = useState(false)
	const [password, setPassword] = useState({
		current: "",
		new: "",
		confirm: "",
	})

	const [passwordStrength, setPasswordStrength] = useState(0)
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)

	const [passkeys] = useState([
		{
			id: "1",
			name: "MacBook Pro - Chrome",
			created: "2024-01-15",
			lastUsed: "2024-01-30",
		},
		{
			id: "2",
			name: "iPhone 14 - Safari",
			created: "2024-01-10",
			lastUsed: "2024-01-29",
		},
		{
			id: "3",
			name: "Windows PC - Edge",
			created: "2023-12-20",
			lastUsed: "2024-01-25",
		},
	])

	const recoveryCodes = [
		"A1B2-C3D4-E5F6",
		"G7H8-I9J0-K1L2",
		"M3N4-O5P6-Q7R8",
		"S9T0-U1V2-W3X4",
		"Y5Z6-A7B8-C9D0",
	]

	const handlePasswordChange = (field: string, value: string) => {
		setPassword({ ...password, [field]: value })
		if (field === "new") {
			// Simple password strength calculation
			let strength = 0
			if (value.length >= 8) strength += 25
			if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength += 25
			if (/\d/.test(value)) strength += 25
			if (/[^a-zA-Z\d]/.test(value)) strength += 25
			setPasswordStrength(strength)
		}
	}

	const handleSavePassword = () => {
		if (password.new !== password.confirm) {
			toast.error("新密码和确认密码不匹配")
			return
		}
		toast.success("密码已成功修改")
		setPassword({ current: "", new: "", confirm: "" })
		setPasswordStrength(0)
		setIsPasswordExpanded(false)
	}

	const handleToggle2FA = (enabled: boolean) => {
		setTwoFactorEnabled(enabled)
		toast.success(enabled ? "双因素认证已启用" : "双因素认证已禁用")
	}

	const handleCopyRecoveryCodes = () => {
		void navigator.clipboard.writeText(recoveryCodes.join("\n"))
		toast.success("恢复代码已复制到剪贴板")
	}

	const handleDownloadRecoveryCodes = () => {
		const blob = new Blob([recoveryCodes.join("\n")], { type: "text/plain" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = "recovery-codes.txt"
		a.click()
		toast.success("恢复代码已下载")
	}

	const handleDeletePasskey = (id: string) => {
		// id used for deletion logic
		console.log(id)
		toast.success("Passkey 已删除")
	}

	const getStrengthColor = () => {
		if (passwordStrength >= 75) return "bg-green-500"
		if (passwordStrength >= 50) return "bg-yellow-500"
		if (passwordStrength >= 25) return "bg-orange-500"
		return "bg-red-500"
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
									value={password.current}
									onChange={(e: ChangeEvent<HTMLInputElement>) =>
										handlePasswordChange("current", e.target.value)
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
								value={password.new}
								onChange={(e: ChangeEvent<HTMLInputElement>) =>
									handlePasswordChange("new", e.target.value)
								}
								placeholder="输入新密码"
							/>
							{password.new && (
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
								<Badge variant={twoFactorEnabled ? "default" : "secondary"}>
									{twoFactorEnabled ? "已启用" : "已禁用"}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">登录时需要输入验证码以增强安全性</p>
						</div>
						<Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} />
					</div>

					{twoFactorEnabled && (
						<>
							<Separator />

							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<Smartphone className="mt-0.5 size-5 text-muted-foreground" />
									<div className="flex-1">
										<h4 className="mb-1 font-medium">身份验证应用</h4>
										<p className="mb-3 text-sm text-muted-foreground">
											使用 Google Authenticator 或 Microsoft Authenticator 获取验证码
										</p>
										<Button variant="outline" size="sm">
											配置验证应用
										</Button>
									</div>
								</div>

								<Separator />

								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div>
											<h4 className="font-medium">恢复代码</h4>
											<p className="text-sm text-muted-foreground">
												当你无法访问验证设备时使用这些代码
											</p>
										</div>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button variant="outline" size="sm">
													查看代码
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>恢复代码</AlertDialogTitle>
													<AlertDialogDescription>
														请将这些代码保存在安全的地方。每个代码只能使用一次。
													</AlertDialogDescription>
												</AlertDialogHeader>
												<div className="rounded-lg bg-muted p-4">
													<div className="grid grid-cols-2 gap-2 font-mono text-sm">
														{recoveryCodes.map((code, index) => (
															<div key={code} className="flex items-center gap-2">
																<span className="text-muted-foreground">{index + 1}.</span>
																<span>{code}</span>
															</div>
														))}
													</div>
												</div>
												<AlertDialogFooter className="flex-col gap-2 sm:flex-row">
													<Button
														variant="outline"
														onClick={handleCopyRecoveryCodes}
														className="w-full sm:w-auto"
													>
														<Copy className="mr-2 size-4" />
														复制
													</Button>
													<Button
														variant="outline"
														onClick={handleDownloadRecoveryCodes}
														className="w-full sm:w-auto"
													>
														<Download className="mr-2 size-4" />
														下载
													</Button>
													<AlertDialogAction className="w-full sm:w-auto">关闭</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Passkey Management */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-2">
								<Key className="size-5" />
								<CardTitle>Passkey 管理</CardTitle>
							</div>
							<CardDescription className="mt-1.5">
								使用 Passkey 实现更安全、更便捷的无密码登录
							</CardDescription>
						</div>
						<Button size="sm" onClick={() => toast.info("添加 Passkey 功能")}>
							<Plus className="mr-2 size-4" />
							添加 Passkey
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border border-border/50 overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="border-border/50">
									<TableHead className="min-w-37.5">设备名称</TableHead>
									<TableHead className="min-w-30">创建时间</TableHead>
									<TableHead className="min-w-30">最后使用</TableHead>
									<TableHead className="w-20" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{passkeys.map((passkey) => (
									<TableRow key={passkey.id} className="border-border/50">
										<TableCell className="font-medium">{passkey.name}</TableCell>
										<TableCell>{passkey.created}</TableCell>
										<TableCell>{passkey.lastUsed}</TableCell>
										<TableCell>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="size-8 text-destructive hover:text-destructive"
													>
														<Trash2 className="size-4" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>确认删除</AlertDialogTitle>
														<AlertDialogDescription>
															确定要删除 "{passkey.name}" 这个 Passkey 吗？此操作无法撤销。
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>取消</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDeletePasskey(passkey.id)}
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														>
															删除
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
