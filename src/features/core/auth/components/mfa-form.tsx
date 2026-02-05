import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, KeyRound, Mail, ShieldCheck, Smartphone } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	FactorType,
	type LoginResponse,
	LoginResponseType,
	type MfaTicket,
	type MultifactorLoginRequest,
	MultifactorLoginRequestSchema,
	useMultifactorLogin,
	useSendMfaEmailCode,
	useSendMfaSmsCode,
} from "@/features/core/auth/api/login"
import { useLoginHandler } from "@/features/core/auth/hooks/use-login-handler"

type MfaFormProps = {
	ticket: MfaTicket
	onSuccess: (response: LoginResponse) => void
	onBack: () => void
}

export function MfaForm({ ticket, onSuccess, onBack }: MfaFormProps) {
	const [activeMethod, setActiveMethod] = useState<FactorType>(ticket.methods[0] || FactorType.TOTP)
	const [countdown, setCountdown] = useState(0)

	const mfaMutation = useMultifactorLogin()
	const sendSmsMutation = useSendMfaSmsCode()
	const sendEmailMutation = useSendMfaEmailCode()
	const { handleLoginSuccess } = useLoginHandler()

	const form = useForm<MultifactorLoginRequest>({
		resolver: zodResolver(MultifactorLoginRequestSchema),
		defaultValues: {
			ticket: ticket.ticket,
			method: activeMethod,
			code: "",
		},
	})

	// Update method when tab changes
	useEffect(() => {
		form.setValue("method", activeMethod)
		form.setValue("code", "")
	}, [activeMethod, form])

	// Countdown timer
	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
			return () => clearTimeout(timer)
		}
	}, [countdown])

	const handleSendCode = (method: FactorType) => {
		if (method === FactorType.SMS) {
			sendSmsMutation.mutate(ticket.ticket, {
				onSuccess: () => {
					toast.success("短信验证码发送成功！")
					setCountdown(60)
				},
				onError: () => {
					toast.error("短信验证码发送失败")
				},
			})
		} else if (method === FactorType.EMAIL) {
			sendEmailMutation.mutate(ticket.ticket, {
				onSuccess: () => {
					toast.success("邮件验证码发送成功！")
					setCountdown(60)
				},
				onError: () => {
					toast.error("邮件验证码发送失败")
				},
			})
		}
	}

	const onSubmit = (data: MultifactorLoginRequest) => {
		mfaMutation.mutate(data, {
			onSuccess: (response) => {
				if (response.type === LoginResponseType.TOKEN) {
					void handleLoginSuccess(response)
				} else {
					onSuccess(response)
				}
			},
			onError: () => {
				toast.error("验证失败，请检查验证码是否正确")
			},
		})
	}

	const getMethodLabel = (method: FactorType) => {
		switch (method) {
			case FactorType.TOTP:
				return "身份验证器"
			case FactorType.SMS:
				return "短信验证"
			case FactorType.EMAIL:
				return "邮件验证"
			case FactorType.RECOVERY_CODE:
				return "恢复代码"
		}
	}

	const getMethodIcon = (method: FactorType) => {
		switch (method) {
			case FactorType.TOTP:
				return <ShieldCheck className="w-4 h-4" />
			case FactorType.SMS:
				return <Smartphone className="w-4 h-4" />
			case FactorType.EMAIL:
				return <Mail className="w-4 h-4" />
			case FactorType.RECOVERY_CODE:
				return <KeyRound className="w-4 h-4" />
		}
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
				<h3 className="text-xl font-bold text-foreground">双重身份验证</h3>
				<p className="text-sm text-muted-foreground mt-1">
					为了您的账户安全，请使用以下方式验证您的身份
				</p>
			</div>

			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<Tabs
					value={activeMethod}
					onValueChange={(v) => setActiveMethod(v as FactorType)}
					className="w-full"
				>
					<TabsList
						className="grid w-full h-11 bg-muted/50 p-1 rounded-2xl backdrop-blur-sm"
						style={{ gridTemplateColumns: `repeat(${ticket.methods.length}, 1fr)` }}
					>
						{ticket.methods.map((method) => (
							<TabsTrigger
								key={method}
								value={method}
								className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-foreground/10 data-[state=inactive]:text-muted-foreground rounded-xl transition-all duration-200"
							>
								{getMethodIcon(method)}
								<span className="hidden sm:inline">{getMethodLabel(method)}</span>
							</TabsTrigger>
						))}
					</TabsList>

					<div className="mt-6">
						{ticket.methods.map((method) => (
							<TabsContent key={method} value={method} className="space-y-4 outline-hidden">
								{/* Send Code Action for SMS/Email */}
								{(method === FactorType.SMS || method === FactorType.EMAIL) && (
									<div className="flex justify-center">
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="rounded-full px-6 bg-background/60 border-border/60"
											onClick={() => handleSendCode(method)}
											disabled={
												countdown > 0 || sendSmsMutation.isPending || sendEmailMutation.isPending
											}
										>
											{countdown > 0
												? `${countdown}秒后重新发送`
												: method === FactorType.SMS
													? "发送短信验证码"
													: "发送邮件验证码"}
										</Button>
									</div>
								)}

								<div className="space-y-2 p-0.5">
									<Label htmlFor={`mfa-code-${method}`} className="text-foreground">
										{method === FactorType.TOTP
											? "请输入身份验证器上的6位动态码"
											: method === FactorType.RECOVERY_CODE
												? "请输入恢复代码"
												: "请输入收到的验证码"}
									</Label>
									<div className="relative">
										<Input
											id={`mfa-code-${method}`}
											placeholder={method === FactorType.RECOVERY_CODE ? "恢复代码" : "6位验证码"}
											autoComplete="one-time-code"
											maxLength={method === FactorType.RECOVERY_CODE ? undefined : 6}
											{...form.register("code")}
											className="h-12 bg-background/60 border-border/60 focus:bg-background/80 transition-colors rounded-2xl text-center text-lg tracking-widest font-mono"
										/>
									</div>
									{form.formState.errors.code && (
										<p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
									)}
								</div>
							</TabsContent>
						))}
					</div>
				</Tabs>

				<Button
					type="submit"
					className="w-full h-12 bg-linear-to-r from-primary to-primary/70 hover:from-primary/80 hover:to-primary text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all rounded-2xl"
					disabled={mfaMutation.isPending}
				>
					{mfaMutation.isPending ? "验证中..." : "确 认"}
				</Button>
			</form>

			<div className="bg-info-subtle border border-info/30 rounded-xl p-3">
				<p className="text-[11px] text-info flex items-start gap-2 leading-relaxed text-center justify-center">
					为了您的账户安全，请勿将验证码泄露给他人。
				</p>
			</div>
		</div>
	)
}
