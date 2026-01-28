import { addMinutes } from "date-fns"
import { delay, HttpResponse, http } from "msw"
import { authHandlers } from "@/features/auth/api/auth.mock"
import { DashboardStatsSchema } from "@/features/dashboard/api/get-stats"
import { ProfileSchema, UpdateProfileResponseSchema } from "@/features/dashboard/api/update-profile"
import { UserSchema } from "@/features/users/types"
import { createPageInfoSchema } from "@/types/pagination"

const mockStats = DashboardStatsSchema.parse({
	totalUsers: 32480,
	activeToday: 1240,
	conversionRate: 4.6,
	revenue: 128430,
	updatedAt: addMinutes(new Date(), -18).toISOString(),
})

const UserPageSchema = createPageInfoSchema(UserSchema)

// Mock 10 users with realistic data
const mockUsers = UserPageSchema.parse({
	content: [
		{
			id: "1",
			username: "张伟",
			email: "zhangwei@company.com",
			phone: "138****2001",
			userGroup: "admin",
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -5).toISOString(),
		},
		{
			id: "2",
			username: "李娜",
			email: "lina@company.com",
			phone: "139****3002",
			userGroup: "user",
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -30).toISOString(),
		},
		{
			id: "3",
			username: "王强",
			email: "wangqiang@company.com",
			phone: "136****4003",
			userGroup: "user",
			status: "active",
			mfaEnabled: false,
			lastVisit: addMinutes(new Date(), -120).toISOString(),
		},
		{
			id: "4",
			username: "刘芳",
			email: "liufang@company.com",
			phone: "137****5004",
			userGroup: "user",
			status: "inactive",
			mfaEnabled: false,
			lastVisit: addMinutes(new Date(), -1440).toISOString(),
		},
		{
			id: "5",
			username: "陈明",
			email: "chenming@company.com",
			phone: "135****6005",
			userGroup: "guest",
			status: "active",
			mfaEnabled: false,
			lastVisit: addMinutes(new Date(), -60).toISOString(),
		},
		{
			id: "6",
			username: "杨静",
			email: "yangjing@company.com",
			phone: "188****7006",
			userGroup: "user",
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -15).toISOString(),
		},
		{
			id: "7",
			username: "赵磊",
			email: "zhaolei@company.com",
			phone: "186****8007",
			userGroup: "admin",
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -10).toISOString(),
		},
		{
			id: "8",
			username: "黄丽",
			email: "huangli@company.com",
			phone: "159****9008",
			userGroup: "user",
			status: "active",
			mfaEnabled: false,
			lastVisit: addMinutes(new Date(), -240).toISOString(),
		},
		{
			id: "9",
			username: "周涛",
			email: "zhoutao@company.com",
			phone: "158****1009",
			userGroup: "guest",
			status: "inactive",
			mfaEnabled: false,
			lastVisit: addMinutes(new Date(), -2880).toISOString(),
		},
		{
			id: "10",
			username: "吴敏",
			email: "wumin@company.com",
			phone: "157****2010",
			userGroup: "user",
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -45).toISOString(),
		},
		{
			id: "11",
			username: "李兰",
			email: "lilan@company.com",
			phone: "157****2013",
			userGroup: "user",
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -45).toISOString(),
		},
	],
	pageNumber: 1,
	pageSize: 1,
	totalElements: 11,
	totalPages: 2,
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
	http.get("*/users", async () => {
		await delay(300)
		return HttpResponse.json(mockUsers)
	}),
]
