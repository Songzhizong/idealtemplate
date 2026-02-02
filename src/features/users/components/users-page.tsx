import { Plus } from "lucide-react"
import { parseAsString } from "nuqs"
import { useCallback, useMemo } from "react"
import { AuthButton } from "@/components/auth/auth-button"
import { PageContainer } from "@/components/common"
import {
	DataTable,
	DataTableContainer,
	DataTableFilterBar,
	DataTablePagination,
	TableProvider,
} from "@/components/table"
import { PERMISSIONS } from "@/config/permissions"
import { useDataTable } from "@/hooks"
import { type GetUsersParams, getUsers } from "../api/get-users"
import type { User } from "../types"
import { UsersExtraFilters, UsersFilterForm } from "./users-filter-form"
import { usersTableColumns } from "./users-table-columns"

/**
 * Simplified Users Page using useDataTable hook
 *
 * Benefits:
 * - Zero glue code: No manual URL sync, no manual page reset
 * - Type-safe filters: Filter state is fully typed
 * - Auto-debounced search: Built-in debouncing for search input
 * - Auto page reset: Filters automatically reset page to 1
 * - Single source of truth: URL state drives everything
 *
 * Comparison with old approach:
 * - Before: 3 separate hooks (useUsersFilters, useUsersQuery, manual sync)
 * - After: 1 hook (useDataTable) with automatic sync
 * - Before: Manual page reset on filter change
 * - After: Automatic page reset built-in
 * - Before: Manual debounce implementation
 * - After: Built-in debounced search
 */
export function UsersPage() {
	// 🔥 One hook to rule them all - handles URL, pagination, API, search, debounce
	const { table, filters, loading, empty, fetching, refetch, pagination, setPage, setPageSize } =
		useDataTable<User>({
			queryKey: ["users"],
			queryFn: (params) => getUsers(params as unknown as GetUsersParams),
			columns: usersTableColumns,
			// Define business filters with their parsers
			filterParsers: {
				username: parseAsString,
				email: parseAsString,
				phone: parseAsString,
				status: parseAsString.withDefault("all"),
				mfaEnabled: parseAsString.withDefault("all"),
				userGroups: parseAsString.withDefault("all"),
			},
			// Default values for filters (used in reset)
			defaultFilters: {
				status: "all",
				mfaEnabled: "all",
				userGroups: "all",
			},
		})

	// Handlers
	const handleReset = useCallback(() => {
		filters.reset()
		// URL changes automatically trigger refetch via React Query
	}, [filters])

	const handleRefresh = useCallback(async () => {
		await refetch()
	}, [refetch])

	const hasActiveFilters = useMemo(() => {
		const filterState = filters.state
		return Object.entries(filterState).some(([key, value]) => {
			if (key === "page" || key === "size" || key === "sort") return false
			if (value === null || value === undefined || value === "") return false
			return value !== "all"
		})
	}, [filters.state])

	return (
		<PageContainer className="flex flex-col h-full">
			<div className="flex flex-col gap-6 flex-1 min-h-0">
				<TableProvider
					table={table}
					loading={loading}
					empty={empty}
					pagination={pagination}
					onPageChange={setPage}
					onPageSizeChange={setPageSize}
				>
					<DataTableContainer
						toolbar={
							<DataTableFilterBar
								onReset={handleReset}
								onRefresh={handleRefresh}
								hasActiveFilters={hasActiveFilters}
								actions={
									<AuthButton
										permission={PERMISSIONS.USERS_ADD}
										tooltipSide={"bottom"}
										size="sm"
										className="h-9"
									>
										<Plus className="mr-2 h-4 w-4" />
										新增
									</AuthButton>
								}
								extraFilters={
									<UsersExtraFilters
										urlFilters={filters.state}
										onSelectChange={(key, value) => filters.set(key, value)}
									/>
								}
							>
								<UsersFilterForm
									urlFilters={filters.state}
									onSelectChange={(key, value) => filters.set(key, value)}
								/>
							</DataTableFilterBar>
						}
						table={
							<DataTable
								table={table}
								loading={loading}
								empty={empty}
								emptyText="暂无用户数据"
								fetching={fetching}
							/>
						}
						pagination={<DataTablePagination />}
					/>
				</TableProvider>
			</div>
		</PageContainer>
	)
}
