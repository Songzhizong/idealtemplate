import type { ColumnDef } from "@tanstack/react-table"
import { RefreshCw, RotateCcw } from "lucide-react"
import { parseAsString } from "nuqs"
import { useMemo } from "react"
import {
	DataTablePagination,
	DataTableRoot,
	DataTableTable,
	remote,
	stateUrl,
	useDataTable,
} from "@/components/table/v2"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
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
	{ value: "empty", label: "Empty（空数据）" },
] as const

interface Stage1Filters {
	q: string
	status: string
}

async function fetchStage1Rows(args: {
	page: number
	size: number
	sort: { field: string; order: "asc" | "desc" }[]
	filters: Stage1Filters
}): Promise<DemoInvoiceResponse> {
	await delay(650)
	const filtered = filterDemoInvoiceRows(DEMO_INVOICE_ROWS, {
		q: args.filters.q,
		status: args.filters.status,
	})
	const sorted = sortDemoInvoiceRows(filtered, args.sort)
	return paginateDemoRows(sorted, args.page, args.size)
}

export function Stage1BasicTableDemo() {
	const state = stateUrl({
		key: "table_v2_stage_1",
		parsers: {
			q: parseAsString.withDefault(""),
			status: parseAsString.withDefault("all"),
		},
	})

	const dataSource = useMemo(() => {
		return remote<DemoInvoiceRow, Stage1Filters, DemoInvoiceResponse>({
			queryKey: ["table-v2-stage-1"],
			queryFn: fetchStage1Rows,
			map: (response) => ({
				rows: response.rows,
				pageCount: response.pageCount,
				total: response.total,
			}),
		})
	}, [])

	const columns = useMemo<ColumnDef<DemoInvoiceRow>[]>(
		() => [
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
		],
		[],
	)

	const dt = useDataTable<DemoInvoiceRow, Stage1Filters>({
		columns,
		dataSource,
		state,
		getRowId: (row) => row.id,
	})

	const filters = dt.filters.state

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>阶段 1：基础能力（URL 状态）</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_auto] lg:items-end">
						<div className="grid gap-2">
							<Label htmlFor="dt-stage-1-search">搜索</Label>
							<Input
								id="dt-stage-1-search"
								placeholder="按 ID / 名称 / Owner 搜索"
								value={filters.q}
								onChange={(event) => dt.filters.set("q", event.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="dt-stage-1-status">状态</Label>
							<Select
								value={filters.status}
								onValueChange={(value) => dt.filters.set("status", value)}
							>
								<SelectTrigger id="dt-stage-1-status">
									<SelectValue />
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
						<div className="flex flex-wrap gap-2">
							<Button variant="outline" className="gap-2" onClick={() => dt.filters.reset()}>
								<RotateCcw className="h-4 w-4" />
								重置筛选
							</Button>
							<Button variant="outline" className="gap-2" onClick={() => dt.actions.resetAll()}>
								<RotateCcw className="h-4 w-4" />
								重置状态
							</Button>
							<Button className="gap-2" onClick={() => dt.actions.refetch()}>
								<RefreshCw className="h-4 w-4" />
								重新请求
							</Button>
						</div>
					</div>
					<div className="rounded-md border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
						<div>验证点：加载/空态/分页/排序/URL 同步/刷新保留。</div>
						<div>快捷触发：状态选择 “Empty（空数据）” 或搜索 “no-match”。</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>结果</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					<DataTableRoot dt={dt} layout={{ stickyHeader: true, stickyPagination: true }}>
						<div className="overflow-x-auto">
							<DataTableTable />
						</div>
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
