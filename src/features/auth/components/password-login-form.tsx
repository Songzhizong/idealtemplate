import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCheckCaptcha } from "@/features/auth/api/check-captcha"
import { useGetCaptcha } from "@/features/auth/api/get-captcha"
import type { LoginResponse } from "@/features/auth/api/login"
import {
	LoginResponseType,
	type PasswordLoginRequest,
	PasswordLoginRequestSchema,
	usePasswordLogin,
} from "@/features/auth/api/login"
import { useLoginHandler } from "@/features/auth/hooks/use-login-handler"
import { getCertificate } from "@/features/auth/utils/certificate"
import { env } from "@/lib/env"
import { ChangePasswordDialog } from "./change-password-dialog"
import { MfaDialog } from "./mfa-dialog"
import { SelectAccountDialog } from "./select-account-dialog"

export function PasswordLoginForm() {
	const [showPassword, setShowPassword] = useState(false)
	const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null)

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

		loginMutation.mutate(formattedData, {
			onSuccess: (response) => {
				setLoginResponse(response)

				if (response.type === LoginResponseType.TOKEN) {
					void handleLoginSuccess(response)
				}
			},
			onError: () => {
				toast.error("Login failed. Please check your credentials.")
				handleRefreshCaptcha()
			},
		})
	}

	return (
		<>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{/* Username */}
				<div className="space-y-2">
					<Label htmlFor="username">Username / Email / Phone</Label>
					<Input
						id="username"
						placeholder="Enter your username"
						autoComplete="username"
						{...form.register("username")}
					/>
					{form.formState.errors.username && (
						<p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
					)}
				</div>

				{/* Password */}
				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="Enter your password"
							autoComplete="current-password"
							{...form.register("password")}
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4 text-muted-foreground" />
							) : (
								<Eye className="h-4 w-4 text-muted-foreground" />
							)}
						</Button>
					</div>
					{form.formState.errors.password && (
						<p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
					)}
				</div>

				{/* Captcha */}
				{needCaptcha && (
					<div className="space-y-2">
						<Label htmlFor="captcha">Verification Code</Label>
						<div className="relative">
							<Input
								id="captcha"
								placeholder="Enter code"
								autoComplete="off"
								className="pr-32"
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

				{/* Submit Button */}
				<Button type="submit" className="w-full" disabled={loginMutation.isPending}>
					{loginMutation.isPending ? "Signing in..." : "Sign In"}
				</Button>
			</form>

			{/* MFA Dialog */}
			{loginResponse?.type === LoginResponseType.NEED_MFA && loginResponse.mfaTicket && (
				<MfaDialog
					ticket={loginResponse.mfaTicket}
					onSuccess={(response) => setLoginResponse(response)}
					onClose={() => setLoginResponse(null)}
				/>
			)}

			{/* Select Account Dialog */}
			{loginResponse?.type === LoginResponseType.SELECT_ACCOUNT &&
				loginResponse.selectAccountTicket && (
					<SelectAccountDialog
						ticket={loginResponse.selectAccountTicket}
						onSuccess={(response) => setLoginResponse(response)}
						onClose={() => setLoginResponse(null)}
					/>
				)}

			{/* Change Password Dialog */}
			{(loginResponse?.type === LoginResponseType.PASSWORD_EXPIRED ||
				loginResponse?.type === LoginResponseType.PASSWORD_ILLEGAL) &&
				loginResponse.passwordTicket && (
					<ChangePasswordDialog
						ticket={loginResponse.passwordTicket}
						type={loginResponse.type}
						onSuccess={(response) => setLoginResponse(response)}
						onClose={() => setLoginResponse(null)}
					/>
				)}
		</>
	)
}
