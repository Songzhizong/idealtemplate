import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	Stage1BasicTableDemo,
	Stage2FiltersTableDemo,
	Stage3FeaturesTableDemo,
	Stage4AdvancedTableDemo,
	Stage5PresetTableDemo,
} from "./stages"

type StageValue = "stage1" | "stage2" | "stage3" | "stage4" | "stage5"

const STAGE_META: Record<
	StageValue,
	{
		title: string
		desc: string
	}
> = {
	stage1: {
		title: "阶段 1：基础能力（URL 状态）",
		desc: "loading / empty / pagination / sort / URL 同步 / 刷新保留",
	},
	stage2: {
		title: "阶段 2：搜索与筛选",
		desc: "Search debounce / FilterBar / ActiveFilters / 筛选变化重置 page",
	},
	stage3: {
		title: "阶段 3：基础 Feature",
		desc: "Selection / Column Visibility / Column Sizing / Pinning / Expansion / Density",
	},
	stage4: {
		title: "阶段 4：高级能力",
		desc: "Tree（懒加载）/ DragSort（local & remote + optimistic）",
	},
	stage5: {
		title: "阶段 5：DX 收敛",
		desc: "DataTablePreset / createColumnHelper / 偏好持久化 / i18n 覆盖",
	},
}

function renderStage(stage: StageValue) {
	switch (stage) {
		case "stage1":
			return <Stage1BasicTableDemo />
		case "stage2":
			return <Stage2FiltersTableDemo />
		case "stage3":
			return <Stage3FeaturesTableDemo />
		case "stage4":
			return <Stage4AdvancedTableDemo />
		case "stage5":
			return <Stage5PresetTableDemo />
		default:
			return null
	}
}

export function TableV2DemoPage() {
	const [stage, setStage] = useState<StageValue>("stage1")

	const meta = useMemo(() => STAGE_META[stage], [stage])

	return (
		<div className="flex flex-col gap-6 p-6">
			<Card>
				<CardHeader>
					<CardTitle>Table V2 手动验证</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Tabs value={stage} onValueChange={(value) => setStage(value as StageValue)}>
						<TabsList className="grid w-full grid-cols-5">
							<TabsTrigger value="stage1">阶段 1</TabsTrigger>
							<TabsTrigger value="stage2">阶段 2</TabsTrigger>
							<TabsTrigger value="stage3">阶段 3</TabsTrigger>
							<TabsTrigger value="stage4">阶段 4</TabsTrigger>
							<TabsTrigger value="stage5">阶段 5</TabsTrigger>
						</TabsList>
					</Tabs>

					<div className="rounded-md border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
						<div className="font-medium text-foreground">{meta.title}</div>
						<div>{meta.desc}</div>
					</div>
				</CardContent>
			</Card>

			{renderStage(stage)}
		</div>
	)
}
