import { ChevronLeft, Loader2, User2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	type LoginResponse,
	LoginResponseType,
	type SelectAccountTicket,
	useSelectAccount,
} from "@/features/core/auth/api/login"
import { useLoginHandler } from "@/features/core/auth/hooks/use-login-handler"
import { cn } from "@/lib/utils"

type SelectAccountFormProps = {
	ticket: SelectAccountTicket
	onSuccess: (response: LoginResponse) => void
	onBack: () => void
}

export function SelectAccountForm({ ticket, onSuccess, onBack }: SelectAccountFormProps) {
	const [selectedUid, setSelectedUid] = useState<string | null>(null)
	const selectMutation = useSelectAccount()
	const { handleLoginSuccess } = useLoginHandler()

	const handleSelect = (uid: string) => {
		setSelectedUid(uid)
	}

	const handleConfirm = () => {
		if (!selectedUid) {
			toast.error("请选择一个账号")
			return
		}

		selectMutation.mutate(
			{ uid: selectedUid, ticket: ticket.ticket },
			{
				onSuccess: (response) => {
					if (response.type === LoginResponseType.TOKEN) {
						void handleLoginSuccess(response)
					} else {
						onSuccess(response)
					}
				},
				onError: () => {
					toast.error("选择账号失败，请稍后重试")
				},
			},
		)
	}

	const formatDate = (timestamp: number | string) => {
		return new Date(timestamp).toLocaleString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		})
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

			<div className="space-y-4">
				<div className="text-center">
					<h3 className="text-xl font-bold text-foreground">选择账号</h3>
					<p className="text-sm text-muted-foreground mt-1">
						检测到多个匹配的账号，请选择要登录的账号
					</p>
				</div>

				<div className="space-y-3 max-h-[360px] overflow-y-auto p-0.5 custom-scrollbar">
					{ticket.accounts.map((account) => (
						<button
							key={account.uid}
							type="button"
							onClick={() => handleSelect(account.uid)}
							className={cn(
								"w-full p-4 rounded-2xl border transition-all text-left flex items-start gap-4",
								selectedUid === account.uid
									? "border-primary bg-primary/5 ring-1 ring-primary"
									: "border-border/60 bg-background/40 hover:bg-background/60",
							)}
						>
							<Avatar className="h-12 w-12 border-2 border-background shadow-sm">
								<AvatarFallback className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground">
									<User2 className="w-6 h-6" />
								</AvatarFallback>
							</Avatar>

							<div className="flex-1 space-y-1">
								<div className="flex items-center gap-2">
									<p className="font-semibold text-foreground">{account.account}</p>
									{account.blocked && (
										<Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
											已禁用
										</Badge>
									)}
									{account.accountExpired && (
										<Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
											已过期
										</Badge>
									)}
								</div>

								<div className="text-xs text-muted-foreground space-y-1">
									{account.email && <p className="truncate opacity-80">邮箱: {account.email}</p>}
									{account.phone && <p className="opacity-80">手机: {account.phone}</p>}
									<div className="flex items-center gap-4 pt-1 opacity-60 text-[10px]">
										<span>注册于 {formatDate(account.registrationTime)}</span>
										{account.lastActiveTime && (
											<span>活跃于 {formatDate(account.lastActiveTime)}</span>
										)}
									</div>
								</div>
							</div>
						</button>
					))}
				</div>
			</div>

			<Button
				type="button"
				onClick={handleConfirm}
				disabled={!selectedUid || selectMutation.isPending}
				className="w-full h-12 text-base shadow-md hover:shadow-lg transition-all rounded-2xl"
			>
				{selectMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
				确认登录
			</Button>

			<div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
				<p className="text-[11px] text-muted-foreground flex items-start gap-2 leading-relaxed">
					<span className="font-bold text-primary shrink-0 text-xs">安全提示:</span>
					请确认选择的账号信息正确无误。如有任何疑问，请联系客服或重新验证身份。
				</p>
			</div>
		</div>
	)
}
