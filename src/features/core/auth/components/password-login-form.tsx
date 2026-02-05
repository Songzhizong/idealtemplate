import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Lock, Mail, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { BaseLink } from "@/components/common/base-link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCheckCaptcha } from "@/features/core/auth/api/check-captcha"
import { useGetCaptcha } from "@/features/core/auth/api/get-captcha"
import type { LoginResponse } from "@/features/core/auth/api/login"
import {
	LoginResponseType,
	type PasswordLoginRequest,
	PasswordLoginRequestSchema,
	usePasswordLogin,
} from "@/features/core/auth/api/login"
import { useLoginHandler } from "@/features/core/auth/hooks/use-login-handler"
import { getCertificate } from "@/features/core/auth/utils/certificate"
import { env } from "@/lib/env"

export function PasswordLoginForm({
	onResponse,
}: {
	onResponse?: (response: LoginResponse) => void
}) {
	const [showPassword, setShowPassword] = useState(false)
	const [rememberMe, setRememberMe] = useState(false)

	const { data: captcha, refetch: refetchCaptcha, isLoading: captchaLoading } = useGetCaptcha()
	const loginMutation = usePasswordLogin()
	const { handleLoginSuccess } = useLoginHandler()

	const form = useForm<PasswordLoginRequest>({
		resolver: zodResolver(PasswordLoginRequestSchema),
		defaultValues: {
			username: env.VITE_DEFAULT_USERNAME ?? "",
			password: env.VITE_DEFAULT_PASSWORD ?? "",
			certificate: getCertificate(),
			captcha: "",
		},
	})

	const username = form.watch("username")
	const { data: checkCaptchaData } = useCheckCaptcha(username)
	const needCaptcha = !!checkCaptchaData?.required

	// Load captcha when needed
	useEffect(() => {
		if (needCaptcha) {
			void refetchCaptcha()
		}
	}, [needCaptcha, refetchCaptcha])

	const handleRefreshCaptcha = () => {
		form.setValue("captcha", "")
		if (needCaptcha) {
			void refetchCaptcha()
		}
	}

	const onSubmit = (data: PasswordLoginRequest) => {
		// Format captcha as JSON string if present
		const formattedData = {
			...data,
			captcha:
				needCaptcha && data.captcha ? JSON.stringify({ captchaCode: data.captcha }) : undefined,
		}

		console.log("Login with Remember Me:", rememberMe)

		loginMutation.mutate(formattedData, {
			onSuccess: (response) => {
				if (response.type === LoginResponseType.TOKEN) {
					void handleLoginSuccess(response)
				} else {
					onResponse?.(response)
				}
			},
			onError: () => {
				handleRefreshCaptcha()
			},
		})
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			{/* Username */}
			<div className="space-y-2">
				<Label htmlFor="username" className="text-foreground">
					邮箱地址
				</Label>
				<div className="relative">
					<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
					<Input
						id="username"
						placeholder="your.email@example.com"
						autoComplete="username"
						{...form.register("username")}
						className="pl-11 bg-background/60 border-border/60 focus:bg-background/80 transition-colors h-12 text-foreground"
					/>
				</div>
				{form.formState.errors.username && (
					<p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
				)}
			</div>

			{/* Password */}
			<div className="space-y-2">
				<Label htmlFor="password" className="text-foreground">
					密码
				</Label>
				<div className="relative">
					<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						placeholder="请输入您的密码"
						autoComplete="current-password"
						{...form.register("password")}
						className="pl-11 pr-11 bg-background/60 border-border/60 focus:bg-background/80 transition-colors h-12 text-foreground"
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					>
						{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
					</button>
				</div>
				{form.formState.errors.password && (
					<p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
				)}
			</div>

			{/* Captcha */}
			{needCaptcha && (
				<div className="space-y-2">
					<Label htmlFor="captcha" className="text-foreground">
						验证码
					</Label>
					<div className="relative">
						<Input
							id="captcha"
							placeholder="请输入验证码"
							autoComplete="off"
							className="pr-32 bg-background/60 border-border/60 focus:bg-background/80 transition-colors h-12 text-foreground"
							{...form.register("captcha")}
						/>
						<div className="absolute right-1 top-1 bottom-1 w-32 overflow-hidden rounded-r-md border-l border-border bg-muted/50">
							{captchaLoading ? (
								<div className="flex h-full items-center justify-center">
									<RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
								</div>
							) : captcha?.imageBase64 ? (
								<button
									type="button"
									onClick={handleRefreshCaptcha}
									className="h-full w-full transition-opacity hover:opacity-80"
									aria-label="Click to refresh captcha"
									title="Click to refresh captcha"
								>
									<img
										src={captcha.imageBase64}
										alt="Captcha"
										className="h-full w-full object-cover dark:invert"
									/>
								</button>
							) : null}
						</div>
					</div>
					{form.formState.errors.captcha && (
						<p className="text-sm text-destructive">{form.formState.errors.captcha.message}</p>
					)}
				</div>
			)}

			{/* Remember Me & Forgot Password */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Checkbox
						id="remember"
						checked={rememberMe}
						onCheckedChange={(checked) => setRememberMe(checked as boolean)}
					/>
					<Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
						记住我
					</Label>
				</div>
				<BaseLink
					to="/forgot-password"
					className="text-sm text-primary hover:text-primary/80 font-medium"
				>
					忘记密码?
				</BaseLink>
			</div>

			{/* Submit Button */}
			<Button
				type="submit"
				className="w-full h-12 bg-linear-to-r from-primary to-primary/70 hover:from-primary/80 hover:to-primary text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all rounded-2xl"
				disabled={loginMutation.isPending}
			>
				{loginMutation.isPending ? "登录中..." : "立即登录"}
			</Button>
		</form>
	)
}
