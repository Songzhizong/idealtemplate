import { GripVertical, RotateCcw, Settings2 } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { TableColumnCheck } from "../hooks/use-table"

export interface DataTableColumnToggleProps {
  columns: TableColumnCheck[]
  onColumnsChange: (checks: TableColumnCheck[]) => void
  onReset?: (() => void) | undefined
}

export function DataTableColumnToggle({
                                        columns,
                                        onColumnsChange,
                                        onReset,
                                      }: DataTableColumnToggleProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleToggle = (key: string) => {
    const updated = columns.map((check) =>
      check.key === key ? {...check, checked: !check.checked} : check,
    )
    onColumnsChange(updated)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const reordered = [...columns]
    const draggedItem = reordered[draggedIndex]
    if (!draggedItem) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    reordered.splice(draggedIndex, 1)
    reordered.splice(dragOverIndex, 0, draggedItem)

    onColumnsChange(reordered)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8">
          <Settings2 className="h-4 w-4"/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">列设置</DropdownMenuLabel>
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onReset()
              }}
            >
              <RotateCcw className="mr-1 h-3 w-3"/>
              重置
            </Button>
          )}
        </div>
        <DropdownMenuSeparator/>
        <div className="max-h-100 overflow-y-auto">
          {columns.map((check, index) => (
            // biome-ignore lint/a11y/useSemanticElements: Using a div with role="button" because we need a draggable, focusable item with custom keyboard and drag handlers; semantic elements don't support draggable API.
            <div
              key={check.key}
              role="button"
              tabIndex={0}
              aria-label={`Toggle ${check.title} column visibility`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex w-full items-center gap-2 px-2 py-2 cursor-move hover:bg-accent rounded-sm transition-colors text-left",
                draggedIndex === index && "opacity-50",
                dragOverIndex === index && "border-t-2 border-primary",
              )}
              onClick={() => handleToggle(check.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleToggle(check.key)
                }
              }}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0"/>
              <Checkbox
                id={`column-${check.key}`}
                checked={check.checked}
                onCheckedChange={() => handleToggle(check.key)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="flex-1 text-sm select-none">{check.title}</span>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
