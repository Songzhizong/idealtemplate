import { Cpu, Fingerprint, Lock, Server, Smartphone } from "lucide-react"
import { useEffect, useState } from "react"
import { BaseLink } from "@/components/common/base-link"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type LoginResponse, LoginResponseType } from "@/features/core/auth/api/login"
import { webauthnUtils } from "@/lib/webauthn"
import { ChangePasswordForm } from "./change-password-form"
import { MfaForm } from "./mfa-form"
import { PasskeyLoginForm } from "./passkey-login-form"
import { PasswordLoginForm } from "./password-login-form"
import { SelectAccountForm } from "./select-account-form"
import { SmsLoginForm } from "./sms-login-form"

/**
 * Login Page Component
 * Modern login page with multiple authentication methods
 */
export function LoginPage() {
	const [activeTab, setActiveTab] = useState<"password" | "sms" | "passkey">("password")
	const [view, setView] = useState<"login" | "select-account" | "mfa" | "change-password">("login")
	const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null)
	const [passkeySupported, setPasskeySupported] = useState<boolean>(true) // Default to true to avoid flicker if possible, or false to be safe

	useEffect(() => {
		const checkSupport = async () => {
			const supported = await webauthnUtils.isSupported()
			setPasskeySupported(supported)
		}
		void checkSupport()
	}, [])

	const handleResponse = (response: LoginResponse) => {
		setLoginResponse(response)
		switch (response.type) {
			case LoginResponseType.SELECT_ACCOUNT:
				setView("select-account")
				break
			case LoginResponseType.NEED_MFA:
				setView("mfa")
				break
			case LoginResponseType.PASSWORD_EXPIRED:
			case LoginResponseType.PASSWORD_ILLEGAL:
				setView("change-password")
				break
			default:
				// TOKEN type is handled by the forms themselves for redirection
				break
		}
	}

	const handleBackToLogin = () => {
		setView("login")
		setLoginResponse(null)
	}

	return (
		<div className="size-full min-h-screen bg-linear-to-br from-primary/10 via-primary/5 to-background dark:from-primary/10 dark:via-primary/5 dark:to-background relative overflow-hidden transition-colors">
			{/* Brand Header */}
			<div className="absolute top-6 left-8 z-50 flex items-center gap-2.5">
				<div className="w-10 h-10 bg-linear-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group animate-in fade-in slide-in-from-left-4 duration-700">
					<Cpu className="w-6 h-6 text-primary-foreground transition-transform group-hover:rotate-12" />
				</div>
				<span className="text-2xl font-bold tracking-tight bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
					Infera
				</span>
			</div>

			{/* Theme Toggle */}
			<div className="absolute top-6 right-8 z-50">
				<ThemeToggle />
			</div>

			{/* Decorative Background Elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 dark:bg-primary/30 rounded-full blur-3xl" />
				<div className="absolute top-1/2 -left-20 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl" />
				<div className="absolute bottom-0 right-1/3 w-64 h-64 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl" />
			</div>

			{/* Main Content Grid */}
			<div className="relative size-full min-h-screen grid lg:grid-cols-2 max-w-450 mx-auto">
				{/* Left Side - Brand Area */}
				<div className="hidden lg:flex flex-col justify-center items-start px-16 xl:px-24  animate-float">
					<div className="max-w-xl space-y-8">
						{/* Logo */}
						<div className="flex items-center gap-3">
							<h1 className="text-5xl font-extrabold tracking-tight text-foreground leading-tight">
								推理，
								<span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
									唯快不破
								</span>
							</h1>
						</div>

						{/* Brand Slogan */}
						<div className="space-y-4">
							<p className="text-xl text-muted-foreground leading-relaxed">
								面向 AI 模型服务的统一裸金属运营平台。
								<br />
								消除虚拟化开销，实现对异构算力资源的绝对掌控。
							</p>
						</div>

						{/* Feature List */}
						<div className="space-y-4 pt-8">
							{[
								{
									title: "零损耗性能",
									desc: "无延迟的直通硬件执行。彻底释放你每一 TFLOPS 的算力潜能。",
								},
								{
									title: "异构大一统",
									desc: "无缝聚合 Ray、vLLM 节点。一个 Master 接口，纳管任意硬件。",
								},
								{
									title: "安全模型流",
									desc: "签名直连分发系统，确保模型从存储安全直达算力节点，避开流量瓶颈。",
								},
							].map((feature, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: Static list
								<div key={index} className="flex items-start gap-4">
									<div className="w-2 h-2 bg-primary rounded-full mt-2" />
									<div>
										<h3 className="font-semibold text-foreground">{feature.title}</h3>
										<p className="text-sm text-muted-foreground">{feature.desc}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Right Side - Login Form Area */}
				<div className="flex items-center justify-center px-6 py-12 lg:px-8">
					{/* Glassmorphism Card */}
					<div className="w-full max-w-130">
						<div className="backdrop-blur-lg bg-background/60 dark:bg-background/50 border border-border/60 rounded-3xl shadow-2xl p-8 lg:p-10 min-h-125 flex flex-col">
							{/* Mobile Logo */}
							<div className="lg:hidden flex items-center justify-center gap-3 mb-8">
								<div className="w-10 h-10 bg-linear-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
									<Server className="w-6 h-6 text-primary-foreground" />
								</div>
								<h1 className="text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
									Infera
								</h1>
							</div>

							{view === "login" ? (
								<>
									{/* Form Title */}
									<div className="text-center mb-8">
										<h2 className="text-2xl lg:text-3xl font-bold text-foreground">登录您的账户</h2>
										<p className="text-muted-foreground mt-2">选择您偏好的登录方式</p>
									</div>

									{/* Tabs */}
									<Tabs
										value={activeTab}
										onValueChange={(v) => setActiveTab(v as "password" | "sms" | "passkey")}
										className="w-full"
									>
										<TabsList
											className={`grid w-full ${
												passkeySupported ? "grid-cols-3" : "grid-cols-2"
											} mb-6 bg-muted/50 dark:bg-muted/40 p-1 rounded-2xl backdrop-blur-sm h-11`}
										>
											<TabsTrigger
												value="password"
												className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-foreground/10 data-[state=inactive]:text-muted-foreground rounded-xl transition-all duration-200"
											>
												<Lock className="w-4 h-4" />
												密码
											</TabsTrigger>
											<TabsTrigger
												value="sms"
												className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-foreground/10 data-[state=inactive]:text-muted-foreground rounded-xl transition-all duration-200"
											>
												<Smartphone className="w-4 h-4" />
												验证码
											</TabsTrigger>
											{passkeySupported && (
												<TabsTrigger
													value="passkey"
													className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:shadow-foreground/10 data-[state=inactive]:text-muted-foreground rounded-xl transition-all duration-200"
												>
													<Fingerprint className="w-4 h-4" />
													Passkey
												</TabsTrigger>
											)}
										</TabsList>

										<div className="min-h-80">
											<TabsContent value="password">
												<PasswordLoginForm onResponse={handleResponse} />
											</TabsContent>

											<TabsContent value="sms">
												<SmsLoginForm onResponse={handleResponse} />
											</TabsContent>

											{passkeySupported && (
												<TabsContent value="passkey">
													<PasskeyLoginForm />
												</TabsContent>
											)}
										</div>
									</Tabs>

									{/* Divider */}
									<div className="relative my-8">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-border/60" />
										</div>
										<div className="relative flex justify-center text-sm">
											<span className="px-4 bg-background/50 text-muted-foreground backdrop-blur-xs rounded-full">
												或使用以下方式登录
											</span>
										</div>
									</div>

									{/* Social Login */}
									<div className="grid grid-cols-2 gap-4">
										<Button
											variant="outline"
											type="button"
											className="h-11 bg-background/60 border-border/60 hover:bg-background/80 text-foreground"
										>
											<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
												<path
													fill="currentColor"
													d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
												/>
												<path
													fill="currentColor"
													d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
												/>
												<path
													fill="currentColor"
													d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
												/>
												<path
													fill="currentColor"
													d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
												/>
											</svg>
											Google
										</Button>
										<Button
											variant="outline"
											type="button"
											className="h-11 bg-background/60 border-border/60 hover:bg-background/80 text-foreground"
										>
											<svg
												className="w-5 h-5 mr-2"
												fill="currentColor"
												viewBox="0 0 24 24"
												aria-hidden="true"
											>
												<path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
											</svg>
											GitHub
										</Button>
									</div>

									{/* Register Link */}
									<p className="text-center text-sm text-muted-foreground mt-8">
										还没有账户?
										<BaseLink
											to="/register"
											className="text-primary hover:text-primary/80 font-semibold ml-3"
										>
											立即注册
										</BaseLink>
									</p>
								</>
							) : view === "select-account" ? (
								loginResponse?.selectAccountTicket && (
									<SelectAccountForm
										ticket={loginResponse.selectAccountTicket}
										onSuccess={handleResponse}
										onBack={handleBackToLogin}
									/>
								)
							) : view === "mfa" ? (
								loginResponse?.mfaTicket && (
									<MfaForm
										ticket={loginResponse.mfaTicket}
										onSuccess={handleResponse}
										onBack={handleBackToLogin}
									/>
								)
							) : (
								view === "change-password" &&
								loginResponse?.passwordTicket && (
									<ChangePasswordForm
										ticket={loginResponse.passwordTicket}
										type={
											loginResponse.type as
												| LoginResponseType.PASSWORD_EXPIRED
												| LoginResponseType.PASSWORD_ILLEGAL
										}
										onSuccess={handleResponse}
										onBack={handleBackToLogin}
									/>
								)
							)}
						</div>

						{/* Footer */}
						<p className="text-center text-xs text-muted-foreground mt-6">
							登录即表示您同意我们的
							<BaseLink to="/terms" className="text-primary hover:underline mx-1">
								服务条款
							</BaseLink>
							和
							<BaseLink to="/privacy" className="text-primary hover:underline mx-1">
								隐私政策
							</BaseLink>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
