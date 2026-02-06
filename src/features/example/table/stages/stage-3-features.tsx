import type { ColumnDef, Row } from "@tanstack/react-table"
import { RefreshCw, RotateCcw } from "lucide-react"
import { parseAsString } from "nuqs"
import { useMemo, useState } from "react"
import {
	actions,
	DataTableColumnToggle,
	DataTableDensityToggle,
	DataTablePagination,
	DataTableRoot,
	DataTableSelectionBar,
	DataTableTable,
	DataTableToolbar,
	expand,
	remote,
	select,
	stateUrl,
	useDataTable,
} from "@/components/table/v2"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
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

const STATUS_OPTIONS = [
	{ value: "all", label: "全部状态" },
	{ value: "active", label: "Active" },
	{ value: "paused", label: "Paused" },
	{ value: "archived", label: "Archived" },
] as const

interface Stage3Filters {
	q: string
	status: string
}

async function fetchStage3Rows(args: {
	page: number
	size: number
	sort: { field: string; order: "asc" | "desc" }[]
	filters: Stage3Filters
}): Promise<DemoInvoiceResponse> {
	await delay(500)
	const filtered = filterDemoInvoiceRows(DEMO_INVOICE_ROWS, {
		q: args.filters.q,
		status: args.filters.status,
	})
	const sorted = sortDemoInvoiceRows(filtered, args.sort)
	return paginateDemoRows(sorted, args.page, args.size)
}

async function fetchAllMatchingIds(filters: Stage3Filters): Promise<string[]> {
	await delay(250)
	return filterDemoInvoiceRows(DEMO_INVOICE_ROWS, {
		q: filters.q,
		status: filters.status,
	}).map((row) => row.id)
}

function renderExpandedRow(row: Row<DemoInvoiceRow>) {
	return (
		<div className="grid gap-3 p-3 text-sm">
			<div className="grid gap-1">
				<div className="text-xs text-muted-foreground">示例详情面板</div>
				<div className="font-medium">{row.original.name}</div>
			</div>
			<div className="grid gap-1 text-muted-foreground">
				<div>ID：{row.original.id}</div>
				<div>Owner：{row.original.owner}</div>
				<div>金额：{demoCurrencyFormatter.format(row.original.amount)}</div>
			</div>
		</div>
	)
}

