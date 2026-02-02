import { Check, Edit2, Fingerprint, Key, Plus, Trash2, X } from "lucide-react"
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
import { formatTimestampToDateTime, formatTimestampToRelativeTime } from "@/lib/time-utils.ts"
import { useDeletePasskey, usePasskeys, useRegisterPasskey, useUpdatePasskey } from "../api/passkey"

export function PasskeyManagement() {
	const { data: passkeys, isLoading } = usePasskeys()
	const registerMutation = useRegisterPasskey()
	const updateMutation = useUpdatePasskey()
	const deleteMutation = useDeletePasskey()

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [newNickname, setNewNickname] = useState("")
	const [editingPasskey, setEditingPasskey] = useState<{ id: string; nickname: string } | null>(
		null,
	)

	const handleAddPasskey = async () => {
		if (!newNickname.trim()) {
			toast.error("请输入设备名称")
			return
		}
		try {
			await registerMutation.mutateAsync(newNickname)
			toast.success("Passkey 已成功添加")
			setIsAddDialogOpen(false)
			setNewNickname("")
		} catch (error) {
			console.error("Failed to register passkey:", error)
			toast.error("添加 Passkey 失败")
		}
	}

	const handleUpdateNickname = async () => {
		if (!editingPasskey || !editingPasskey.nickname.trim()) return
		try {
			await updateMutation.mutateAsync({
				id: editingPasskey.id,
				nickname: editingPasskey.nickname,
			})
			toast.success("Passkey 名称已更新")
			setEditingPasskey(null)
		} catch (_error) {
			toast.error("更新失败")
		}
	}

	const handleDeletePasskey = async (id: string) => {
		try {
			await deleteMutation.mutateAsync(id)
			toast.success("Passkey 已删除")
		} catch (_error) {
			toast.error("删除失败")
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-2">
							<Key className="size-5" />
							<CardTitle>Passkey 管理</CardTitle>
						</div>
						<CardDescription className="mt-1.5">
							使用 Passkey 实现更安全、更便捷的无密码登录
						</CardDescription>
					</div>
					<AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
						<AlertDialogTrigger asChild>
							<Button size="sm">
								<Plus className="mr-2 size-4" />
								添加 Passkey
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>添加新 Passkey</AlertDialogTitle>
								<AlertDialogDescription>
									请为你的新 Passkey 设置一个易于识别的名称（例如：MacBook Pro - Chrome）
								</AlertDialogDescription>
							</AlertDialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="nickname">设备名称</Label>
									<Input
										id="nickname"
										value={newNickname}
										onChange={(e) => setNewNickname(e.target.value)}
										placeholder="例如：iPhone, 工作电脑"
									/>
								</div>
							</div>
							<AlertDialogFooter>
								<AlertDialogCancel>取消</AlertDialogCancel>
								<AlertDialogAction
									onClick={(e) => {
										e.preventDefault()
										void handleAddPasskey()
									}}
									disabled={registerMutation.isPending}
								>
									{registerMutation.isPending ? "创建中..." : "下一步"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</CardHeader>
			<CardContent>
				<div className="rounded-lg border border-border/50 divide-y divide-border/50">
					{isLoading ? (
						<div className="py-8 text-center text-muted-foreground">加载中...</div>
					) : passkeys?.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">暂无 Passkey</div>
					) : (
						passkeys?.map((passkey) => (
							<div
								key={passkey.id}
								className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="flex items-start gap-4">
									<div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
										<Fingerprint className="size-5" />
									</div>
									<div className="grid gap-1">
										{editingPasskey?.id === passkey.id ? (
											<div className="flex items-center gap-2">
												<Input
													size={1}
													className="h-8 w-64 sm:w-80"
													value={editingPasskey.nickname}
													onChange={(e) =>
														setEditingPasskey({
															...editingPasskey,
															nickname: e.target.value,
														})
													}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															handleUpdateNickname()
														}
														if (e.key === "Escape") {
															setEditingPasskey(null)
														}
													}}
													autoFocus
												/>
												<div className="flex items-center gap-1">
													<Button
														variant="ghost"
														size="icon"
														className="size-7 text-foreground"
														onClick={handleUpdateNickname}
													>
														<Check className="size-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="size-7 text-muted-foreground"
														onClick={() => setEditingPasskey(null)}
													>
														<X className="size-4" />
													</Button>
												</div>
											</div>
										) : (
											<div className="flex items-center gap-2 group">
												<p className="text-base font-medium text-foreground">
													{passkey.credentialNickname}
												</p>
												<Button
													variant="ghost"
													size="icon"
													className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
													onClick={() =>
														setEditingPasskey({
															id: passkey.id,
															nickname: passkey.credentialNickname,
														})
													}
												>
													<Edit2 className="size-3" />
												</Button>
											</div>
										)}
										<p className="text-sm text-muted-foreground">
											最后使用：
											<span className="ml-1 text-foreground">
												{formatTimestampToRelativeTime(passkey.lastUsedTime)}
											</span>
										</p>
									</div>
								</div>
								<div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
									<div className="flex flex-col items-start gap-0.5 text-xs text-muted-foreground sm:items-end">
										<span className="hidden sm:inline-block">创建于</span>
										<span className="font-mono text-foreground">
											{formatTimestampToDateTime(passkey.createdTime)}
										</span>
									</div>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="size-8 text-destructive hover:text-destructive"
											>
												<Trash2 className="size-4" />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>确认删除</AlertDialogTitle>
												<AlertDialogDescription>
													确定要删除 "{passkey.credentialNickname}" 这个 Passkey
													吗？此操作无法撤销。
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>取消</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleDeletePasskey(passkey.id)}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
												>
													删除
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	)
}
