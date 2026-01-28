import { createFileRoute } from "@tanstack/react-router"
import { UsersTable } from "@/features/users/components/users-table"

export const Route = createFileRoute("/_authenticated/users")({
	component: UsersPage,
})

function UsersPage() {
	return (
		<div className="flex h-full flex-col">
			<UsersTable />
		</div>
	)
}
