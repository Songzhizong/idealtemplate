import type { ColumnDef } from "@tanstack/react-table"
import { RefreshCw, RotateCcw } from "lucide-react"
import { useMemo } from "react"
import type { FilterDefinition } from "@/components/table/v2"
import {
	DataTableFilterBar,
	DataTablePagination,
	DataTableRoot,
	DataTableSearch,
	DataTableTable,
	DataTableToolbar,
	remote,
	stateInternal,
	useDataTable,
} from "@/components/table/v2"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SortableHeader } from "../components/sortable-header"
import {
	DEMO_INVOICE_ROWS,
	type DemoInvoiceResponse,
	type DemoInvoiceRow,
	type DemoInvoiceStatus,
	delay,
	demoCurrencyFormatter,
	filterDemoInvoiceRows,
	paginateDemoRows,
	sortDemoInvoiceRows,
} from "../demo/invoice"

type Stage2Status = DemoInvoiceStatus | "empty"
type Stage2NumberRange = { min: number | undefined; max: number | undefined }
type Stage2DateRange = { from: Date | undefined; to: Date | undefined }

interface Stage2Filters {
	q: string
	status: Stage2Status | null
	amountRange: Stage2NumberRange | null
	updatedAtRange: Stage2DateRange | null
	highValue: boolean | null
}

const HIGH_VALUE_THRESHOLD = 5000

async function fetchStage2Rows(args: {
	page: number
	size: number
	sort: { field: string; order: "asc" | "desc" }[]
	filters: Stage2Filters
}): Promise<DemoInvoiceResponse> {
	await delay(400)
	const filtered = filterDemoInvoiceRows(DEMO_INVOICE_ROWS, {
		q: args.filters.q,
		status: args.filters.status,
		amountRange: args.filters.amountRange,
		updatedAtRange: args.filters.updatedAtRange,
		highValue: args.filters.highValue,
		highValueThreshold: HIGH_VALUE_THRESHOLD,
	})
	const sorted = sortDemoInvoiceRows(filtered, args.sort)
	return paginateDemoRows(sorted, args.page, args.size)
}

export function Stage2FiltersTableDemo() {
	const state = stateInternal<Stage2Filters>({
		initial: {
			page: 1,
			size: 10,
			sort: [],
			filters: {
				q: "",
				status: null,
				amountRange: null,
				updatedAtRange: null,
				highValue: null,
			},
		},
	})

	const dataSource = useMemo(() => {
		return remote<DemoInvoiceRow, Stage2Filters, DemoInvoiceResponse>({
			queryKey: ["table-v2-stage-2"],
			queryFn: fetchStage2Rows,
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

	const dt = useDataTable<DemoInvoiceRow, Stage2Filters>({
		columns,
		dataSource,
		state,
		getRowId: (row) => row.id,
	})

	const filterDefinitions = useMemo<
		Array<FilterDefinition<Stage2Filters, keyof Stage2Filters>>
	>(() => {
		return [
			{
				key: "status",
				label: "状态",
				type: "select",
				placeholder: "全部",
				options: [
					{ label: "Active", value: "active" },
					{ label: "Paused", value: "paused" },
					{ label: "Archived", value: "archived" },
					{ label: "Empty（空数据）", value: "empty" },
				],
				alwaysVisible: true,
			},
			{
				key: "amountRange",
				label: "金额区间",
				type: "number-range",
				defaultVisible: true,
			},
			{
				key: "updatedAtRange",
				label: "更新日期",
				type: "date-range",
				defaultVisible: true,
			},
			{
				key: "highValue",
				label: `高金额（>= ${HIGH_VALUE_THRESHOLD}）`,
				type: "boolean",
			},
		]
	}, [])

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>阶段 2：搜索与筛选</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="rounded-md border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
						<div>验证点：搜索 debounce、筛选更新、筛选变化自动重置 page、激活筛选标签。</div>
						<div>提示：输入后停顿 ~300ms，再观察请求/列表变化。</div>
					</div>

					<DataTableRoot
						dt={dt}
						layout={{ stickyHeader: true, stickyPagination: true }}
						className="rounded-md border border-border/50"
					>
						<DataTableToolbar
							actions={
								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="h-8 gap-2"
										onClick={() => dt.filters.reset()}
									>
										<RotateCcw className="h-4 w-4" />
										重置筛选
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
							<DataTableSearch<Stage2Filters> />
						</DataTableToolbar>

						<div className="border-b border-border/50 bg-background px-3 py-3">
							<DataTableFilterBar filters={filterDefinitions} />
						</div>

						<div className="overflow-x-auto">
							<DataTableTable<DemoInvoiceRow> />
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
