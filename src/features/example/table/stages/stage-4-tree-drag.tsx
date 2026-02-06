import type { ColumnDef } from "@tanstack/react-table"
import { FileText, Folder, RotateCcw } from "lucide-react"
import { useMemo, useState } from "react"
import {
	DataTablePagination,
	DataTableRoot,
	DataTableTable,
	DataTableToolbar,
	DataTableTreeCell,
	dragHandle,
	local,
	stateInternal,
	useDataTable,
} from "@/components/table/v2"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { delay } from "../demo/invoice"

type Stage4TreeFilters = Record<string, never>

type TreeRowType = "folder" | "file"

interface TreeRow {
	id: string
	name: string
	type: TreeRowType
	size: number
	updatedAt: string
	level: number
	hasChildren: boolean
	children?: TreeRow[]
}

function buildInitialTreeRows(): TreeRow[] {
	const baseDate = new Date(Date.UTC(2024, 0, 1))
	return Array.from({ length: 8 }).map((_, index) => {
		const id = `node_${index + 1}`
		const children = index === 1 ? buildChildren({ parentId: id, parentLevel: 0, seed: 100 }) : null
		return {
			id,
			name: `Folder ${index + 1}`,
			type: "folder",
			size: 0,
			updatedAt: new Date(baseDate.getTime() + index * 24 * 60 * 60 * 1000).toISOString(),
			level: 0,
			hasChildren: index % 2 === 0,
			...(children ? { children } : {}),
		}
	})
}

function buildChildren(args: { parentId: string; parentLevel: number; seed: number }): TreeRow[] {
	const nextLevel = args.parentLevel + 1
	if (nextLevel > 2) return []

	const baseDate = new Date(Date.UTC(2024, 1, 1))
	return Array.from({ length: 4 }).map((_, index) => {
		const id = `${args.parentId}_${nextLevel}_${index + 1}`
		const isFolder = index === 0
		const hasChildren = isFolder && nextLevel < 2
		return {
			id,
			name: isFolder ? `Subfolder ${nextLevel}.${index + 1}` : `File ${nextLevel}.${index + 1}`,
			type: isFolder ? "folder" : "file",
			size: isFolder ? 0 : 800 + (((args.seed + index) * 97) % 6200),
			updatedAt: new Date(baseDate.getTime() + (args.seed + index) * 60 * 60 * 1000).toISOString(),
			level: nextLevel,
			hasChildren,
		}
	})
}

function updateTreeNode(
	rows: TreeRow[],
	nodeId: string,
	updater: (node: TreeRow) => TreeRow,
): TreeRow[] {
	const walk = (items: TreeRow[]): TreeRow[] => {
		let didChange = false
		const next: TreeRow[] = []

		for (const item of items) {
			if (item.id === nodeId) {
				didChange = true
				next.push(updater(item))
				continue
			}

			if (item.children && item.children.length > 0) {
				const nextChildren = walk(item.children)
				if (nextChildren !== item.children) {
					didChange = true
					next.push({ ...item, children: nextChildren })
					continue
				}
			}

			next.push(item)
		}

		return didChange ? next : items
	}

	return walk(rows)
}

function removeNode(
	rows: TreeRow[],
	nodeId: string,
): { nextRows: TreeRow[]; removed: TreeRow | null } {
	let removed: TreeRow | null = null

	const walk = (items: TreeRow[]): TreeRow[] => {
		let didChange = false
		const next: TreeRow[] = []

		for (const item of items) {
			if (item.id === nodeId) {
				removed = item
				didChange = true
				continue
			}

			if (item.children && item.children.length > 0) {
				const nextChildren = walk(item.children)
				if (nextChildren !== item.children) {
					didChange = true
					next.push({ ...item, children: nextChildren })
					continue
				}
			}

			next.push(item)
		}

		return didChange ? next : items
	}

	return { nextRows: walk(rows), removed }
}

function insertNode(args: {
	rows: TreeRow[]
	node: TreeRow
	targetParentId: string | null
	targetIndex: number
}): TreeRow[] {
	const index = Math.max(0, args.targetIndex)

	if (!args.targetParentId) {
		const next = args.rows.slice()
		next.splice(Math.min(index, next.length), 0, args.node)
		return next
	}

	let inserted = false
	const walk = (items: TreeRow[]): TreeRow[] => {
		let didChange = false
		const next: TreeRow[] = []

		for (const item of items) {
			if (item.id === args.targetParentId) {
				const children = item.children ? item.children.slice() : []
				children.splice(Math.min(index, children.length), 0, args.node)
				inserted = true
				didChange = true
				next.push({
					...item,
					hasChildren: true,
					children,
				})
				continue
			}

			if (item.children && item.children.length > 0) {
				const nextChildren = walk(item.children)
				if (nextChildren !== item.children) {
					didChange = true
					next.push({ ...item, children: nextChildren })
					continue
				}
			}

			next.push(item)
		}

		return didChange ? next : items
	}

	const nextRows = walk(args.rows)
	if (inserted) return nextRows
	return insertNode({ rows: args.rows, node: args.node, targetParentId: null, targetIndex: index })
}

