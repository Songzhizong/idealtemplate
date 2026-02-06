import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { AdvancedSearchField } from "./types"
import { getFieldTypeLabel } from "./utils"

export interface DataTableAdvancedFieldPickerProps<TFilterSchema> {
  fieldPickerOpen: boolean
  onFieldPickerOpenChange: (nextOpen: boolean) => void
  activeField: AdvancedSearchField<TFilterSchema> | null
  searchableFields: Array<AdvancedSearchField<TFilterSchema>>
  onSelectField: (field: AdvancedSearchField<TFilterSchema>) => void
}

export function DataTableAdvancedFieldPicker<TFilterSchema>({
  fieldPickerOpen,
  onFieldPickerOpenChange,
  activeField,
  searchableFields,
  onSelectField,
}: DataTableAdvancedFieldPickerProps<TFilterSchema>) {
  const fieldButtonClassName = cn(
    "h-7 shrink-0 gap-1 px-2 text-xs font-medium transition-colors",
    activeField
      ? "bg-primary/10 text-primary hover:bg-primary/15"
      : "bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground",
  )
  const fieldChevronClassName = cn(
    "h-3.5 w-3.5 transition-colors",
    activeField ? "text-primary/80" : "text-muted-foreground",
  )

  return (
    <Popover open={fieldPickerOpen} onOpenChange={onFieldPickerOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className={fieldButtonClassName}>
          <span className="max-w-24 truncate">{activeField?.label ?? "筛选字段"}</span>
          <ChevronDown className={fieldChevronClassName} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        <Command>
          <CommandInput
            placeholder="搜索筛选字段"
            className="border-0 shadow-none focus-visible:ring-0 focus-visible:outline-none"
          />
          <CommandList>
            <CommandEmpty>暂无匹配字段</CommandEmpty>
            <CommandGroup heading="可用字段">
              {searchableFields.map((field) => (
                <CommandItem key={String(field.key)} onSelect={() => onSelectField(field)}>
                  <span className="truncate">{field.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {getFieldTypeLabel(field.type)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
