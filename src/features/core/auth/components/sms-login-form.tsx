import { zodResolver } from "@hookform/resolvers/zod"
import { RefreshCw, Smartphone } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGetCaptcha } from "@/features/core/auth/api/get-captcha"
import type { LoginResponse } from "@/features/core/auth/api/login"
import {
	LoginResponseType,
	useSendSmsLoginCode,
	useSmsCodeLogin,
} from "@/features/core/auth/api/login"
import { useLoginHandler } from "@/features/core/auth/hooks/use-login-handler"
import { getCertificate } from "@/features/core/auth/utils/certificate"

// Unified Schema for the UI form
const SmsLoginFormSchema = z.object({
	phone: z.string().min(1, "请输入手机号"),
	code: z.string().min(1, "请输入验证码"),
	certificate: z.string().optional(),
	rememberMe: z.boolean().optional(),
})

const CaptchaSchema = z.object({
	captcha: z.string().min(1, "请输入图片验证码"),
})

type SmsLoginFormValues = z.infer<typeof SmsLoginFormSchema>

export function SmsLoginForm({ onResponse }: { onResponse?: (response: LoginResponse) => void }) {
	const [countdown, setCountdown] = useState(0)
	const [isCaptchaOpen, setIsCaptchaOpen] = useState(false)

	const { data: captcha, refetch: refetchCaptcha, isLoading: captchaLoading } = useGetCaptcha()
	const sendCodeMutation = useSendSmsLoginCode()
	const loginMutation = useSmsCodeLogin()
	const { handleLoginSuccess } = useLoginHandler()

	const form = useForm<SmsLoginFormValues>({
		resolver: zodResolver(SmsLoginFormSchema),
		defaultValues: {
			phone: "",
			code: "",
			certificate: getCertificate(),
			rememberMe: false,
		},
	})

	const captchaForm = useForm<{ captcha: string }>({
		resolver: zodResolver(CaptchaSchema),
		defaultValues: {
			captcha: "",
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
		captchaForm.setValue("captcha", "")
		void refetchCaptcha()
	}

	const handleSendCode = async () => {
		const valid = await form.trigger("phone")
		if (!valid) return
		setIsCaptchaOpen(true)
		void refetchCaptcha()
	}

	const handleCaptchaConfirm = async (data: { captcha: string }) => {
		const phone = form.getValues("phone")
		const certificate = form.getValues("certificate")

		const formattedData = {
			phone,
			certificate: certificate ?? "",
			captcha: JSON.stringify({ captchaCode: data.captcha }),
		}

		sendCodeMutation.mutate(formattedData, {
			onSuccess: () => {
				toast.success("验证码发送成功！")
				setCountdown(60)
				setIsCaptchaOpen(false)
				captchaForm.reset()
			},
			onError: () => {
				toast.error("验证码发送失败，请稍后重试。")
				handleRefreshCaptcha()
			},
		})
	}

	const onLogin = (data: SmsLoginFormValues) => {
		const loginData = {
			phone: data.phone,
			code: data.code,
		}

		loginMutation.mutate(loginData, {
			onSuccess: (response) => {
				if (response.type === LoginResponseType.TOKEN) {
					void handleLoginSuccess(response)
				} else {
					onResponse?.(response)
				}
			},
			onError: () => {
				toast.error("验证码错误，请重新输入。")
			},
		})
	}

	return (
		<>
			<form onSubmit={form.handleSubmit(onLogin)} className="space-y-6">
				{/* Phone Number */}
				<div className="space-y-2">
					<Label htmlFor="phone" className="text-foreground">
						手机号
					</Label>
					<div className="relative">
						<Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							id="phone"
							type="tel"
							placeholder="请输入手机号"
							autoComplete="tel"
							{...form.register("phone")}
							className="pl-11 bg-background/60 border-border/60 focus:bg-background/80 transition-colors h-12 text-foreground"
						/>
					</div>
					{form.formState.errors.phone && (
						<p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
					)}
				</div>

				{/* SMS Code & Send Button Merged */}
				<div className="space-y-2">
					<Label htmlFor="code" className="text-foreground">
						验证码
					</Label>
					<div className="relative">
						<Input
							id="code"
							type="text"
							placeholder="请输入验证码"
							autoComplete="one-time-code"
							maxLength={6}
							{...form.register("code")}
							className="pr-32 bg-background/60 border-border/60 focus:bg-background/80 transition-colors h-12 text-foreground"
						/>
						<div className="absolute right-1 top-1 bottom-1">
							<Button
								type="button"
								variant="ghost"
								onClick={handleSendCode}
								disabled={countdown > 0 || sendCodeMutation.isPending}
								className="h-full px-4 text-primary hover:bg-transparent"
							>
								{countdown > 0 ? `${countdown}s` : "发送验证码"}
							</Button>
						</div>
					</div>
					{form.formState.errors.code && (
						<p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
					)}
				</div>

				{/* Remember Me */}
				<div className="flex items-center gap-2">
					<Checkbox
						id="remember-sms"
						checked={form.watch("rememberMe") ?? false}
						onCheckedChange={(checked) => form.setValue("rememberMe", checked as boolean)}
					/>
					<Label htmlFor="remember-sms" className="text-sm text-muted-foreground cursor-pointer">
						记住我
					</Label>
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

			{/* Captcha Dialog */}
			<AlertDialog open={isCaptchaOpen} onOpenChange={setIsCaptchaOpen}>
				<AlertDialogContent className="max-w-100">
					<AlertDialogHeader>
						<AlertDialogTitle>请输入图片验证码</AlertDialogTitle>
					</AlertDialogHeader>

					<form
						onSubmit={captchaForm.handleSubmit(handleCaptchaConfirm)}
						className="space-y-4 mt-2"
					>
						<div className="space-y-2">
							<div className="relative">
								<Input
									placeholder="请输入验证码"
									autoComplete="off"
									className="pr-32 bg-background/60 border-border/60 focus:bg-background/80 transition-colors h-11 text-foreground"
									{...captchaForm.register("captcha")}
								/>
								<div className="absolute right-1 top-1 bottom-1 w-28 overflow-hidden rounded-r-md border-l border-border bg-muted/50">
									{captchaLoading ? (
										<div className="flex h-full items-center justify-center">
											<RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
										</div>
									) : (
										captcha?.imageBase64 && (
											<button
												type="button"
												onClick={handleRefreshCaptcha}
												className="h-full w-full transition-opacity hover:opacity-80"
												aria-label="点击刷新验证码"
												title="点击刷新验证码"
											>
												<img
													src={captcha.imageBase64}
													alt="Captcha"
													className="h-full w-full object-cover dark:invert"
												/>
											</button>
										)
									)}
								</div>
							</div>
							{captchaForm.formState.errors.captcha && (
								<p className="text-sm text-destructive">
									{captchaForm.formState.errors.captcha.message}
								</p>
							)}
						</div>

						<AlertDialogFooter className="justify-end gap-2">
							<AlertDialogCancel className="mt-0">取消</AlertDialogCancel>
							<Button type="submit" disabled={sendCodeMutation.isPending}>
								{sendCodeMutation.isPending ? "发送中..." : "确认"}
							</Button>
						</AlertDialogFooter>
					</form>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