export function Stage3FeaturesTableDemo() {
	const [selectionMode, setSelectionMode] = useState<"page" | "cross-page">("page")

	const state = stateUrl({
		key: "table_v2_stage_3",
		parsers: {
			q: parseAsString.withDefault(""),
			status: parseAsString.withDefault("all"),
		},
	})

	const dataSource = useMemo(() => {
		return remote<DemoInvoiceRow, Stage3Filters, DemoInvoiceResponse>({
			queryKey: ["table-v2-stage-3"],
			queryFn: fetchStage3Rows,
			map: (response) => ({
				rows: response.rows,
				pageCount: response.pageCount,
				total: response.total,
			}),
		})
	}, [])

	const columns = useMemo<ColumnDef<DemoInvoiceRow>[]>(
		() => [
			select<DemoInvoiceRow>(),
			expand<DemoInvoiceRow>(),
			{
				accessorKey: "id",
				header: ({ column }) => <SortableHeader column={column} label="ID" />,
				cell: ({ row }) => row.original.id,
				enableSorting: true,
			},
			{
				accessorKey: "name",
				header: ({ column }) => <SortableHeader column={column} label="名称" />,
				cell: ({ row }) => row.original.name,
				enableSorting: true,
			},
			{
				accessorKey: "owner",
				header: "Owner",
				cell: ({ row }) => row.original.owner,
			},
			{
				accessorKey: "status",
				header: ({ column }) => <SortableHeader column={column} label="状态" />,
				cell: ({ row }) => (
					<Badge variant="secondary" className="capitalize">
						{row.original.status}
					</Badge>
				),
				enableSorting: true,
			},
			{
				accessorKey: "amount",
				header: ({ column }) => <SortableHeader column={column} label="金额" />,
				cell: ({ row }) => demoCurrencyFormatter.format(row.original.amount),
				enableSorting: true,
			},
			{
				accessorKey: "updatedAt",
				header: ({ column }) => <SortableHeader column={column} label="更新日期" />,
				cell: ({ row }) => row.original.updatedAt.slice(0, 10),
				enableSorting: true,
			},
			actions<DemoInvoiceRow>((row) => {
				return (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="h-7"
						onClick={() => {
							row.toggleExpanded()
						}}
					>
						详情
					</Button>
				)
			}),
		],
		[],
	)

	const dt = useDataTable<DemoInvoiceRow, Stage3Filters>({
		columns,
		dataSource,
		state,
		getRowId: (row) => row.id,
		features: {
			selection: {
				enabled: true,
				mode: selectionMode,
				crossPage: {
					selectAllStrategy: "server",
					fetchAllIds: fetchAllMatchingIds,
					maxSelection: 500,
				},
			},
			columnVisibility: {
				storageKey: "table_v2_stage_3_column_visibility",
			},
			columnSizing: {
				storageKey: "table_v2_stage_3_column_sizing",
			},
			pinning: {
				left: ["__select__", "__expand__", "id"],
				right: ["__actions__"],
			},
			expansion: {
				enabled: true,
				getRowCanExpand: (row) => row.original.amount >= 7000,
			},
			density: {
				storageKey: "table_v2_stage_3_density",
				default: "compact",
			},
		},
	})

	const filters = dt.filters.state

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>阶段 3：基础 Feature（选择 / 列设置 / 固定列 / 展开 / 密度）</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="rounded-md border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
						<div>验证点：本页选择、跨页选择、列显示/列宽、固定列、行展开、密度切换。</div>
						<div>提示：跨页选择下先选中几条，再点“选择全部 N 条”。</div>
					</div>

					<DataTableRoot
						dt={dt}
						layout={{ stickyHeader: true, stickyPagination: true }}
						className="rounded-md border border-border/50"
					>
						<DataTableToolbar
							actions={
								<div className="flex flex-wrap items-center gap-2">
									<DataTableDensityToggle />
									<DataTableColumnToggle />
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
							}
						>
							<Tabs
								value={selectionMode}
								onValueChange={(value) => setSelectionMode(value as typeof selectionMode)}
							>
								<TabsList variant="line" className="h-9">
									<TabsTrigger value="page">本页选择</TabsTrigger>
									<TabsTrigger value="cross-page">跨页选择</TabsTrigger>
								</TabsList>
							</Tabs>

							<div className="flex items-center gap-2">
								<Label className="text-xs text-muted-foreground">状态</Label>
								<Select
									value={filters.status}
									onValueChange={(value) => dt.filters.set("status", value)}
								>
									<SelectTrigger className="h-9 w-[160px]">
										<SelectValue placeholder="全部" />
									</SelectTrigger>
									<SelectContent>
										{STATUS_OPTIONS.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</DataTableToolbar>

						<div className="overflow-x-auto">
							<DataTableTable<DemoInvoiceRow> renderSubComponent={renderExpandedRow} />
						</div>

						<DataTableSelectionBar<DemoInvoiceRow> />

						<DataTablePagination />
					</DataTableRoot>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>State Snapshot</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="overflow-x-auto rounded-md border border-border/50 bg-muted/30 p-3 text-xs">
						{JSON.stringify(
							{
								status: dt.status,
								activity: dt.activity,
								pagination: dt.pagination,
								sort: dt.table.getState().sorting,
								filters: dt.filters.state,
								selection: dt.selection,
								pinning: dt.table.getState().columnPinning,
							},
							null,
							2,
						)}
					</pre>
				</CardContent>
			</Card>
		</div>
	)
}
