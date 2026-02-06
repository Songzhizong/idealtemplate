import type { ReactNode } from "react"
import type { DataTableInstance } from "../core"
import type { DataTableLayoutOptions } from "./context"
import { DataTablePagination } from "./pagination"
import { DataTableRoot } from "./root"
import { DataTableSearch } from "./search"
import type { DataTableSelectionBarProps } from "./selection-bar"
import { DataTableSelectionBar } from "./selection-bar"
import { DataTableTable } from "./table"
import { DataTableToolbar } from "./toolbar"

export interface DataTablePresetProps<TData, TFilterSchema> {
	dt: DataTableInstance<TData, TFilterSchema>
	height?: string
	className?: string
	layout?: DataTableLayoutOptions
	toolbar?: ReactNode
	toolbarActions?: ReactNode
	renderEmpty?: () => ReactNode
	renderError?: (error: unknown, retry?: () => void | Promise<void>) => ReactNode
	selectionBarActions?: DataTableSelectionBarProps<TData>["actions"]
}

export function DataTablePreset<TData, TFilterSchema>({
	dt,
	height,
	className,
	layout,
	toolbar,
	toolbarActions,
	renderEmpty,
	renderError,
	selectionBarActions,
}: DataTablePresetProps<TData, TFilterSchema>) {
	const toolbarContent = toolbar === undefined ? <DataTableSearch /> : toolbar

	return (
		<DataTableRoot
			dt={dt}
			{...(typeof height === "string" ? { height } : {})}
			{...(typeof className === "string" ? { className } : {})}
			{...(layout ? { layout } : {})}
		>
			<DataTableToolbar actions={toolbarActions}>{toolbarContent}</DataTableToolbar>
			<div className="overflow-x-auto">
				<DataTableTable<TData>
					{...(renderEmpty ? { renderEmpty } : {})}
					{...(renderError ? { renderError } : {})}
				/>
			</div>
			<DataTableSelectionBar<TData>
				{...(selectionBarActions ? { actions: selectionBarActions } : {})}
			/>
			<DataTablePagination />
		</DataTableRoot>
	)
}
