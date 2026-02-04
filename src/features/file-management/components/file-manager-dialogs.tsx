import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { FileCatalog } from "../types"
import type { FolderSchema } from "./file-manager-helpers"
import { FileManagerTree } from "./file-manager-tree"

type FolderFormValues = z.infer<typeof FolderSchema>

interface FolderDialogProps {
	open: boolean
	mode: "create" | "rename" | null
	form: UseFormReturn<FolderFormValues>
	onSubmit: (values: FolderFormValues) => void
	onOpenChange: (open: boolean) => void
}

export function FolderDialog({ open, mode, form, onSubmit, onOpenChange }: FolderDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{mode === "create" ? "新建文件夹" : "重命名"}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>名称</FormLabel>
									<FormControl>
										<Input placeholder="请输入名称" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="gap-2">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								取消
							</Button>
							<Button type="submit">确认</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

interface MoveDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	nodes: FileCatalog[]
	selectedId: string | null
	onSelect: (id: string | null) => void
	disabledIds: string[]
	onConfirm: () => void
	title?: string
}

export function MoveDialog({
	open,
	onOpenChange,
	nodes,
	selectedId,
	onSelect,
	disabledIds,
	onConfirm,
	title = "移动到",
}: MoveDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="max-h-80 overflow-y-auto rounded-lg border border-border/30 p-2">
					<FileManagerTree
						nodes={nodes}
						selectedId={selectedId}
						onSelect={onSelect}
						disabledIds={disabledIds}
					/>
				</div>
				<DialogFooter className="gap-2">
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button type="button" onClick={onConfirm} disabled={!selectedId}>
						确认
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export interface ConfirmDialogAction {
	title: string
	description?: string
	icon?: React.ReactNode
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
	confirmText?: string
	onConfirm: () => Promise<void> | void
}

interface ConfirmDialogProps {
	action: ConfirmDialogAction | null
	onOpenChange: (open: boolean) => void
}

export function ConfirmDialog({ action, onOpenChange }: ConfirmDialogProps) {
	return (
		<AlertDialog open={Boolean(action)} onOpenChange={onOpenChange}>
			<AlertDialogContent className="sm:max-w-80">
				<AlertDialogHeader
					className={cn("items-center text-center sm:text-center pb-4", action?.icon && "gap-4")}
				>
					{action?.icon && (
						<div className="flex size-11 items-center justify-center rounded-full bg-destructive/15">
							{action.icon}
						</div>
					)}
					<div className="space-y-2">
						<AlertDialogTitle>{action?.title}</AlertDialogTitle>
						{action?.description && (
							<AlertDialogDescription>{action.description}</AlertDialogDescription>
						)}
					</div>
				</AlertDialogHeader>
				<AlertDialogFooter
					className={cn("sm:justify-center w-full gap-2", !action?.icon && "mt-4")}
				>
					<AlertDialogCancel className="mt-0 w-full border-border/70 sm:w-1/2 h-8 px-3">
						取消
					</AlertDialogCancel>
					<Button
						variant={action?.variant ?? "default"}
						className="w-full sm:w-1/2"
						size="sm"
						onClick={async () => {
							await action?.onConfirm()
							onOpenChange(false)
						}}
					>
						{action?.confirmText ?? "确认"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
