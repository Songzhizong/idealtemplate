export interface InfrastructureStats {
	totalUsers: number
	activeUsers: number
	totalFiles: number
	storageUsed: string
	totalTasks: number
	runningTasks: number
	totalNotifications: number
	unreadNotifications: number
	systemHealth: "healthy" | "warning" | "error"
	updatedAt: string
}

export interface SystemModule {
	id: string
	name: string
	description: string
	status: "active" | "inactive" | "maintenance"
	usage: number
	lastUpdated: string
}

export interface RecentActivity {
	id: string
	type: "login" | "file_upload" | "task_complete" | "notification" | "system"
	user: string
	description: string
	timestamp: string
}
