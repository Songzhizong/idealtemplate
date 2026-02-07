import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { local, stateInternal, useDataTable } from "@/components/table/v2"
import { createColumnHelper } from "../columns"
import { DataTableRoot } from "./root"
import { DataTableTable } from "./table"

type RowData = {
  id: string
  name: string
}

type Filters = {
  q: string | null
}

function StickyHeaderHarness() {
  const helper = createColumnHelper<RowData>()
  const dt = useDataTable<RowData, Filters>({
    columns: [
      helper.accessor("name", {
        header: "Name",
        cell: (ctx) => ctx.getValue(),
      }),
    ],
    dataSource: local<RowData, Filters>({
      rows: [{ id: "1", name: "Alice" }],
    }),
    state: stateInternal<Filters>({
      initial: {
        page: 1,
        size: 10,
        sort: [],
        filters: { q: null },
      },
    }),
    getRowId: (row) => row.id,
  })

  return (
    <DataTableRoot dt={dt} layout={{ stickyHeader: true }}>
      <DataTableTable<RowData> />
    </DataTableRoot>
  )
}

describe("DataTableTable sticky header", () => {
  it("window 滚动模式下会渲染吸顶表头容器", () => {
    const { container } = render(<StickyHeaderHarness />)

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument()

    const stickyHeader = container.querySelector("div.sticky")
    expect(stickyHeader).not.toBeNull()
    expect(stickyHeader).toHaveStyle({ top: "var(--dt-sticky-top,0px)" })
    expect(stickyHeader?.querySelector("thead")).not.toBeNull()
  })
})
