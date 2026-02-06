import { useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { RefreshCw, RotateCcw } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import {
	DataTablePagination,
	DataTableRoot,
	DataTableTable,
	DataTableToolbar,
	dragHandle,
	remote,
	stateInternal,
	useDataTable,
} from "@/components/table/v2"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	DEMO_INVOICE_ROWS,
	type DemoInvoiceResponse,
	type DemoInvoiceRow,
	delay,
	demoCurrencyFormatter,
	paginateDemoRows,
} from "../demo/invoice"

type Stage4RemoteFilters = Record<string, never>

const BASE_QUERY_KEY = ["table-v2-stage-4-remote-drag"] as const

function buildRemoteResponse(
	rows: DemoInvoiceRow[],
	page: number,
	size: number,
): DemoInvoiceResponse {
	return paginateDemoRows(rows, page, size)
}

export function Stage4RemoteDragDemo() {
	const queryClient = useQueryClient()
	const initialRows = useMemo(() => DEMO_INVOICE_ROWS.slice(0, 20), [])
	const serverRowsRef = useRef<DemoInvoiceRow[]>(initialRows)
	const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced">("idle")

	const state = stateInternal<Stage4RemoteFilters>({
		initial: {
			page: 1,
			size: 50,
			sort: [],
			filters: {},
		},
	})

	const dataSource = useMemo(() => {
		return remote<DemoInvoiceRow, Stage4RemoteFilters, DemoInvoiceResponse>({
			queryKey: [...BASE_QUERY_KEY],
			queryFn: async (args) => {
				await delay(650)
				return buildRemoteResponse(serverRowsRef.current, args.page, args.size)
			},
			map: (response) => response,
		})
	}, [])

	const columns = useMemo<ColumnDef<DemoInvoiceRow>[]>(
		() => [
			dragHandle<DemoInvoiceRow>(),
			{
				accessorKey: "id",
				header: "ID",
				cell: ({ row }) => row.original.id,
				enableSorting: false,
			},
			{
				accessorKey: "name",
				header: "名称",
				cell: ({ row }) => row.original.name,
				enableSorting: false,
			},
			{
				accessorKey: "owner",
				header: "Owner",
				cell: ({ row }) => row.original.owner,
				enableSorting: false,
			},
			{
				accessorKey: "status",
				header: "状态",
				cell: ({ row }) => (
					<Badge variant="secondary" className="capitalize">
						{row.original.status}
					</Badge>
				),
				enableSorting: false,
			},
			{
				accessorKey: "amount",
				header: "金额",
				cell: ({ row }) => demoCurrencyFormatter.format(row.original.amount),
				enableSorting: false,
			},
		],
		[],
	)

	const dt = useDataTable<DemoInvoiceRow, Stage4RemoteFilters>({
		columns,
		dataSource,
		state,
		getRowId: (row) => row.id,
		features: {
			dragSort: {
				enabled: true,
				handle: true,
				dragOverlay: "ghost",
				onReorder: async (args) => {
					if (!args.reorderedRows) return

					serverRowsRef.current = args.reorderedRows

					queryClient.setQueriesData<DemoInvoiceResponse>(
						{ queryKey: [...BASE_QUERY_KEY] },
						(prev) => {
							if (!prev) return prev
							return buildRemoteResponse(serverRowsRef.current, 1, 50)
						},
					)

					setSyncStatus("syncing")
					await delay(700)
					await queryClient.invalidateQueries({ queryKey: [...BASE_QUERY_KEY] })
					setSyncStatus("synced")
				},
			},
			pinning: {
				left: ["__drag_handle__", "id"],
			},
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>拖拽排序（远程数据源 + 乐观更新）</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="rounded-md border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
					<div>验证点：拖拽后列表立刻更新（乐观），随后模拟服务端确认并自动 refetch。</div>
					<div>同步状态：{syncStatus}</div>
				</div>

				<DataTableRoot
					dt={dt}
					layout={{ stickyHeader: true, stickyPagination: true }}
					className="rounded-md border border-border/50"
				>
					<DataTableToolbar
						actions={
							<div className="flex flex-wrap items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-8 gap-2"
									onClick={() => dt.actions.resetAll()}
								>
									<RotateCcw className="h-4 w-4" />
									重置
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
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Badge variant={syncStatus === "syncing" ? "default" : "secondary"}>
								{syncStatus}
							</Badge>
							<span>拖拽手柄在首列（remote + optimistic）</span>
						</div>
					</DataTableToolbar>

					<div className="overflow-x-auto">
						<DataTableTable<DemoInvoiceRow> />
					</div>

					<DataTablePagination />
				</DataTableRoot>
			</CardContent>
		</Card>
	)
}
