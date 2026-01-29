import { ShieldAlert } from "lucide-react"
import { ErrorLayout } from "./error-layout"

export function Forbidden() {
	return (
		<ErrorLayout
			icon={<ShieldAlert size={48} />}
			title="403 - 访问受限"
			description="抱歉，您没有权限访问此页面。如果您认为这是一个错误，请联系管理员。"
		/>
	)
}
