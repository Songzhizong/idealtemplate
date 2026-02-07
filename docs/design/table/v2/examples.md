# 表格组件 V2 示例代码

本文件提供 6 类可直接复用的示例代码骨架。完整可运行页面可参考：
- `src/features/example/table/stages/stage-1-basic.tsx`
- `src/features/example/table/stages/stage-2-filters.tsx`
- `src/features/example/table/stages/stage-3-features.tsx`
- `src/features/example/table/stages/stage-4-tree-drag.tsx`
- `src/features/example/table/stages/stage-4-remote-drag.tsx`

---

## 1. 基础表格

```tsx
import { createColumnHelper, DataTablePreset, local, stateInternal, useDataTable } from "@/components/table/v2"

interface UserRow {
  id: string
  name: string
  role: string
}

interface UserFilters {
  q: string
}

const helper = createColumnHelper<UserRow>()
const columns = [
  helper.accessor("name", { header: "姓名", cell: (ctx) => ctx.row.original.name }),
  helper.accessor("role", { header: "角色", cell: (ctx) => ctx.row.original.role }),
]

export function BasicTableExample({ rows }: { rows: UserRow[] }) {
  const state = stateInternal<UserFilters>({
    initial: { page: 1, size: 10, sort: [], filters: { q: "" } },
  })
  const dataSource = local<UserRow, UserFilters>({ rows })
  const dt = useDataTable<UserRow, UserFilters>({
    columns,
    dataSource,
    state,
    getRowId: (row) => row.id,
  })
  return <DataTablePreset dt={dt} />
}
```

---

## 2. 远程分页表格

```tsx
import { parseAsString } from "nuqs"
import {
  DataTablePagination,
  DataTableRoot,
  DataTableTable,
  remote,
  stateUrl,
  useDataTable,
} from "@/components/table/v2"

interface InvoiceRow {
  id: string
  name: string
}

interface InvoiceFilters {
  q: string
}

interface InvoiceResponse {
  rows: InvoiceRow[]
  total: number
  pageCount: number
}

async function fetchInvoices(args: {
  page: number
  size: number
  sort: { field: string; order: "asc" | "desc" }[]
  filters: InvoiceFilters
}): Promise<InvoiceResponse> {
  return api.invoice.list(args)
}

export function RemotePaginationExample({ columns }: { columns: Array<unknown> }) {
  const state = stateUrl({
    key: "invoice_table",
    parsers: { q: parseAsString.withDefault("") },
  })
  const dataSource = remote<InvoiceRow, InvoiceFilters, InvoiceResponse>({
    queryKey: ["invoice-list"],
    queryFn: fetchInvoices,
    map: (res) => ({ rows: res.rows, total: res.total, pageCount: res.pageCount }),
  })
  const dt = useDataTable<InvoiceRow, InvoiceFilters>({
    columns: columns as never,
    dataSource,
    state,
    getRowId: (row) => row.id,
  })

  return (
    <DataTableRoot dt={dt} layout={{ stickyHeader: true, stickyPagination: true }}>
      <DataTableTable<InvoiceRow> />
      <DataTablePagination />
    </DataTableRoot>
  )
}
```

---

## 3. 带筛选的表格

```tsx
import type { FilterDefinition } from "@/components/table/v2"
import {
  DataTableActiveFilters,
  DataTableFilterBar,
  DataTableSearch,
  DataTableToolbar,
} from "@/components/table/v2"

interface UserFilters {
  q: string
  status: "active" | "disabled" | null
  amountRange: { min: number | undefined; max: number | undefined } | null
}

const filters: Array<FilterDefinition<UserFilters, keyof UserFilters>> = [
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "激活", value: "active" },
      { label: "禁用", value: "disabled" },
    ],
    alwaysVisible: true,
  },
  {
    key: "amountRange",
    label: "金额区间",
    type: "number-range",
    defaultVisible: true,
  },
]

export function FilterTableToolbar() {
  return (
    <>
      <DataTableToolbar>
        <DataTableSearch<UserFilters> filterKey="q" />
      </DataTableToolbar>
      <div className="border-b border-border/50 bg-background px-3 py-3">
        <DataTableFilterBar<UserFilters> filters={filters} />
        <DataTableActiveFilters<UserFilters> filters={filters} className="mt-3" />
      </div>
    </>
  )
}
```

