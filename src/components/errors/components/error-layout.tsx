import { useNavigate } from "@tanstack/react-router"
import type React from "react"
import { Button } from "@/components/ui/button"

interface ErrorLayoutProps {
	icon: React.ReactNode
	title: string
	description: string
}

export function ErrorLayout({ icon, title, description }: ErrorLayoutProps) {
	const navigate = useNavigate()

	return (
		<div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4 text-center">
			<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-primary">
				{icon}
			</div>
			<h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
			<p className="mb-8 max-w-md text-muted-foreground">{description}</p>
			<div className="flex gap-4">
				<Button onClick={() => window.history.back()} variant="outline">
					返回上一页
				</Button>
				<Button onClick={() => navigate({ to: "/" })}>返回首页</Button>
			</div>
		</div>
	)
}
