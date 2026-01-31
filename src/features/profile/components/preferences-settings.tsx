import { Bell, Globe, Lock, Mail, MessageSquare } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function PreferencesSettings() {
	const [emailNotifications, setEmailNotifications] = useState({
		security: true,
		updates: true,
		marketing: false,
		comments: true,
		mentions: true,
	})

	const [smsNotifications, setSmsNotifications] = useState({
		security: true,
		login: false,
	})

	const [privacy, setPrivacy] = useState({
		profileVisibility: "public" as "public" | "friends" | "private",
		searchEngineIndexing: true,
		showEmail: false,
		showActivity: true,
	})

	const handleEmailNotificationChange = (key: string, value: boolean) => {
		setEmailNotifications({ ...emailNotifications, [key]: value })
		toast.success("通知设置已更新")
	}

	const handleSmsNotificationChange = (key: string, value: boolean) => {
		setSmsNotifications({ ...smsNotifications, [key]: value })
		toast.success("通知设置已更新")
	}

	const handlePrivacyChange = (key: string, value: string | boolean) => {
		setPrivacy({ ...privacy, [key]: value })
		toast.success("隐私设置已更新")
	}

	return (
		<div className="space-y-6">
			{/* Notification Settings */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Bell className="size-5" />
						<CardTitle>通知设置</CardTitle>
					</div>
					<CardDescription>配置你希望接收的通知类型</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Email Notifications */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Mail className="size-4 text-muted-foreground" />
							<h3 className="font-medium">邮件通知</h3>
						</div>

						<div className="space-y-4 pl-6">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="email-security">安全警报</Label>
									<p className="text-sm text-muted-foreground">账号安全相关的重要通知</p>
								</div>
								<Switch
									id="email-security"
									checked={emailNotifications.security}
									onCheckedChange={(value) => handleEmailNotificationChange("security", value)}
								/>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="email-updates">产品更新</Label>
									<p className="text-sm text-muted-foreground">新功能和产品更新通知</p>
								</div>
								<Switch
									id="email-updates"
									checked={emailNotifications.updates}
									onCheckedChange={(value) => handleEmailNotificationChange("updates", value)}
								/>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="email-marketing">营销邮件</Label>
									<p className="text-sm text-muted-foreground">促销活动和特别优惠</p>
								</div>
								<Switch
									id="email-marketing"
									checked={emailNotifications.marketing}
									onCheckedChange={(value) => handleEmailNotificationChange("marketing", value)}
								/>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="email-comments">评论回复</Label>
									<p className="text-sm text-muted-foreground">有人回复你的评论时通知</p>
								</div>
								<Switch
									id="email-comments"
									checked={emailNotifications.comments}
									onCheckedChange={(value) => handleEmailNotificationChange("comments", value)}
								/>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="email-mentions">提及通知</Label>
									<p className="text-sm text-muted-foreground">有人@提及你时通知</p>
								</div>
								<Switch
									id="email-mentions"
									checked={emailNotifications.mentions}
									onCheckedChange={(value) => handleEmailNotificationChange("mentions", value)}
								/>
							</div>
						</div>
					</div>

					<Separator className="my-6" />

					{/* SMS Notifications */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<MessageSquare className="size-4 text-muted-foreground" />
							<h3 className="font-medium">短信通知</h3>
						</div>

						<div className="space-y-4 pl-6">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="sms-security">安全警报</Label>
									<p className="text-sm text-muted-foreground">异常登录和安全事件通知</p>
								</div>
								<Switch
									id="sms-security"
									checked={smsNotifications.security}
									onCheckedChange={(value) => handleSmsNotificationChange("security", value)}
								/>
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="sms-login">登录通知</Label>
									<p className="text-sm text-muted-foreground">每次登录时发送短信通知</p>
								</div>
								<Switch
									id="sms-login"
									checked={smsNotifications.login}
									onCheckedChange={(value) => handleSmsNotificationChange("login", value)}
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Privacy Settings */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Lock className="size-5" />
						<CardTitle>隐私设置</CardTitle>
					</div>
					<CardDescription>控制你的信息可见性和共享选项</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div>
							<Label className="mb-3 block">个人资料可见性</Label>
							<RadioGroup
								value={privacy.profileVisibility}
								onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
								className="space-y-3"
							>
								<div className="flex items-start space-x-3 rounded-lg border border-border/50 p-4">
									<RadioGroupItem value="public" id="public" className="mt-0.5" />
									<div className="flex-1">
										<Label htmlFor="public" className="cursor-pointer">
											<div className="mb-1 flex items-center gap-2">
												<Globe className="size-4" />
												<span className="font-medium">公开</span>
											</div>
											<p className="text-sm font-normal text-muted-foreground">
												所有人都可以查看你的个人资料
											</p>
										</Label>
									</div>
								</div>

								<div className="flex items-start space-x-3 rounded-lg border border-border/50 p-4">
									<RadioGroupItem value="friends" id="friends" className="mt-0.5" />
									<div className="flex-1">
										<Label htmlFor="friends" className="cursor-pointer">
											<div className="mb-1 font-medium">仅好友</div>
											<p className="text-sm font-normal text-muted-foreground">
												只有你的好友可以查看你的个人资料
											</p>
										</Label>
									</div>
								</div>

								<div className="flex items-start space-x-3 rounded-lg border border-border/50 p-4">
									<RadioGroupItem value="private" id="private" className="mt-0.5" />
									<div className="flex-1">
										<Label htmlFor="private" className="cursor-pointer">
											<div className="mb-1 font-medium">私密</div>
											<p className="text-sm font-normal text-muted-foreground">
												只有你自己可以查看你的个人资料
											</p>
										</Label>
									</div>
								</div>
							</RadioGroup>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="search-indexing">搜索引擎索引</Label>
								<p className="text-sm text-muted-foreground">
									允许搜索引擎（如 Google）收录你的公开主页
								</p>
							</div>
							<Switch
								id="search-indexing"
								checked={privacy.searchEngineIndexing}
								onCheckedChange={(value) => handlePrivacyChange("searchEngineIndexing", value)}
							/>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="show-email">显示邮箱地址</Label>
								<p className="text-sm text-muted-foreground">在你的公开资料中显示邮箱地址</p>
							</div>
							<Switch
								id="show-email"
								checked={privacy.showEmail}
								onCheckedChange={(value) => handlePrivacyChange("showEmail", value)}
							/>
						</div>

						<Separator />

						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="show-activity">显示活动状态</Label>
								<p className="text-sm text-muted-foreground">让其他用户看到你的在线状态</p>
							</div>
							<Switch
								id="show-activity"
								checked={privacy.showActivity}
								onCheckedChange={(value) => handlePrivacyChange("showActivity", value)}
							/>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
