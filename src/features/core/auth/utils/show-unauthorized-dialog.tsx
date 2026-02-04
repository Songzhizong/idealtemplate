import { X } from "lucide-react"
import { createRoot } from "react-dom/client"
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface UnauthorizedDialogOptions {
	title?: string
	description?: string
	confirmText?: string
	onConfirm?: () => void
}

/**
 * 显示未授权警告对话框
 * 使用命令式 API 在非 React 上下文中显示 AlertDialog
 */
export function showUnauthorizedDialog(options: UnauthorizedDialogOptions = {}) {
	const {
		title = "登录已过期",
		description = "您的登录状态已过期，请重新登录。",
		confirmText = "确认",
		onConfirm,
	} = options

	return new Promise<void>((resolve) => {
		// 创建容器元素
		const container = document.createElement("div")
		document.body.appendChild(container)

		// 清理函数
		const cleanup = () => {
			root.unmount()
			document.body.removeChild(container)
			resolve()
		}

		// 处理确认
		const handleConfirm = () => {
			cleanup()
			onConfirm?.()
		}

		// 创建 React root 并渲染对话框
		const root = createRoot(container)
		root.render(
			<AlertDialog open={true}>
				<AlertDialogContent className="w-100">
					{/* Close button */}
					<button
						type="button"
						onClick={handleConfirm}
						className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
					>
						<X className="h-4 w-4" />
						<span className="sr-only">Close</span>
					</button>

					{/* Header with icon and title */}
					<div className="flex items-start gap-3 pr-8">
						{/* <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive">
							<X className="h-5 w-5 text-destructive-foreground" strokeWidth={3} />
						</div> */}
						<div className="flex-1 space-y-2 pt-1">
							<AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
							<AlertDialogDescription className="text-sm text-text-secondary mt-1">
								{description}
							</AlertDialogDescription>
						</div>
					</div>

					{/* Footer with confirm button */}
					<div className="flex justify-end pt-1">
						<Button
							size="sm"
							onClick={handleConfirm}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{confirmText}
						</Button>
					</div>
				</AlertDialogContent>
			</AlertDialog>,
		)
	})
}
