import { LogOut, User } from "lucide-react"
import { useState } from "react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLogoutHandler } from "@/hooks/use-logout-handler"

export function UserMenu() {
	const { handleLogout } = useLogoutHandler()
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

	const handleProfileClick = () => {
		// TODO: 跳转到个人中心页面
		console.log("跳转到个人中心")
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="relative h-10 w-10 rounded-full p-0"
					aria-label="User menu"
				>
					<Avatar className="h-9 w-9">
						<AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>我的账户</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleProfileClick}>
					<User className="mr-2 h-4 w-4" />
					<span>个人中心</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onSelect={() => setIsLogoutDialogOpen(true)}
					className="text-destructive focus:text-destructive"
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>退出登录</span>
				</DropdownMenuItem>
			</DropdownMenuContent>

			<AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确认退出 ?</AlertDialogTitle>
						<AlertDialogDescription>您确定要退出登录吗？</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>取消</AlertDialogCancel>
						<AlertDialogAction onClick={handleLogout}>确认退出</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</DropdownMenu>
	)
}
