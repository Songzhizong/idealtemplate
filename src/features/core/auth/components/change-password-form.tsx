import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, Eye, EyeOff, Lock, ShieldAlert } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	type ChangePasswordLoginRequest,
	ChangePasswordLoginRequestSchema,
	type ChangePasswordTicket,
	type LoginResponse,
	LoginResponseType,
	useChangePasswordLogin,
} from "@/features/core/auth/api/login"
import { useLoginHandler } from "@/features/core/auth/hooks/use-login-handler"

type ChangePasswordFormProps = {
	ticket: ChangePasswordTicket
	type: LoginResponseType.PASSWORD_EXPIRED | LoginResponseType.PASSWORD_ILLEGAL
	onSuccess: (response: LoginResponse) => void
	onBack: () => void
}

export function ChangePasswordForm({ ticket, type, onSuccess, onBack }: ChangePasswordFormProps) {
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const changeMutation = useChangePasswordLogin()
	const { handleLoginSuccess } = useLoginHandler()

	const form = useForm<ChangePasswordLoginRequest & { confirmPassword: string }>({
		resolver: zodResolver(
			ChangePasswordLoginRequestSchema.extend({
				confirmPassword: ChangePasswordLoginRequestSchema.shape.newPassword,
			}).refine((data) => data.newPassword === data.confirmPassword, {
				message: "两次输入的密码不一致",
				path: ["confirmPassword"],
			}),
		),
		defaultValues: {
			ticket: ticket.ticket,
			newPassword: "",
			confirmPassword: "",
		},
	})

	const onSubmit = (data: ChangePasswordLoginRequest & { confirmPassword: string }) => {
		changeMutation.mutate(
			{ ticket: data.ticket, newPassword: data.newPassword },
			{
				onSuccess: (response) => {
					if (response.type === LoginResponseType.TOKEN) {
						toast.success("密码修改成功！")
						void handleLoginSuccess(response)
					} else {
						onSuccess(response)
					}
				},
				onError: () => {
					toast.error("密码修改失败，请重试")
				},
			},
		)
	}

	const getTitle = () => {
		return type === LoginResponseType.PASSWORD_EXPIRED ? "密码已过期" : "需修改密码"
	}

	const getDescription = () => {
		return type === LoginResponseType.PASSWORD_EXPIRED
			? "您的密码已过期，请设置新密码以继续使用。"
			: "您的密码不符合安全要求，请修改密码。"
	}

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<button
				type="button"
				onClick={onBack}
				className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors gap-1 group"
			>
				<ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
				返回登录
			</button>

			<div className="text-center">
				<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-warning-subtle text-warning mb-4">
					<ShieldAlert className="w-6 h-6" />
				</div>
				<h3 className="text-xl font-bold text-foreground">{getTitle()}</h3>
				<p className="text-sm text-muted-foreground mt-1">{getDescription()}</p>
			</div>

			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
				{/* New Password */}
				<div className="space-y-2 p-0.5">
					<Label htmlFor="new-password">新密码</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							id="new-password"
							type={showPassword ? "text" : "password"}
							placeholder="请输入新密码"
							autoComplete="new-password"
							{...form.register("newPassword")}
							className="pl-11 pr-11 h-12 bg-background/60 border-border/60 focus:bg-background/80 transition-colors rounded-2xl"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						>
							{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					{form.formState.errors.newPassword && (
						<p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
					)}
				</div>

				{/* Confirm Password */}
				<div className="space-y-2 p-0.5">
					<Label htmlFor="confirm-password">确认新密码</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							id="confirm-password"
							type={showConfirmPassword ? "text" : "password"}
							placeholder="请再次输入新密码"
							autoComplete="new-password"
							{...form.register("confirmPassword")}
							className="pl-11 pr-11 h-12 bg-background/60 border-border/60 focus:bg-background/80 transition-colors rounded-2xl"
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						>
							{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					{form.formState.errors.confirmPassword && (
						<p className="text-sm text-destructive">
							{form.formState.errors.confirmPassword.message}
						</p>
					)}
				</div>

				{/* Password Requirements */}
				<div className="rounded-2xl bg-muted/50 border border-border/60 p-4 text-xs text-muted-foreground">
					<p className="font-semibold mb-2">密码要求:</p>
					<ul className="space-y-1 list-disc list-inside">
						<li>长度至少为 6 个字符</li>
						<li>包含字母和数字的组合</li>
						<li>不得包含账号名称等敏感信息</li>
					</ul>
				</div>

				{/* Submit Button */}
				<Button
					type="submit"
					className="w-full h-12 bg-linear-to-r from-primary to-primary/70 hover:from-primary/80 hover:to-primary text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all rounded-2xl"
					disabled={changeMutation.isPending}
				>
					{changeMutation.isPending ? "修改中..." : "确 认 修 改"}
				</Button>
			</form>
		</div>
	)
}
