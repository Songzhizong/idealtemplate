import { RefreshCw, RotateCcw } from "lucide-react"
import { parseAsString } from "nuqs"
import { useMemo, useState } from "react"
import type { DataTableI18nOverrides } from "@/components/table/v2"
import {
	createColumnHelper,
	DataTableColumnToggle,
	DataTableConfigProvider,
	DataTableDensityToggle,
	DataTablePreset,
	remote,
	stateUrl,
	useDataTable,
} from "@/components/table/v2"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SortableHeader } from "../components/sortable-header"
import {
	DEMO_INVOICE_ROWS,
	type DemoInvoiceResponse,
	type DemoInvoiceRow,
	delay,
	demoCurrencyFormatter,
	filterDemoInvoiceRows,
	paginateDemoRows,
	sortDemoInvoiceRows,
} from "../demo/invoice"

interface Stage5Filters {
	q: string
	status: string
}

async function fetchStage5Rows(args: {
	page: number
	size: number
	sort: { field: string; order: "asc" | "desc" }[]
	filters: Stage5Filters
}): Promise<DemoInvoiceResponse> {
	await delay(450)
	const filtered = filterDemoInvoiceRows(DEMO_INVOICE_ROWS, {
		q: args.filters.q,
		status: args.filters.status,
	})
	const sorted = sortDemoInvoiceRows(filtered, args.sort)
	return paginateDemoRows(sorted, args.page, args.size)
}

const EN_I18N: DataTableI18nOverrides = {
	emptyText: "No data",
	loadingText: "Loading...",
	refreshingText: "Refreshing...",
	errorText: "Failed to load",
	retryText: "Retry",
	searchPlaceholder: "Search...",
	columnToggleLabel: "Columns",
	density: {
		compactText: "Compact",
		comfortableText: "Comfortable",
	},
	selectionBar: {
		selected: (count) => (count === "all" ? "Selected: all" : `Selected: ${count}`),
		clear: "Clear",
		selectAllMatching: (total) =>
			typeof total === "number" ? `Select all ${total}` : "Select all",
		backToPage: "Only this page",
	},
	pagination: {
		total: (count) => `${count} total`,
		perPage: "/ page",
		previous: "Prev",
		next: "Next",
	},
}

export function Stage5PresetTableDemo() {
	const [lang, setLang] = useState<"zh" | "en">("zh")

	const i18nOverrides = useMemo(() => {
		return lang === "en" ? EN_I18N : undefined
	}, [lang])

	const state = stateUrl({
		key: "table_v2_stage_5",
		parsers: {
			q: parseAsString.withDefault(""),
			status: parseAsString.withDefault("all"),
		},
	})

	const dataSource = useMemo(() => {
		return remote<DemoInvoiceRow, Stage5Filters, DemoInvoiceResponse>({
			queryKey: ["table-v2-stage-5"],
			queryFn: fetchStage5Rows,
			map: (response) => ({
				rows: response.rows,
				pageCount: response.pageCount,
				total: response.total,
			}),
		})
	}, [])

	const columns = useMemo(() => {
		const helper = createColumnHelper<DemoInvoiceRow>()
		return [
			helper.select(),
			helper.accessor("id", {
				header: ({ column }) => <SortableHeader column={column} label="ID" />,
				cell: (ctx) => ctx.row.original.id,
				enableSorting: true,
				meta: { headerLabel: "ID" },
			}),
			helper.accessor("name", {
				header: ({ column }) => <SortableHeader column={column} label="名称" />,
				cell: (ctx) => ctx.row.original.name,
				enableSorting: true,
				meta: { headerLabel: "名称" },
			}),
			helper.accessor("status", {
				header: ({ column }) => <SortableHeader column={column} label="状态" />,
				cell: (ctx) => (
					<Badge variant="secondary" className="capitalize">
						{ctx.row.original.status}
					</Badge>
				),
				enableSorting: true,
				meta: { headerLabel: "状态" },
			}),
			helper.accessor("amount", {
				header: ({ column }) => <SortableHeader column={column} label="金额" />,
				cell: (ctx) => demoCurrencyFormatter.format(ctx.row.original.amount),
				enableSorting: true,
				meta: { headerLabel: "金额" },
			}),
			helper.accessor("updatedAt", {
				header: ({ column }) => <SortableHeader column={column} label="更新日期" />,
				cell: (ctx) => ctx.row.original.updatedAt.slice(0, 10),
				enableSorting: true,
				meta: { headerLabel: "更新日期" },
			}),
		]
	}, [])

	const dt = useDataTable<DemoInvoiceRow, Stage5Filters>({
		columns,
		dataSource,
		state,
		getRowId: (row) => row.id,
		features: {
			selection: {
				enabled: true,
				mode: "page",
			},
			columnVisibility: {
				storageKey: "table_v2_stage_5_column_visibility",
			},
			columnSizing: {
				storageKey: "table_v2_stage_5_column_sizing",
			},
			density: {
				storageKey: "table_v2_stage_5_density",
				default: "compact",
			},
			pinning: {
				left: ["__select__", "id"],
			},
		},
	})

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>阶段 5：Preset / 列工具 / 偏好持久化 / i18n</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="rounded-md border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
						<div>验证点：DataTablePreset 用法、createColumnHelper、偏好持久化、i18n 覆盖。</div>
						<div>提示：改列显示/列宽/密度后刷新页面，偏好应保留；可切换语言验证 i18n。</div>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-3">
						<Tabs value={lang} onValueChange={(value) => setLang(value as typeof lang)}>
							<TabsList variant="line" className="h-9">
								<TabsTrigger value="zh">中文</TabsTrigger>
								<TabsTrigger value="en">English</TabsTrigger>
							</TabsList>
						</Tabs>

						<div className="flex flex-wrap items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-8 gap-2"
								onClick={() => {
									dt.actions.resetColumnVisibility()
									dt.actions.resetColumnSizing()
									dt.actions.resetDensity()
								}}
							>
								<RotateCcw className="h-4 w-4" />
								重置偏好
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-8 gap-2"
								onClick={() => dt.actions.resetAll()}
							>
								<RotateCcw className="h-4 w-4" />
								重置全部
							</Button>
							<Button
								type="button"
								size="sm"
								className="h-8 gap-2"
								onClick={() => dt.actions.refetch()}
							>
								<RefreshCw className="h-4 w-4" />
								刷新
							</Button>
						</div>
					</div>

					<DataTableConfigProvider {...(i18nOverrides ? { i18n: i18nOverrides } : {})}>
						<DataTablePreset<DemoInvoiceRow, Stage5Filters>
							dt={dt}
							layout={{ stickyHeader: true, stickyPagination: true }}
							className="rounded-md border border-border/50"
							toolbarActions={
								<div className="flex flex-wrap items-center gap-2">
									<DataTableDensityToggle />
									<DataTableColumnToggle />
								</div>
							}
						/>
					</DataTableConfigProvider>
				</CardContent>
			</Card>
		</div>
	)
}
