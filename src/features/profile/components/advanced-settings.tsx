import {
	AlertTriangle,
	BookOpen,
	ExternalLink,
	FileText,
	HelpCircle,
	Mail,
	MessageCircle,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdvancedSettings() {
	const [deleteConfirmText, setDeleteConfirmText] = useState("")

	const helpResources = [
		{
			icon: BookOpen,
			title: "帮助文档",
			description: "查看详细的使用指南和教程",
			link: "#",
		},
		{
			icon: FileText,
			title: "常见问题",
			description: "快速找到常见问题的解答",
			link: "#",
		},
		{
			icon: MessageCircle,
			title: "在线客服",
			description: "与我们的支持团队实时交流",
			link: "#",
		},
		{
			icon: Mail,
			title: "发送邮件",
			description: "通过邮件联系技术支持",
			action: () => toast.info("邮件功能"),
		},
	]

	const handleDeleteAccount = () => {
		if (deleteConfirmText !== "DELETE") {
			toast.error("请输入正确的确认文本")
			return
		}
		toast.success("账号删除请求已提交")
		setDeleteConfirmText("")
	}

	return (
		<div className="space-y-6">
			{/* Help & Support */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<HelpCircle className="size-5" />
						<CardTitle>帮助与支持</CardTitle>
					</div>
					<CardDescription>获取帮助或联系我们的支持团队</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2">
						{helpResources.map((resource) => {
							const Icon = resource.icon
							return (
								<div
									key={resource.title}
									className="group relative overflow-hidden rounded-lg border border-border/50 bg-background p-5 transition-all hover:border-primary hover:shadow-md"
								>
									<div className="flex items-start gap-4">
										<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
											<Icon className="size-6" />
										</div>
										<div className="flex-1 space-y-1">
											<h3 className="font-medium transition-colors group-hover:text-primary">
												{resource.title}
											</h3>
											<p className="text-sm text-muted-foreground">{resource.description}</p>
											{resource.link ? (
												<a
													href={resource.link}
													className="mt-2 inline-flex items-center text-sm text-primary hover:underline"
													onClick={(e) => {
														e.preventDefault()
														toast.info(`打开 ${resource.title}`)
													}}
												>
													了解更多
													<ExternalLink className="ml-1 size-3" />
												</a>
											) : (
												<Button
													variant="link"
													size="sm"
													className="mt-2 h-auto p-0 text-sm"
													onClick={resource.action}
												>
													立即使用
												</Button>
											)}
										</div>
									</div>
								</div>
							)
						})}
					</div>

					<div className="mt-6 rounded-lg bg-muted p-4">
						<div className="flex gap-3">
							<HelpCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
							<div>
								<h4 className="mb-1 font-medium">需要更多帮助？</h4>
								<p className="text-sm text-muted-foreground">
									我们的支持团队周一至周五 9:00-18:00 在线。 平均响应时间为 2 小时。
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Delete Account */}
			<Card className="border-destructive">
				<CardHeader>
					<div className="flex items-center gap-2">
						<AlertTriangle className="size-5 text-destructive" />
						<CardTitle className="text-destructive">危险操作</CardTitle>
					</div>
					<CardDescription>删除账号后将无法恢复</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
						<h4 className="mb-2 flex items-center gap-2 font-medium">
							<AlertTriangle className="size-4" />
							删除账号前请注意
						</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-destructive">•</span>
								<span>所有个人数据将被永久删除，无法恢复</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-destructive">•</span>
								<span>你将失去对所有关联服务的访问权限</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-destructive">•</span>
								<span>订阅服务将被立即取消，不提供退款</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-0.5 text-destructive">•</span>
								<span>你的用户名可能会被其他用户使用</span>
							</li>
						</ul>
					</div>

					<div className="flex justify-end">
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">
									<AlertTriangle className="mr-2 size-4" />
									删除我的账号
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle className="flex items-center gap-2">
										<AlertTriangle className="size-5 text-destructive" />
										确认删除账号
									</AlertDialogTitle>
									<AlertDialogDescription className="space-y-4">
										<p>此操作无法撤销。这将永久删除你的账号并从我们的服务器上删除你的数据。</p>
										<div className="space-y-2">
											<Label htmlFor="delete-confirm">
												请输入 <span className="font-mono font-semibold">DELETE</span> 以确认：
											</Label>
											<Input
												id="delete-confirm"
												placeholder="输入 DELETE"
												value={deleteConfirmText}
												onChange={(e) => setDeleteConfirmText(e.target.value)}
												className="font-mono"
											/>
										</div>
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
										取消
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={handleDeleteAccount}
										disabled={deleteConfirmText !== "DELETE"}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
									>
										永久删除账号
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
