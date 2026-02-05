import { useNavigate } from "@tanstack/react-router"
import { Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLoginHandler } from "@/features/core/auth/hooks/use-login-handler"
import { type LoginResponse, LoginResponseType } from "../api/login"
import { usePasskeyLogin } from "../api/passkey"

export function PasskeyLoginForm({
	onResponse,
}: {
	onResponse?: (response: LoginResponse) => void
}) {
	const _navigate = useNavigate()
	const passkeyLogin = usePasskeyLogin()
	const { handleLoginSuccess } = useLoginHandler()

	const handlePasskeyLogin = async () => {
		try {
			const result = await passkeyLogin.mutateAsync()

			if (result.type === LoginResponseType.TOKEN) {
				void handleLoginSuccess(result)
			} else {
				// 处理其他响应类型（如 MFA 等）
				onResponse?.(result)
			}
		} catch (error) {
			console.error("Passkey login error:", error)
		}
	}

	return (
		<div className="space-y-6">
			<div className="text-center py-7">
				<div className="flex justify-center mb-6">
					<div className="w-22 h-22 bg-linear-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
						<Fingerprint className="w-14 h-14 text-primary-foreground" />
					</div>
				</div>
				<h3 className="text-xl font-semibold text-foreground mb-3">使用 Passkey 登录</h3>
				<p className="text-muted-foreground mb-8 px-4">
					使用生物识别、面容 ID 或设备密码快速安全登录
				</p>
				<Button
					onClick={handlePasskeyLogin}
					disabled={passkeyLogin.isPending}
					className="w-full h-12 bg-linear-to-r from-primary to-primary/70 hover:from-primary/80 hover:to-primary text-primary-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all rounded-2xl"
				>
					{passkeyLogin.isPending ? "正在验证..." : "使用 Passkey 登录"}
				</Button>
			</div>

			{/* Info Box */}
			{/*<div className="bg-info-subtle border border-info/30 rounded-xl p-4">*/}
			{/*	<p className="text-sm text-info">*/}
			{/*		<strong>What is a Passkey?</strong>*/}
			{/*		<br />*/}
			{/*		Passkey is a safer and easier way to sign in without passwords, using your device's*/}
			{/*		biometrics or PIN.*/}
			{/*	</p>*/}
			{/*</div>*/}
		</div>
	)
}
