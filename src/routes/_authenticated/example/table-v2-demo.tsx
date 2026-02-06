import { createFileRoute } from "@tanstack/react-router"
import { TableV2DemoPage } from "@/features/example/table"

export const Route = createFileRoute("/_authenticated/example/table-v2-demo")({
	component: TableV2DemoPage,
	staticData: {
		title: "Table V2 手动验证",
	},
})
