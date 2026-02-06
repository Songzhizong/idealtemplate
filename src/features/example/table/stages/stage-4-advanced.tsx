import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Stage4RemoteDragDemo } from "./stage-4-remote-drag"
import { Stage4TreeDragDemo } from "./stage-4-tree-drag"

export function Stage4AdvancedTableDemo() {
	const [active, setActive] = useState<"tree" | "remote">("tree")

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>阶段 4：高级能力（Tree / DragSort）</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="rounded-md border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
						<div>包含两个子场景：树形 + 懒加载 + 拖拽（本地）/ 拖拽（远程 + 乐观）。</div>
						<div>建议先验证 Tree 场景（含层级拖拽），再验证 Remote 场景。</div>
					</div>
					<Tabs value={active} onValueChange={(value) => setActive(value as typeof active)}>
						<TabsList variant="line" className="h-9">
							<TabsTrigger value="tree">Tree（本地）</TabsTrigger>
							<TabsTrigger value="remote">DragSort（远程）</TabsTrigger>
						</TabsList>
					</Tabs>
				</CardContent>
			</Card>

			{active === "tree" ? <Stage4TreeDragDemo /> : <Stage4RemoteDragDemo />}
		</div>
	)
}
