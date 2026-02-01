import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"

export interface DashboardStats {
	totalUsers: number
	activeToday: number
	conversionRate: number
	revenue: number
	updatedAt: string
}

const getStats = async () => {
	const json = await api.get("stats").json()
	return json as DashboardStats
}

export function useDashboardStats() {
	return useQuery({
		queryKey: ["dashboard", "stats"],
		queryFn: getStats,
	})
}
