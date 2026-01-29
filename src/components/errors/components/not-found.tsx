import { Search } from "lucide-react"
import { ErrorLayout } from "./error-layout"

export function NotFound() {
	return (
		<ErrorLayout
			icon={<Search size={48} />}
			title="404 - 页面未找到"
			description="抱歉，我们找不到您要查看的页面。它可能已被移动、删除，或您输入的 URL 有误。"
		/>
	)
}