function moveTreeNode(args: {
	rows: TreeRow[]
	activeId: string
	targetParentId: string | null
	targetIndex: number
}): TreeRow[] {
	const removal = removeNode(args.rows, args.activeId)
	if (!removal.removed) return args.rows
	return insertNode({
		rows: removal.nextRows,
		node: removal.removed,
		targetParentId: args.targetParentId,
		targetIndex: args.targetIndex,
	})
}

export function Stage4TreeDragDemo() {
	const [rows, setRows] = useState<TreeRow[]>(() => buildInitialTreeRows())

	const state = stateInternal<Stage4TreeFilters>({
		initial: {
			page: 1,
			size: 50,
			sort: [],
			filters: {},
		},
	})

	const dataSource = useMemo(() => {
		return local<TreeRow, Stage4TreeFilters>({
			rows,
			total: rows.length,
		})
	}, [rows])

	const columns = useMemo<ColumnDef<TreeRow>[]>(
		() => [
			dragHandle<TreeRow>(),
			{
				accessorKey: "name",
				header: "名称",
				cell: ({ row }) => (
					<DataTableTreeCell<TreeRow> row={row} className="min-w-[260px]">
						<div className="flex min-w-0 items-center gap-2">
							{row.original.type === "folder" ? (
								<Folder className="h-4 w-4 text-muted-foreground" />
							) : (
								<FileText className="h-4 w-4 text-muted-foreground" />
							)}
							<span className="truncate">{row.original.name}</span>
						</div>
					</DataTableTreeCell>
				),
				enableSorting: false,
			},
			{
				accessorKey: "type",
				header: "类型",
				cell: ({ row }) => (
					<Badge variant="secondary" className="capitalize">
						{row.original.type}
					</Badge>
				),
			},
			{
				accessorKey: "size",
				header: "大小",
				cell: ({ row }) => (row.original.type === "folder" ? "-" : `${row.original.size} KB`),
			},
			{
				accessorKey: "updatedAt",
				header: "更新日期",
				cell: ({ row }) => row.original.updatedAt.slice(0, 16).replace("T", " "),
			},
		],
		[],
	)

	const dt = useDataTable<TreeRow, Stage4TreeFilters>({
		columns,
		dataSource,
		state,
		getRowId: (row) => row.id,
		features: {
			tree: {
				enabled: true,
				getSubRows: (row) => row.children,
				getRowCanExpand: (row) => row.hasChildren || (row.children?.length ?? 0) > 0,
				loadChildren: async (row) => {
					await delay(650)
					const children = buildChildren({
						parentId: row.id,
						parentLevel: row.level,
						seed: row.id.length,
					})
					setRows((prev) =>
						updateTreeNode(prev, row.id, (node) => ({
							...node,
							children,
							hasChildren: children.length > 0,
						})),
					)
					return children
				},
				allowNesting: true,
				indentSize: 24,
			},
			dragSort: {
				enabled: true,
				handle: true,
				dragOverlay: "row",
				allowNesting: true,
				onReorder: async (args) => {
					const targetParentId = args.targetParentId ?? null
					const targetIndex = typeof args.targetIndex === "number" ? args.targetIndex : 0
					setRows((prev) =>
						moveTreeNode({
							rows: prev,
							activeId: args.activeId,
							targetParentId,
							targetIndex,
						}),
					)
				},
			},
			pinning: {
				left: ["__drag_handle__", "name"],
			},
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>树形 + 懒加载 + 拖拽排序（本地数据源）</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="rounded-md border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
					<div>验证点：展开/折叠、展开时懒加载、拖拽排序、拖拽改变层级（inside）。</div>
					<div>提示：拖到目标行中间区域可触发 “inside” 放置。</div>
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
									className="h-8"
									onClick={() => dt.actions.expandAll()}
								>
									展开全部
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-8"
									onClick={() => dt.actions.collapseAll()}
								>
									收起全部
								</Button>
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
							</div>
						}
					>
						<div className="text-sm text-muted-foreground">
							拖拽手柄在首列，支持同层/跨层移动（allowNesting=true）
						</div>
					</DataTableToolbar>

					<div className="overflow-x-auto">
						<DataTableTable<TreeRow> />
					</div>

					<DataTablePagination />
				</DataTableRoot>
			</CardContent>
		</Card>
	)
}
