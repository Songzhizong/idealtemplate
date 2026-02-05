import { Check, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme/theme-provider"
import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useResolvedTheme } from "@/hooks/use-resolved-theme"

export function ThemeToggle() {
	const { theme, setTheme } = useTheme()
	const resolvedTheme = useResolvedTheme()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full w-10 h-10 backdrop-blur-lg bg-background/40 border border-border/60 hover:bg-background/60 transition-all duration-200"
				>
					{resolvedTheme === "light" ? (
						<Sun className="h-[1.2rem] w-[1.2rem] text-foreground" />
					) : (
						<Moon className="h-[1.2rem] w-[1.2rem] text-foreground" />
					)}
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="backdrop-blur-lg bg-popover/80">
				<DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 cursor-pointer">
					<Sun className="h-4 w-4" />
					<span className="flex-1">亮色模式</span>
					{theme === "light" && <Check className="h-4 w-4" />}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 cursor-pointer">
					<Moon className="h-4 w-4" />
					<span className="flex-1">暗色模式</span>
					{theme === "dark" && <Check className="h-4 w-4" />}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 cursor-pointer">
					<Monitor className="h-4 w-4" />
					<span className="flex-1">跟随系统</span>
					{theme === "system" && <Check className="h-4 w-4" />}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
