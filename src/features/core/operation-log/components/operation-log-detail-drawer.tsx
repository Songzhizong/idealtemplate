import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { useQuery } from "@tanstack/react-query"
import {
	AlertTriangle,
	CheckCircle2,
	ChevronDown,
	Clock,
	Copy,
	FileText,
	MapPin,
	Shield,
	Terminal,
	User,
	XCircle,
} from "lucide-react"
import { type ReactNode, useCallback, useMemo, useState } from "react"
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json"
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs"
import { toast } from "sonner"

import { StatusBadge } from "@/components/common/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AppSheetContent } from "@/components/ui/app-sheet"
import { Separator } from "@/components/ui/separator"
import {
	Sheet,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Api, fetchOperationLogDetail } from "@/features/core/operation-log/api/operation-log"
import { OperationLogModifiedFields } from "@/features/core/operation-log/components/operation-log-modified-fields"
import {
	getActionTypeConfig,
	getHttpMethodVariant,
} from "@/features/core/operation-log/utils/operation-log-utils"
import { formatTimestampToDateTime } from "@/lib/time-utils"
import { cn } from "@/lib/utils"

SyntaxHighlighter.registerLanguage("json", json)

interface OperationLogDetailDrawerProps {
	open: boolean
	logId: string | null
	onOpenChange: (open: boolean) => void
}

const formatJsonPayload = (input: unknown) => {
	if (input === null || input === undefined) return ""

	if (typeof input === "string") {
		if (!input.trim()) return ""
		try {
			const parsed = JSON.parse(input)
			return JSON.stringify(parsed, null, 2)
		} catch {
			return input
		}
	}

	try {
		return JSON.stringify(input, null, 2)
	} catch {
		return String(input)
	}
}

const DetailItem = ({
	label,
	children,
	className,
}: {
	label: string
	children: ReactNode
	className?: string
}) => (
	<div className={cn("space-y-1", className)}>
		<div className="text-xs text-muted-foreground">{label}</div>
		<div className="text-sm text-foreground">{children}</div>
	</div>
)

const CollapsibleCard = ({
	title,
	children,
	defaultOpen = false,
}: {
	title: string
	children: ReactNode
	defaultOpen?: boolean
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen)

	return (
		<CollapsiblePrimitive.Root
			open={isOpen}
			onOpenChange={setIsOpen}
			className="rounded-lg border border-border/60 bg-card shadow-sm"
		>
			<CollapsiblePrimitive.Trigger asChild>
				<div className="flex w-full cursor-pointer items-center justify-between px-4 py-3 hover:bg-muted/50">
					<span className="font-semibold text-sm">{title}</span>
					<ChevronDown
						className={cn("h-4 w-4 text-muted-foreground transition-transform", {
							"rotate-180": isOpen,
						})}
					/>
				</div>
			</CollapsiblePrimitive.Trigger>
			<CollapsiblePrimitive.Content className="border-t border-border/60 px-4 py-4 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
				{children}
			</CollapsiblePrimitive.Content>
		</CollapsiblePrimitive.Root>
	)
}

const CodeHighlighter = ({ code }: { code: string }) => {
	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(code)
			toast.success("已复制")
		} catch (error) {
			console.error("Copy failed", error)
			toast.error("复制失败")
		}
	}, [code])

	return (
		<div className="relative overflow-hidden rounded-md border border-border/60 bg-[#282c34]">
			<div className="absolute right-2 top-2 z-10">
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6 text-muted-foreground hover:bg-white/10 hover:text-white"
					onClick={handleCopy}
				>
					<Copy className="h-3 w-3" />
				</Button>
			</div>
			<div className="max-h-75 overflow-auto">
				<SyntaxHighlighter
					language="json"
					style={atomOneDark}
					customStyle={{
						margin: 0,
						padding: "1rem",
						fontSize: "12px",
						lineHeight: "1.5",
						backgroundColor: "transparent",
					}}
					wrapLines={true}
					wrapLongLines={true}
				>
					{code}
				</SyntaxHighlighter>
			</div>
		</div>
	)
}

