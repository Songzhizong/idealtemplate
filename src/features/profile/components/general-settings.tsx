import { BadgeCheck, Building2, Mail, Phone, User, Users } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/auth-store"
import { getAvatarByHash } from "@/lib/avatar-utils"
import type { TenantInfo } from "@/types/auth"

const MOCK_TENANTS: TenantInfo[] = [
	{ id: "tnt_xyz123", name: "科技创新有限公司", abbreviation: "科技创新", blocked: false },
	{ id: "tnt_abc456", name: "数字化咨询公司", abbreviation: "数字咨询", blocked: false },
	{ id: "tnt_def789", name: "云服务中心", abbreviation: "云服务", blocked: true },
]

export function GeneralSettings() {
	const user = useAuthStore((state) => state.user)

	const [linkedAccounts] = useState([
		{ id: "google", name: "Google", connected: true, email: "song@gmail.com" },
		{ id: "github", name: "GitHub", connected: true, username: "song" },
		{ id: "facebook", name: "Facebook", connected: false },
		{ id: "twitter", name: "Twitter", connected: false },
	])

	const handleToggleAccount = (_accountId: string, connected: boolean) => {
		if (connected) {
			toast.success("账号已断开连接")
		} else {
			toast.success("账号连接成功")
		}
	}

	if (!user) return null

	// 合并真实数据与模拟数据以供展示
	const tenants = user.accessibleTenants?.length > 0 ? user.accessibleTenants : MOCK_TENANTS

	return (
		<div className="space-y-6">
			{/* Profile Information */}
			<Card>
				<CardHeader>
					<CardTitle>个人信息</CardTitle>
					<CardDescription>你的账户基本信息和联系方式</CardDescription>
				</CardHeader>
				<CardContent className="space-y-8">
					{/* Avatar & Header Section */}
					<div className="flex items-center gap-6">
						<Avatar className="size-20 border-2 border-border/50">
							<AvatarImage src={getAvatarByHash(user.userId)} alt={user.name} />
							<AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
						</Avatar>
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<h3 className="text-2xl font-bold tracking-tight">{user.name}</h3>
								<Badge
									variant="secondary"
									className="border-none bg-success/10 px-2 py-0 text-success hover:bg-success/20"
								>
									<BadgeCheck className="mr-1 size-3" />
									已认证
								</Badge>
							</div>
							<p className="text-muted-foreground">{user.email || "未绑定邮箱"}</p>
						</div>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
						{/* Info Grid Items */}
						<InfoItem
							icon={<User className="size-4 text-muted-foreground" />}
							label="用户账号"
							value={user.account || "N/A"}
						/>

						<InfoItem
							icon={<Building2 className="size-4 text-muted-foreground" />}
							label="所属组织"
							value={user.tenantName || "默认租户"}
						/>

						<InfoItem
							icon={<Mail className="size-4 text-muted-foreground" />}
							label="邮箱地址"
							value={user.email || "未设置"}
							extra={
								user.email && (
									<Badge
										variant="outline"
										className="ml-2 bg-success/5 font-normal text-success border-success/30"
									>
										已验证
									</Badge>
								)
							}
						/>

						<InfoItem
							icon={<Phone className="size-4 text-muted-foreground" />}
							label="手机号码"
							value={user.phone || "未设置"}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Accessible Organizations */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<div className="flex items-center gap-2">
						<Users className="size-5 text-muted-foreground" />
						<CardTitle className="text-lg">可访问的组织</CardTitle>
					</div>
					<Badge variant="secondary" className="font-normal text-muted-foreground">
						{tenants.length} 个组织
					</Badge>
				</CardHeader>
				<CardContent className="px-0">
					<div className="divide-y divide-border/50">
						{tenants.map((tenant) => (
							<TenantListItem
								key={tenant.id}
								tenant={tenant}
								isCurrent={tenant.id === "tnt_xyz123" || tenant.id === user.tenantId}
							/>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Linked Accounts */}
			<Card>
				<CardHeader>
					<CardTitle>关联账号</CardTitle>
					<CardDescription>连接你的第三方账号以便快速登录</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{linkedAccounts.map((account) => (
							<div
								key={account.id}
								className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30"
							>
								<div className="flex items-center gap-4">
									<div className="flex size-10 items-center justify-center rounded-full bg-secondary">
										<span className="text-sm font-semibold">{account.name.charAt(0)}</span>
									</div>
									<div>
										<div className="font-medium">{account.name}</div>
										{account.connected && (
											<div className="text-sm text-muted-foreground">
												{"email" in account
													? account.email
													: `@${(account as { username: string }).username}`}
											</div>
										)}
									</div>
								</div>
								<Button
									variant={account.connected ? "outline" : "default"}
									size="sm"
									className="min-w-20"
									onClick={() => handleToggleAccount(account.id, account.connected)}
								>
									{account.connected ? "断开连接" : "连接"}
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

interface InfoItemProps {
	icon: React.ReactNode
	label: string
	value: string
	extra?: React.ReactNode
	valueClassName?: string
}

function InfoItem({ icon, label, value, extra, valueClassName }: InfoItemProps) {
	return (
		<div className="flex flex-col gap-1.5 rounded-lg border border-border/30 bg-muted/5 p-4 transition-all hover:border-border/60 hover:bg-muted/10">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				{icon}
				<span>{label}</span>
			</div>
			<div className="flex items-center">
				<span className={`text-base font-medium ${valueClassName || "text-foreground"}`}>
					{value}
				</span>
				{extra}
			</div>
		</div>
	)
}

function TenantListItem({ tenant, isCurrent }: { tenant: TenantInfo; isCurrent: boolean }) {
	return (
		<div className="flex items-center justify-between p-4 px-6 transition-colors hover:bg-muted/30">
			<div className="flex items-center gap-4">
				{/* Square Avatar with initial */}
				<div className="flex size-11 items-center justify-center rounded-lg bg-secondary text-base font-semibold text-secondary-foreground">
					{tenant.name.charAt(0)}
				</div>

				<div className="space-y-0.5">
					<div className="flex items-center gap-2">
						<span className="font-semibold tracking-tight">{tenant.name}</span>
						{isCurrent && (
							<Badge className="bg-blue-600 px-1.5 py-0 text-[10px] font-medium text-white hover:bg-blue-600/90">
								当前
							</Badge>
						)}
					</div>
					<div className="text-xs text-muted-foreground">
						{tenant.abbreviation}
						{" · "}
						<span className="font-mono text-[10px]">{tenant.id}</span>
					</div>
				</div>
			</div>

			<div>
				{tenant.blocked ? (
					<Badge className="bg-red-600 px-2.5 font-normal text-white hover:bg-red-600/90">
						已封禁
					</Badge>
				) : (
					<Badge variant="secondary" className="px-2.5 font-normal text-muted-foreground">
						可访问
					</Badge>
				)}
			</div>
		</div>
	)
}
