import { addMinutes } from "date-fns"
import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/mocks/registry"
import { DashboardStatsSchema } from "./get-stats"
import { ProfileSchema, UpdateProfileResponseSchema } from "./update-profile"

const mockStats = DashboardStatsSchema.parse({
	totalUsers: 32480,
	activeToday: 1240,
	conversionRate: 4.6,
	revenue: 128430,
	updatedAt: addMinutes(new Date(), -18).toISOString(),
})

export const dashboardHandlers = [
	http.get("*/stats", async () => {
		await delay(400)
		return HttpResponse.json(mockStats)
	}),
	http.post("*/profile", async ({ request }) => {
		const body = await request.json()
		const profile = ProfileSchema.parse(body)

		const response = UpdateProfileResponseSchema.parse({
			...profile,
			updatedAt: new Date().toISOString(),
		})

		return HttpResponse.json(response)
	}),
]

// 主动注入
mockRegistry.register(...dashboardHandlers)
