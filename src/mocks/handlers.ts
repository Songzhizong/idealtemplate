import { addMinutes } from "date-fns"
import { delay, HttpResponse, http } from "msw"
import { authHandlers } from "@/features/auth/api/auth.mock"
import { DashboardStatsSchema } from "@/features/dashboard/api/get-stats"
import { ProfileSchema, UpdateProfileResponseSchema } from "@/features/dashboard/api/update-profile"

const mockStats = DashboardStatsSchema.parse({
	totalUsers: 32480,
	activeToday: 1240,
	conversionRate: 4.6,
	revenue: 128430,
	updatedAt: addMinutes(new Date(), -18).toISOString(),
})

export const handlers = [
	...authHandlers,
	// 使用通配符或相对路径匹配，确保无论是否经过代理都能拦截
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
