import { Columns2, Copy, Layout, Palette, RotateCcw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import darkThemeImg from "@/assets/images/theme_styles/dark.png"
import lightThemeImg from "@/assets/images/theme_styles/light.png"
import systemThemeImg from "@/assets/images/theme_styles/system.png"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Label } from "@/components/ui/label.tsx"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select.tsx"
import { AppSheetContent } from "@/components/ui/app-sheet"
import { Sheet, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet.tsx"
import { themePresets } from "@/config/theme-presets"
import { useThemeStore } from "@/hooks/use-theme-store"
import { cn } from "@/lib/utils.ts"

export function ThemeSettingsDrawer() {
	const store = useThemeStore()
	const [showResetDialog, setShowResetDialog] = useState(false)

	const handleCopyConfig = () => {
		const config = {
			mode: store.mode,
			activePreset: store.activePreset,
			fontFamily: store.fontFamily,
			layout: store.layout,
			ui: store.ui,
		}
		const configStr = JSON.stringify(config, null, 2)
		navigator.clipboard.writeText(configStr).then(() => {
			toast.success("配置已复制到剪贴板", {
				description:
					"请将其粘贴到 src/config/theme-presets.ts 文件中的 defaultThemeSettings 常量中。",
			})
		})
	}

	const handleResetConfig = () => {
		store.reset()
		setShowResetDialog(false)
		toast.success("主题配置已重置")
	}

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-10 w-10 rounded-full p-0"
					aria-label="Open theme settings"
				>
					<Palette className="size-4" />
				</Button>
			</SheetTrigger>
			<AppSheetContent side="right" className="w-87.5 p-0 sm:w-100">
				<div className="flex h-full flex-col">
					<div className="flex items-center justify-between border-b border-border px-6 py-4">
						<SheetTitle className="text-lg font-semibold">主题配置</SheetTitle>
						<SheetDescription className="sr-only">
							调整系统的主题、颜色、布局等设置。
						</SheetDescription>
					</div>

					<div className="flex-1 overflow-y-auto p-6 space-y-8">
						{/* 主题风格 */}
						<section className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-px flex-1 bg-border" />
								<h3 className="text-sm font-medium text-foreground">主题风格</h3>
								<div className="h-px flex-1 bg-border" />
							</div>
							<div className="grid grid-cols-3 gap-4">
								{[
									{ id: "light", label: "浅色", image: lightThemeImg },
									{ id: "dark", label: "深色", image: darkThemeImg },
									{ id: "system", label: "系统", image: systemThemeImg },
								].map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => store.setMode(item.id as "light" | "dark" | "system")}
										className="group flex flex-col items-center gap-2 focus:outline-none focus-visible:outline-none"
									>
										<div
											className={cn(
												"relative flex aspect-4/3 w-full items-center justify-center overflow-hidden rounded-xl border-2 transition-all",
												store.mode === item.id
													? "border-primary bg-primary/5"
													: "border-transparent bg-muted hover:bg-muted/80",
											)}
										>
											<img
												src={item.image}
												alt={item.label}
												className="h-full w-full object-cover"
											/>
										</div>
										<span
											className={cn(
												"text-sm font-medium transition-colors",
												store.mode === item.id
													? "text-primary"
													: "text-muted-foreground group-hover:text-foreground",
											)}
										>
											{item.label}
										</span>
									</button>
								))}
							</div>
						</section>

						{/* 菜单布局 */}
						<section className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-px flex-1 bg-border" />
								<h3 className="text-sm font-medium text-foreground">菜单布局</h3>
								<div className="h-px flex-1 bg-border" />
							</div>
							<div className="grid grid-cols-2 gap-4">
								{[
									{ id: "single", label: "垂直单列", icon: Layout },
									{ id: "dual", label: "垂直双列", icon: Columns2 },
								].map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => store.setMenuLayout(item.id as "single" | "dual")}
										className={cn(
											"flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all",
											store.layout.menuLayout === item.id
												? "border-primary bg-primary/5 text-primary"
												: "border-transparent bg-muted hover:bg-muted/80",
										)}
									>
										<item.icon className="h-6 w-6" />
										<span className="text-xs font-medium">{item.label}</span>
									</button>
								))}
							</div>
						</section>

						{/* 系统主题色 */}
						<section className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-px flex-1 bg-border" />
								<h3 className="text-sm font-medium text-foreground">系统主题色</h3>
								<div className="h-px flex-1 bg-border" />
							</div>

							<div className="flex flex-wrap gap-3 justify-center">
								{themePresets.map((preset) => {
									const primaryColor = preset.schemes.light.brand.primary.default

									return (
										<button
											key={preset.key}
											type="button"
											onClick={() => store.setPreset(preset.key)}
											className={cn(
												"group relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all hover:scale-110",
												store.activePreset === preset.key
													? "border-border ring-2 ring-primary ring-offset-2 ring-offset-background"
													: "border-transparent",
											)}
											title={preset.name}
										>
											<div
												className="h-full w-full rounded-full"
												style={{ backgroundColor: primaryColor }}
											/>
										</button>
									)
								})}
							</div>
						</section>

						{/* 界面展示 */}
						<section className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-px flex-1 bg-border" />
								<h3 className="text-sm font-medium text-foreground">界面展示</h3>
								<div className="h-px flex-1 bg-border" />
							</div>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label className="text-sm font-normal text-muted-foreground">容器宽度</Label>
									<div className="flex rounded-lg bg-muted p-1">
										<button
											type="button"
											onClick={() => store.setContainerWidth("full")}
											className={cn(
												"rounded-md px-3 py-1 text-xs transition-all",
												store.layout.containerWidth === "full"
													? "bg-background font-medium shadow-sm text-foreground"
													: "text-muted-foreground",
											)}
										>
											铺满
										</button>
										<button
											type="button"
											onClick={() => store.setContainerWidth("fixed")}
											className={cn(
												"rounded-md px-3 py-1 text-xs transition-all",
												store.layout.containerWidth === "fixed"
													? "bg-background font-medium shadow-sm text-foreground"
													: "text-muted-foreground",
											)}
										>
											固定
										</button>
									</div>
								</div>
							</div>
						</section>

						{/* 侧边栏设置 */}
						<section className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-px flex-1 bg-border" />
								<h3 className="text-sm font-medium text-foreground">侧边栏设置</h3>
								<div className="h-px flex-1 bg-border" />
							</div>
							<div className="space-y-4">
								<div className="space-y-3">
									<div className="flex justify-between">
										<Label className="text-sm font-normal text-muted-foreground">侧边栏宽度</Label>
										<span className="text-xs text-muted-foreground">
											{store.layout.sidebarWidth}px
										</span>
									</div>
									<input
										type="range"
										min="160"
										max="320"
										value={store.layout.sidebarWidth}
										onChange={(e) => store.setSidebarWidth(Number(e.target.value))}
										className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
									/>
								</div>
								<div className="space-y-3">
									<div className="flex justify-between">
										<Label className="text-sm font-normal text-muted-foreground">折叠宽度</Label>
										<span className="text-xs text-muted-foreground">
											{store.layout.sidebarCollapsedWidth}px
										</span>
									</div>
									<input
										type="range"
										min="48"
										max="96"
										value={store.layout.sidebarCollapsedWidth}
										onChange={(e) => store.setSidebarCollapsedWidth(Number(e.target.value))}
										className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
									/>
								</div>
							</div>
						</section>

						{/* 头部设置 */}
						<section className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-px flex-1 bg-border" />
								<h3 className="text-sm font-medium text-foreground">头部设置</h3>
								<div className="h-px flex-1 bg-border" />
							</div>
							<div className="space-y-5">
								<div className="space-y-3">
									<div className="flex justify-between">
										<Label className="text-sm font-normal text-muted-foreground">头部高度</Label>
										<span className="text-xs text-muted-foreground">
											{store.layout.headerHeight}px
										</span>
									</div>
									<input
										type="range"
										min="48"
										max="80"
										value={store.layout.headerHeight}
										onChange={(e) => store.setHeaderHeight(Number(e.target.value))}
										className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
									/>
								</div>
								<div className="flex items-center justify-between">
									<Label className="text-sm font-normal text-muted-foreground">显示面包屑</Label>
									<label className="relative inline-flex cursor-pointer items-center">
										<input
											type="checkbox"
											checked={store.ui.showBreadcrumb}
											onChange={(e) => store.setShowBreadcrumb(e.target.checked)}
											className="peer sr-only"
										/>
										<div className="peer h-5 w-9 rounded-full bg-muted after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary peer-focus:outline-none"></div>
									</label>
								</div>
								<div className="flex items-center justify-between">
									<Label className="text-sm font-normal text-muted-foreground">
										显示面包屑图标
									</Label>
									<label className="relative inline-flex cursor-pointer items-center">
										<input
											type="checkbox"
											checked={store.ui.showBreadcrumbIcon}
											onChange={(e) => store.setShowBreadcrumbIcon(e.target.checked)}
											className="peer sr-only"
										/>
										<div className="peer h-5 w-9 rounded-full bg-muted after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:border after:border-border after:bg-background after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-primary peer-focus:outline-none"></div>
									</label>
								</div>
							</div>
						</section>

						{/* 基础配置 */}
						<section className="space-y-4">
							<div className="flex items-center gap-4">
								<div className="h-px flex-1 bg-border" />
								<h3 className="text-sm font-medium text-foreground">基础配置</h3>
								<div className="h-px flex-1 bg-border" />
							</div>
							<div className="space-y-5">
								<div className="space-y-2">
									<Label className="text-sm font-normal text-muted-foreground">页面切换动画</Label>
									<Select
										value={store.ui.pageAnimation}
										onValueChange={(value) =>
											store.setPageAnimation(
												value as "none" | "fade" | "slide-left" | "slide-bottom" | "slide-top",
											)
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="选择动画" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">无动画</SelectItem>
											<SelectItem value="fade">淡入淡出</SelectItem>
											<SelectItem value="slide-left">左侧划入</SelectItem>
											<SelectItem value="slide-bottom">下方划入</SelectItem>
											<SelectItem value="slide-top">上方划入</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-3">
									<div className="flex justify-between">
										<Label className="text-sm font-normal text-muted-foreground">自定义圆角</Label>
										<span className="text-xs text-muted-foreground">{store.ui.borderRadius}px</span>
									</div>
									<input
										type="range"
										min="0"
										max="32"
										value={store.ui.borderRadius}
										onChange={(e) => store.setBorderRadius(Number(e.target.value))}
										className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
									/>
								</div>
							</div>
						</section>
					</div>

					<div className="flex gap-3 border-t border-border p-6">
						<Button className="flex-1 gap-2" onClick={handleCopyConfig}>
							<Copy className="h-4 w-4" />
							复制配置
						</Button>
						<Button
							variant="outline"
							className="flex-1 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={() => setShowResetDialog(true)}
						>
							<RotateCcw className="h-4 w-4" />
							重置配置
						</Button>
					</div>
				</div>
			</SheetContent>

			<AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确定要重置所有设置吗？</AlertDialogTitle>
						<AlertDialogDescription>
							此操作将恢复所有主题设置到默认值，包括主题风格、颜色、布局等配置。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>取消</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleResetConfig}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							确定重置
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Sheet>
	)
}
