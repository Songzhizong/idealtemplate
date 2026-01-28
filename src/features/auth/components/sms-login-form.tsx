import { zodResolver } from "@hookform/resolvers/zod"
import { RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGetCaptcha } from "@/features/auth/api/get-captcha"
import type { LoginResponse } from "@/features/auth/api/login"
import {
	LoginResponseType,
	type SendSmsCodeRequest,
	SendSmsCodeRequestSchema,
	type SmsCodeLoginRequest,
	SmsCodeLoginRequestSchema,
	useSendSmsLoginCode,
	useSmsCodeLogin,
} from "@/features/auth/api/login"
import { useLoginHandler } from "@/features/auth/hooks/use-login-handler"
import { getCertificate } from "@/features/auth/utils/certificate"
import { ChangePasswordDialog } from "./change-password-dialog"
import { MfaDialog } from "./mfa-dialog"
import { SelectAccountDialog } from "./select-account-dialog"

export function SmsLoginForm() {
	const [step, setStep] = useState<"phone" | "code">("phone")
	const [countdown, setCountdown] = useState(0)
	const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null)

	const { data: captcha, refetch: refetchCaptcha, isLoading: captchaLoading } = useGetCaptcha()
	const sendCodeMutation = useSendSmsLoginCode()
	const loginMutation = useSmsCodeLogin()
	const { handleLoginSuccess } = useLoginHandler()

	const phoneForm = useForm<SendSmsCodeRequest>({
		resolver: zodResolver(SendSmsCodeRequestSchema),
		defaultValues: {
			phone: "",
			certificate: getCertificate(),
			captcha: "",
		},
	})

	const codeForm = useForm<SmsCodeLoginRequest>({
		resolver: zodResolver(SmsCodeLoginRequestSchema),
		defaultValues: {
			phone: "",
			code: "",
		},
	})

	// Load captcha on mount
	useEffect(() => {
		void refetchCaptcha()
	}, [refetchCaptcha])

	// Countdown timer
	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
			return () => clearTimeout(timer)
		}
	}, [countdown])

	const handleRefreshCaptcha = () => {
		phoneForm.setValue("captcha", "")
		void refetchCaptcha()
	}

	const onSendCode = (data: SendSmsCodeRequest) => {
		const formattedData = {
			...data,
			captcha: JSON.stringify({ captchaCode: data.captcha }),
		}

		sendCodeMutation.mutate(formattedData, {
			onSuccess: () => {
				toast.success("SMS code sent successfully!")
				setStep("code")
				setCountdown(60)
				codeForm.setValue("phone", data.phone)
			},
			onError: () => {
				toast.error("Failed to send SMS code. Please try again.")
				handleRefreshCaptcha()
			},
		})
	}

	const onLogin = (data: SmsCodeLoginRequest) => {
		loginMutation.mutate(data, {
			onSuccess: (response) => {
				setLoginResponse(response)

				if (response.type === LoginResponseType.TOKEN) {
					void handleLoginSuccess(response)
				}
			},
			onError: () => {
				toast.error("Invalid verification code. Please try again.")
			},
		})
	}

	const handleResendCode = () => {
		const phone = codeForm.getValues("phone")
		phoneForm.setValue("phone", phone)
		setStep("phone")
		void refetchCaptcha()
	}

	return (
		<>
			{step === "phone" ? (
				<form onSubmit={phoneForm.handleSubmit(onSendCode)} className="space-y-4">
					{/* Phone */}
					<div className="space-y-2">
						<Label htmlFor="phone">Phone Number</Label>
						<Input
							id="phone"
							type="tel"
							placeholder="Enter your phone number"
							autoComplete="tel"
							{...phoneForm.register("phone")}
						/>
						{phoneForm.formState.errors.phone && (
							<p className="text-sm text-destructive">{phoneForm.formState.errors.phone.message}</p>
						)}
					</div>

					{/* Captcha */}
					<div className="space-y-2">
						<Label htmlFor="sms-captcha">Verification Code</Label>
						<div className="relative">
							<Input
								id="sms-captcha"
								placeholder="Enter code"
								autoComplete="off"
								className="pr-32"
								{...phoneForm.register("captcha")}
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
						{phoneForm.formState.errors.captcha && (
							<p className="text-sm text-destructive">
								{phoneForm.formState.errors.captcha.message}
							</p>
						)}
					</div>

					{/* Submit Button */}
					<Button type="submit" className="w-full" disabled={sendCodeMutation.isPending}>
						{sendCodeMutation.isPending ? "Sending..." : "Send SMS Code"}
					</Button>
				</form>
			) : (
				<form onSubmit={codeForm.handleSubmit(onLogin)} className="space-y-4">
					{/* SMS Code */}
					<div className="space-y-2">
						<Label htmlFor="sms-code">SMS Verification Code</Label>
						<Input
							id="sms-code"
							placeholder="Enter 6-digit code"
							autoComplete="one-time-code"
							maxLength={6}
							{...codeForm.register("code")}
						/>
						{codeForm.formState.errors.code && (
							<p className="text-sm text-destructive">{codeForm.formState.errors.code.message}</p>
						)}
						<p className="text-sm text-muted-foreground">
							Code sent to {codeForm.getValues("phone")}
						</p>
					</div>

					{/* Resend Button */}
					<Button
						type="button"
						variant="outline"
						className="w-full"
						onClick={handleResendCode}
						disabled={countdown > 0}
					>
						{countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
					</Button>

					{/* Submit Button */}
					<Button type="submit" className="w-full" disabled={loginMutation.isPending}>
						{loginMutation.isPending ? "Signing in..." : "Sign In"}
					</Button>

					{/* Back Button */}
					<Button type="button" variant="ghost" className="w-full" onClick={() => setStep("phone")}>
						Back to Phone Number
					</Button>
				</form>
			)}

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
