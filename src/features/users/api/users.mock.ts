import { addMinutes } from "date-fns"
import { delay, HttpResponse, http } from "msw"
import { UserSchema } from "@/features/users/types"
import { mockRegistry } from "@/mocks/registry"
import { createPageInfoSchema } from "@/types/pagination"

const UserPageSchema = createPageInfoSchema(UserSchema)

// Mock 10 users with realistic data
const mockUsers = UserPageSchema.parse({
	content: [
		{
			id: "1",
			username: "张伟",
			email: "zhangwei@company.com",
			phone: "138****2001",
			userGroups: ["admin", "developer"],
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -5).toISOString(),
		},
		{
			id: "2",
			username: "李娜",
			email: "lina@company.com",
			phone: "139****3002",
			userGroups: ["user"],
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -30).toISOString(),
		},
		{
			id: "3",
			username: "王强",
			email: "wangqiang@company.com",
			phone: "136****4003",
			userGroups: ["user", "analyst"],
			status: "active",
			mfaEnabled: false,
			lastVisit: addMinutes(new Date(), -120).toISOString(),
		},
		{
			id: "4",
			username: "刘芳",
			email: "liufang@company.com",
			phone: "137****5004",
			userGroups: ["user"],
			status: "inactive",
			mfaEnabled: false,
			lastVisit: addMinutes(new Date(), -1440).toISOString(),
		},
		{
			id: "5",
			username: "陈明",
			email: "chenming@company.com",
			phone: "135****6005",
			userGroups: ["guest"],
			status: "active",
			mfaEnabled: false,
			lastVisit: addMinutes(new Date(), -60).toISOString(),
		},
		{
			id: "6",
			username: "杨静",
			email: "yangjing@company.com",
			phone: "188****7006",
			userGroups: ["user", "support"],
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -15).toISOString(),
		},
		{
			id: "7",
			username: "赵磊",
			email: "zhaolei@company.com",
			phone: "186****8007",
			userGroups: ["admin"],
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -10).toISOString(),
		},
		{
			id: "8",
			username: "黄丽",
			email: "huangli@company.com",
			phone: "159****9008",
			userGroups: ["user", "developer"],
			status: "active",
			mfaEnabled: false,
			lastVisit: addMinutes(new Date(), -240).toISOString(),
		},
		{
			id: "9",
			username: "周涛",
			email: "zhoutao@company.com",
			phone: "158****1009",
			userGroups: ["guest"],
			status: "inactive",
			mfaEnabled: false,
			lastVisit: addMinutes(new Date(), -2880).toISOString(),
		},
		{
			id: "10",
			username: "吴敏",
			email: "wumin@company.com",
			phone: "157****2010",
			userGroups: ["user", "analyst"],
			status: "active",
			mfaEnabled: true,
			lastVisit: addMinutes(new Date(), -45).toISOString(),
		},
		{
			id: "11",
			username: "李兰",
			email: "lilan@company.com",
			phone: "157****2013",
			userGroups: ["support"],
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

export const userHandlers = [
	http.get("*/users", async () => {
		await delay(300)
		return HttpResponse.json(mockUsers)
	}),
]

// 主动注入
mockRegistry.register(...userHandlers)
