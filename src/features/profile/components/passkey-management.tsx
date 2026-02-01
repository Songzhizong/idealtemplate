import { Edit2, Key, Plus, Trash2 } from "lucide-react"
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
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

	const _formatDate = (timestamp: number) => {
		if (!timestamp) return "-"
		return new Date(timestamp).toLocaleString()
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
										handleAddPasskey()
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
				<div className="rounded-lg border border-border/50 overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow className="border-border/50">
								<TableHead className="min-w-37.5">设备名称</TableHead>
								<TableHead className="min-w-30">创建时间</TableHead>
								<TableHead className="min-w-30">最后使用</TableHead>
								<TableHead className="w-24" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
										加载中...
									</TableCell>
								</TableRow>
							) : passkeys?.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
										暂无 Passkey
									</TableCell>
								</TableRow>
							) : (
								passkeys?.map((passkey) => (
									<TableRow key={passkey.id} className="border-border/50">
										<TableCell className="font-medium">
											{editingPasskey?.id === passkey.id ? (
												<div className="flex items-center gap-2">
													<Input
														size={1}
														className="h-8"
														value={editingPasskey.nickname}
														onChange={(e) =>
															setEditingPasskey({ ...editingPasskey, nickname: e.target.value })
														}
														onKeyDown={(e) => e.key === "Enter" && handleUpdateNickname()}
														onBlur={handleUpdateNickname}
														autoFocus
													/>
												</div>
											) : (
												<div className="flex items-center gap-2 group">
													{passkey.credentialNickname}
													<Button
														variant="ghost"
														size="icon"
														className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
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
										</TableCell>
										<TableCell>{formatTimestampToDateTime(passkey.createdTime)}</TableCell>
										<TableCell>{formatTimestampToRelativeTime(passkey.lastUsedTime)}</TableCell>
										<TableCell>
											<div className="flex items-center justify-end gap-2">
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
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	)
}
