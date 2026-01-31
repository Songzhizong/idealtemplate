import avatar1 from "@/assets/avatar/avatar-1.svg"
import avatar2 from "@/assets/avatar/avatar-2.svg"
import avatar3 from "@/assets/avatar/avatar-3.svg"
import avatar4 from "@/assets/avatar/avatar-4.svg"
import avatar5 from "@/assets/avatar/avatar-5.svg"
import avatar6 from "@/assets/avatar/avatar-6.svg"
import avatar7 from "@/assets/avatar/avatar-7.svg"
import avatar8 from "@/assets/avatar/avatar-8.svg"

const avatars = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8]

/**
 * 简单的哈希函数，将字符串映射为数字
 */
function hashString(str: string): number {
	let hash = 0
	if (str.length === 0) return hash
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash |= 0 // 转换为 32 位整数
	}
	return Math.abs(hash)
}

/**
 * 根据用户 ID 获取固定的头像
 * @param userId 用户 ID
 * @returns 头像路径
 */
export function getAvatarByHash(userId: string | undefined | null): string | undefined {
	const hash = hashString(userId || "")
	const index = hash % avatars.length
	return avatars[index]
}
