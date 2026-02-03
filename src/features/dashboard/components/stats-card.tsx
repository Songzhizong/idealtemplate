import type { LucideIcon } from "lucide-react"
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatsCardProps = {
	title: string
	value: string
	hint: string
	icon: LucideIcon
	accentClass?: string
}

export function StatsCard({ title, value, hint, icon: Icon, accentClass }: StatsCardProps) {
	return (
		<Card className="h-full">
			<CardHeader>
				<div>
					<CardTitle className="text-lg">{title}</CardTitle>
					<CardDescription>{hint}</CardDescription>
				</div>
				<CardAction>
					<div
						className={cn(
							"flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/40 text-foreground shadow-sm",
							accentClass,
						)}
					>
						<Icon className="h-5 w-5" />
					</div>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className="text-3xl font-semibold text-foreground sm:text-4xl">{value}</div>
			</CardContent>
		</Card>
	)
}