---

## 4. 带选择的表格

```tsx
import { createColumnHelper, DataTableSelectionBar, useDataTable } from "@/components/table/v2"
import { Button } from "@/components/ui/button"

interface RowItem {
  id: string
  name: string
}

interface Filters {
  q: string
}

const helper = createColumnHelper<RowItem>()
const columns = [helper.select(), helper.accessor("name", { header: "名称" })]

export function SelectionExample(props: {
  dataSource: never
  state: never
}) {
  const dt = useDataTable<RowItem, Filters>({
    columns,
    dataSource: props.dataSource,
    state: props.state,
    getRowId: (row) => row.id,
    features: {
      selection: {
        enabled: true,
        mode: "cross-page",
        crossPage: {
          selectAllStrategy: "server",
          fetchAllIds: async (filters) => api.user.fetchAllIds(filters),
        },
      },
    },
  })

  return (
    <DataTableSelectionBar<RowItem, Filters>
      actions={({ exportPayload }) => (
        <Button
          type="button"
          size="sm"
          onClick={() => {
            void api.export.create(exportPayload)
          }}
        >
          导出已选
        </Button>
      )}
    />
  )
}
```

---

## 5. 树形表格

```tsx
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableTreeCell, useDataTable } from "@/components/table/v2"

interface TreeRow {
  id: string
  name: string
  hasChildren: boolean
  children?: TreeRow[]
}

const columns: Array<ColumnDef<TreeRow>> = [
  {
    accessorKey: "name",
    header: "名称",
    cell: ({ row }) => (
      <DataTableTreeCell<TreeRow> row={row}>
        {row.original.name}
      </DataTableTreeCell>
    ),
  },
]

export function TreeExample(props: {
  dataSource: never
  state: never
}) {
  const dt = useDataTable<TreeRow, Record<string, never>>({
    columns,
    dataSource: props.dataSource,
    state: props.state,
    getRowId: (row) => row.id,
    features: {
      tree: {
        enabled: true,
        getSubRows: (row) => row.children,
        getRowCanExpand: (row) => row.hasChildren,
        loadChildren: async (row) => api.tree.loadChildren(row.id),
      },
    },
  })
  return <div>{dt.tree.expandedRowIds.length}</div>
}
```

---

## 6. 可拖拽排序的表格

```tsx
import { createColumnHelper, useDataTable } from "@/components/table/v2"

interface TaskRow {
  id: string
  title: string
  locked?: boolean
}

const helper = createColumnHelper<TaskRow>()
const columns = [helper.dragHandle(), helper.accessor("title", { header: "任务" })]

export function DragSortExample(props: {
  dataSource: never
  state: never
}) {
  const dt = useDataTable<TaskRow, Record<string, never>>({
    columns,
    dataSource: props.dataSource,
    state: props.state,
    getRowId: (row) => row.id,
    features: {
      dragSort: {
        enabled: true,
        handle: true,
        dragOverlay: "ghost",
        canDrag: (row) => row.locked !== true,
        onReorder: async ({ activeId, overId, reorderedRows }) => {
          if (reorderedRows) {
            // 本地数据源直接使用 reorderedRows
            setTaskRows(reorderedRows)
            return
          }
          // 远程场景可上报 activeId/overId/dropPosition
          await api.task.reorder({ activeId, overId })
        },
      },
    },
  })

  return <div>{dt.dragSort.enabled ? "drag-on" : "drag-off"}</div>
}
```

