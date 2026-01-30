import { DASHBOARD_PERMISSIONS } from "./dashboard"
import { USER_PERMISSIONS } from "./users"

export const PERMISSIONS = {
    ...USER_PERMISSIONS,
    ...DASHBOARD_PERMISSIONS,
} as const
