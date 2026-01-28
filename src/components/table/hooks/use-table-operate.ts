import { useCallback, useState } from "react"
import { toast } from "sonner"
import { useBoolean } from "@/hooks/use-boolean"

export type TableOperateType = "add" | "edit" | "view"

export interface UseTableOperateOptions<TData> {
	/**
	 * Table data
	 */
	data: TData[]
	/**
	 * ID key for finding items
	 */
	idKey: keyof TData
	/**
	 * Refetch data after operations
	 */
	onRefresh: () => void | Promise<void>
}

/**
 * Hook for table CRUD operations
 */
export function useTableOperate<TData>(options: UseTableOperateOptions<TData>) {
	const { data, idKey, onRefresh } = options

	const { value: drawerVisible, setTrue: openDrawer, setFalse: closeDrawer } = useBoolean()

	const [operateType, setOperateType] = useState<TableOperateType>("add")
	const [editingData, setEditingData] = useState<TData | null>(null)
	const [checkedRowKeys, setCheckedRowKeys] = useState<string[]>([])

	const handleAdd = useCallback(() => {
		setOperateType("add")
		setEditingData(null)
		openDrawer()
	}, [openDrawer])

	const handleEdit = useCallback(
		(id: TData[keyof TData]) => {
			setOperateType("edit")
			const findItem = data.find((item) => item[idKey] === id) || null
			setEditingData(findItem ? { ...findItem } : null)
			openDrawer()
		},
		[data, idKey, openDrawer],
	)

	const handleView = useCallback(
		(id: TData[keyof TData]) => {
			setOperateType("view")
			const findItem = data.find((item) => item[idKey] === id) || null
			setEditingData(findItem ? { ...findItem } : null)
			openDrawer()
		},
		[data, idKey, openDrawer],
	)

	const onDeleted = useCallback(async () => {
		toast.success("Delete successful")
		await onRefresh()
	}, [onRefresh])

	const onBatchDeleted = useCallback(async () => {
		toast.success("Batch delete successful")
		setCheckedRowKeys([])
		await onRefresh()
	}, [onRefresh])

	const onSaved = useCallback(async () => {
		toast.success(operateType === "add" ? "Create successful" : "Update successful")
		closeDrawer()
		await onRefresh()
	}, [operateType, closeDrawer, onRefresh])

	return {
		drawerVisible,
		openDrawer,
		closeDrawer,
		operateType,
		editingData,
		handleAdd,
		handleEdit,
		handleView,
		checkedRowKeys,
		setCheckedRowKeys,
		onDeleted,
		onBatchDeleted,
		onSaved,
	}
}
