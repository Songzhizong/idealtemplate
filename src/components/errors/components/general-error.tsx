import { AlertCircle } from "lucide-react"
import { ErrorLayout } from "./error-layout"

export function GeneralError() {
	return (
		<ErrorLayout
			icon={<AlertCircle size={48} />}
			title="500 - 服务器错误"
			description="抱歉，服务器出现了点问题。请稍后再试，或联系我们的支持团队。"
		/>
	)
}