export function OperationLogDetailDrawer({
	open,
	logId,
	onOpenChange,
}: OperationLogDetailDrawerProps) {
	const { data, isLoading } = useQuery({
		queryKey: ["operation-log-detail", logId],
		queryFn: () => {
			if (!logId) {
				return Promise.reject(new Error("Missing log id"))
			}
			return fetchOperationLogDetail(logId)
		},
		enabled: open && Boolean(logId),
		retry: false,
	})

	const showDiff =
		data?.actionType === Api.ActionType.UPDATE &&
		data?.resourceSnapshot !== null &&
		data?.resourceSnapshot !== undefined &&
		data?.modifiedResourceSnapshot !== null &&
		data?.modifiedResourceSnapshot !== undefined

	const formattedRequest = useMemo(() => formatJsonPayload(data?.request), [data?.request])
	const formattedResponse = useMemo(() => formatJsonPayload(data?.response), [data?.response])
	const formattedSnapshot = useMemo(
		() => formatJsonPayload(data?.resourceSnapshot),
		[data?.resourceSnapshot],
	)
	const formattedModifiedSnapshot = useMemo(
		() => formatJsonPayload(data?.modifiedResourceSnapshot),
		[data?.modifiedResourceSnapshot],
	)

	const handleCopy = useCallback(async (value: string) => {
		try {
			await navigator.clipboard.writeText(value)
			toast.success("已复制")
		} catch (error) {
			console.error("Copy failed", error)
			toast.error("复制失败")
		}
	}, [])

	const actionTypeConfig = getActionTypeConfig(data?.actionType)
	const durationWarning = (data?.duration ?? 0) > 1000

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<AppSheetContent side="right" className="w-160 max-w-[95vw] p-0 sm:max-w-200">
				<SheetHeader className="sr-only">
					<SheetTitle>操作日志详情</SheetTitle>
					<SheetDescription>查看操作日志的详细技术上下文和变更内容</SheetDescription>
				</SheetHeader>
				<div className="flex h-full flex-col">
					{/* Header Section - Simplified */}
					<div className="px-6 py-5 pb-2">
						<div className="flex flex-wrap items-center gap-3">
							{data ? (
								data.success ? (
									<CheckCircle2 className="size-6 text-success" />
								) : (
									<XCircle className="size-6 text-destructive" />
								)
							) : (
								<Clock className="size-6 text-muted-foreground" />
							)}
							<span className="text-lg font-semibold text-foreground">
								{data?.actionName || "操作详情"}
							</span>
							{data?.actionType ? (
								<Badge variant={actionTypeConfig.variant}>{actionTypeConfig.label}</Badge>
							) : null}
							{data?.sensitive ? (
								<StatusBadge tone="error" className="gap-1">
									<Shield className="size-3" />
									敏感
								</StatusBadge>
							) : null}
						</div>
						{data?.traceId ? (
							<div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
								<span className="font-mono">Trace ID: {data.traceId}</span>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7"
									onClick={() => handleCopy(data.traceId ?? "")}
								>
									<Copy className="h-3.5 w-3.5" />
								</Button>
							</div>
						) : null}
						{data ? (
							<div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
								<div
									className={cn(
										"flex items-center gap-2",
										durationWarning && "text-warning font-medium",
									)}
								>
									<Clock className="size-4" />
									<span>{data.duration}ms</span>
									{durationWarning ? <AlertTriangle className="size-4" /> : null}
								</div>
								<div className="flex items-center gap-2">
									<User className="size-4" />
									<span className="truncate">
										{data.userDisplayName || "未知用户"}
										{data.userAccount ? ` (${data.userAccount})` : ""}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<MapPin className="size-4" />
									<span>{data.clientIp || "--"}</span>
								</div>
							</div>
						) : null}
					</div>

					<Separator className="bg-border/60" />

					{/* Content Section */}
					<div className="flex-1 overflow-y-auto px-6 py-5">
						{isLoading ? (
							<div className="flex h-full items-center justify-center text-muted-foreground">
								<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
								<span className="ml-2">加载中...</span>
							</div>
						) : !data ? (
							<div className="flex h-full items-center justify-center text-muted-foreground">
								暂无操作日志详情
							</div>
						) : (
							<div className="space-y-6">
								{/* Basic Info - Removed Card */}
								<div className="space-y-4">
									<div className="flex items-center gap-2 text-sm font-semibold">
										<FileText className="size-4 text-muted-foreground" />
										<span>基本信息</span>
									</div>
									<div className="grid gap-4 sm:grid-cols-2">
										<DetailItem label="模块">
											<Badge variant="secondary">{data.moduleName || "未知模块"}</Badge>
										</DetailItem>
										<DetailItem label="资源类型">
											<Badge variant="secondary">{data.resourceType || "--"}</Badge>
										</DetailItem>
										<DetailItem label="资源ID">
											<div className="flex items-center gap-2">
												<span className="font-mono text-xs text-muted-foreground">
													{data.resourceId || "--"}
												</span>
												{data.resourceId ? (
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() => handleCopy(data.resourceId || "")}
													>
														<Copy className="h-3.5 w-3.5" />
													</Button>
												) : null}
											</div>
										</DetailItem>
										<DetailItem label="资源名称">
											<span className="font-medium">{data.resourceName || "--"}</span>
										</DetailItem>
										<DetailItem label="操作时间">
											<div className="space-y-1">
												<span className="text-sm text-muted-foreground">
													{formatTimestampToDateTime(data.operationTime)}
												</span>
											</div>
										</DetailItem>
										<DetailItem label="平台">
											<StatusBadge tone="info">Web</StatusBadge>
										</DetailItem>
									</div>
								</div>

								{/* Modified Fields */}
								{data.schema === "audit.modified_fields" && (
									<OperationLogModifiedFields modification={data.modification} />
								)}

								<Separator />

								<div className="space-y-4">
									<div className="flex items-center gap-2 text-sm font-semibold">
										<Terminal className="size-4 text-muted-foreground" />
										<span>技术上下文</span>
									</div>

									{/* Request Info Card */}
									<CollapsibleCard title="请求信息">
										<div className="space-y-4">
											<DetailItem label="请求方法">
												{data.httpMethod ? (
													<Badge variant={getHttpMethodVariant(data.httpMethod)}>
														{data.httpMethod}
													</Badge>
												) : (
													"--"
												)}
											</DetailItem>
											<DetailItem label="请求路径">
												<div className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-foreground">
													{data.path || "--"}
												</div>
											</DetailItem>
											{formattedRequest && (
												<DetailItem label="请求参数">
													<CodeHighlighter code={formattedRequest} />
												</DetailItem>
											)}
											{formattedResponse && (
												<DetailItem label="响应结果">
													<CodeHighlighter code={formattedResponse} />
												</DetailItem>
											)}
										</div>
									</CollapsibleCard>

									{/* Client Environment Card */}
									<CollapsibleCard title="客户端环境">
										<div className="grid gap-4 sm:grid-cols-2">
											<DetailItem label="客户端 IP">
												<span className="font-mono">{data.clientIp || "--"}</span>
											</DetailItem>
											<DetailItem label="所在位置">
												<span>{data.clientLocation || "--"}</span>
											</DetailItem>
											<DetailItem label="浏览器 UA" className="sm:col-span-2">
												<span className="break-all font-mono text-xs text-muted-foreground">
													{data.userAgent || "--"}
												</span>
											</DetailItem>
										</div>
									</CollapsibleCard>

									{/* Resource Snapshot Card */}
									{(formattedSnapshot || formattedModifiedSnapshot) && (
										<CollapsibleCard title="资源快照对比">
											<Tabs
												defaultValue={showDiff ? "diff" : formattedSnapshot ? "before" : "after"}
												className="w-full"
											>
												<TabsList className="mb-4">
													{showDiff && <TabsTrigger value="diff">变更对比</TabsTrigger>}
													{formattedSnapshot && <TabsTrigger value="before">修改前</TabsTrigger>}
													{formattedModifiedSnapshot && (
														<TabsTrigger value="after">修改后</TabsTrigger>
													)}
												</TabsList>
												{showDiff && (
													<TabsContent value="diff">
														<div className="overflow-hidden rounded-md border border-border/60">
															<ReactDiffViewer
																oldValue={formattedSnapshot}
																newValue={formattedModifiedSnapshot}
																splitView={false}
																compareMethod={DiffMethod.WORDS}
																styles={{
																	variables: {
																		dark: {
																			diffViewerBackground: "#282c34",
																			diffViewerColor: "#FFF",
																			addedBackground: "#044B53",
																			addedColor: "white",
																			removedBackground: "#632F34",
																			removedColor: "white",
																			wordAddedBackground: "#055d67",
																			wordRemovedBackground: "#7d383f",
																			addedGutterBackground: "#034148",
																			removedGutterBackground: "#632b30",
																			gutterBackground: "#2f333d",
																			gutterColor: "#677182",
																			...{
																				// Optional override for light theme if detected,
																				// but keeping it simple for now as we don't know the exact theme state easily without context
																			},
																		},
																	},
																	contentText: {
																		fontSize: "12px",
																		lineHeight: "1.5",
																	},
																	lineNumber: {
																		fontSize: "12px",
																		lineHeight: "1.5",
																	},
																}}
																// Force dark theme variables usage if in dark mode, or use light.
																// For now, simpler to use "light" or "dark" based on system pref?
																// Assuming "useTheme" hook might be available, otherwise defaulting to a neutral look or dark mode as requested by "dark background" in screenshot.
																useDarkTheme={true}
															/>
														</div>
													</TabsContent>
												)}
												{formattedSnapshot && (
													<TabsContent value="before">
														<CodeHighlighter code={formattedSnapshot} />
													</TabsContent>
												)}
												{formattedModifiedSnapshot && (
													<TabsContent value="after">
														<CodeHighlighter code={formattedModifiedSnapshot} />
													</TabsContent>
												)}
											</Tabs>
										</CollapsibleCard>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</AppSheetContent>
		</Sheet>
	)
}
