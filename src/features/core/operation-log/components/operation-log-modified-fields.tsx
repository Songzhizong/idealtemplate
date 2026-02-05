import { Diff } from "lucide-react"
import { useMemo } from "react"
import { StatusBadge } from "@/components/common/status-badge"
import { Badge } from "@/components/ui/badge"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import type { Api } from "@/features/core/operation-log/api/operation-log"

interface OperationLogModifiedFieldsProps {
	modification: Api.Modification | Api.ModifiedFields | null | undefined
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null

const isModifiedField = (field: Api.ModifiedBase): field is Api.ModifiedField =>
	field.type === "modified_field"

const isModifiedCollection = (field: Api.ModifiedBase): field is Api.ModifiedCollection =>
	field.type === "modified_collection"

const normalizeDisplay = (value?: string | null) => (value && value.length > 0 ? value : "--")

// const CodeBlock = ({ code }: { code: string }) => (
// 	<SyntaxHighlighter
// 		language="json"
// 		style={githubGist}
// 		customStyle={{
// 			backgroundColor: "transparent",
// 			padding: 0,
// 			margin: 0,
// 			fontSize: "12px",
// 			lineHeight: "1.5",
// 		}}
// 		wrapLongLines
// 	>
// 		{code}
// 	</SyntaxHighlighter>
// )

export function OperationLogModifiedFields({ modification }: OperationLogModifiedFieldsProps) {
	const modifiedFields = useMemo<Api.ModifiedBase[]>(() => {
		if (!modification || !isRecord(modification)) return []
		const rawFields = (modification as unknown as Api.ModifiedFields).modifiedFields
		if (!Array.isArray(rawFields)) return []

		return rawFields.filter((field) => isRecord(field)) as unknown as Api.ModifiedBase[]
	}, [modification])

	if (modifiedFields.length === 0) return null

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2 text-sm font-semibold">
				<Diff className="size-4 text-muted-foreground" />
				<span>变更信息</span>
			</div>
			<div className="rounded-md border border-border/50">
				<Table>
					<TableHeader className="bg-muted/30">
						<TableRow>
							<TableHead className="w-45 font-medium text-muted-foreground">字段名称</TableHead>
							<TableHead className="font-medium text-muted-foreground">修改前</TableHead>
							<TableHead className="font-medium text-muted-foreground">修改后</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{modifiedFields.map((field) => (
							<TableRow key={field.ident} className="hover:bg-muted/10">
								<TableCell className="align-top font-medium py-2">
									<div className="flex flex-col">
										<span className="text-sm text-foreground">{field.ident}</span>
										{/* <span className="text-xs font-mono text-muted-foreground">({field.ident})</span> */}
									</div>
								</TableCell>

								{/* Before Value */}
								<TableCell className="align-top py-2">
									{isModifiedField(field) ? (
										field.displayValue || field.value ? (
											<div className="min-h-7 rounded border border-destructive/30 bg-destructive/10 px-2 py-1 text-sm text-destructive">
												{field.displayValue || field.value}
											</div>
										) : (
											<span className="text-muted-foreground text-sm ml-1">空</span>
										)
									) : (
										<span className="text-muted-foreground">--</span>
									)}
								</TableCell>

								{/* After Value */}
								<TableCell className="align-top py-2">
									{isModifiedField(field) ? (
										field.displayModifiedValue || field.modifiedValue ? (
											<div className="min-h-7 rounded border border-success/30 bg-success/10 px-2 py-1 text-sm text-success">
												{field.displayModifiedValue || field.modifiedValue}
											</div>
										) : (
											<span className="text-muted-foreground text-sm">空</span>
										)
									) : isModifiedCollection(field) ? (
										<div className="flex flex-col gap-1">
											{field.additions?.length ? (
												<div className="flex flex-wrap items-center gap-2">
													<StatusBadge tone="success" className="rounded-full">
														新增
													</StatusBadge>
													{field.additions.map((item) => (
														<Badge key={item.value} variant="secondary" className="rounded-full">
															{normalizeDisplay(item.displayValue || item.value)}
														</Badge>
													))}
												</div>
											) : null}
											{field.deletions?.length ? (
												<div className="flex flex-wrap items-center gap-2">
													<StatusBadge tone="error" className="rounded-full">
														删除
													</StatusBadge>
													{field.deletions.map((item) => (
														<Badge key={item.value} variant="secondary" className="rounded-full">
															{normalizeDisplay(item.displayValue || item.value)}
														</Badge>
													))}
												</div>
											) : null}
											{!field.additions?.length && !field.deletions?.length ? "--" : null}
										</div>
									) : (
										"--"
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
