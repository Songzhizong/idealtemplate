import type { ColumnDef } from "@tanstack/react-table"
import { Ellipsis, KeyRound, Pencil } from "lucide-react"
import { BaseLink } from "@/components/common/base-link"
import { createColumnHelper } from "@/components/table/v2"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SortableHeader } from "@/features/example/table/components/sortable-header"
import { cn } from "@/lib/utils"
import type { DemoUser, DemoUserRole, DemoUserStatus } from "../types"

const helper = createColumnHelper<DemoUser>()

const ROLE_META: Record<
  DemoUserRole,
  {
    label: string
    className: string
  }
> = {
  super_admin: {
    label: "超级管理员",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  employee: {
    label: "普通员工",
    className: "border-info/20 bg-info-subtle text-info-on-subtle",
  },
  partner: {
    label: "外部伙伴",
    className: "border-warning/20 bg-warning-subtle text-warning-on-subtle",
  },
}

const STATUS_META: Record<
  DemoUserStatus,
  {
    label: string
    dotClassName: string
    textClassName: string
    containerClassName: string
  }
> = {
  active: {
    label: "激活",
    dotClassName: "bg-success",
    textClassName: "text-success",
    containerClassName: "border-success/20 bg-success-subtle",
  },
  disabled: {
    label: "禁用",
    dotClassName: "bg-muted-foreground",
    textClassName: "text-muted-foreground",
    containerClassName: "border-border/50 bg-muted/40",
  },
  locked: {
    label: "锁定",
    dotClassName: "bg-error",
    textClassName: "text-error",
    containerClassName: "border-error/20 bg-error-subtle",
  },
}

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return dateTimeFormatter.format(date)
}

function UserInfoCell({ user }: { user: DemoUser }) {
  const fallback = user.name.slice(0, 1)

  return (
    <div className="flex items-center gap-3">
      <Avatar className="rounded-xl">
        <AvatarFallback className="rounded-xl font-medium">{fallback}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <BaseLink
          to={`/example/users/${user.id}/edit`}
          className="block truncate font-medium text-foreground hover:underline"
        >
          {user.name}
        </BaseLink>
        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
      </div>
    </div>
  )
}

function RoleBadge({ role }: { role: DemoUserRole }) {
  const meta = ROLE_META[role]
  return (
    <Badge variant="outline" className={cn("border", meta.className)}>
      {meta.label}
    </Badge>
  )
}

function StatusPill({ status }: { status: DemoUserStatus }) {
  const meta = STATUS_META[status]
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs font-medium",
        meta.containerClassName,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", meta.dotClassName)} aria-hidden />
      <span className={meta.textClassName}>{meta.label}</span>
    </div>
  )
}

function RowActions({ user }: { user: DemoUser }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
        <BaseLink to={`/example/users/${user.id}/edit`}>
          <Pencil className="h-4 w-4" />
        </BaseLink>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="h-8 w-8" aria-label="更多操作">
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="text-xs text-muted-foreground">{user.id}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <BaseLink to={`/example/users/${user.id}/reset-password`}>
              <KeyRound className="h-4 w-4" />
              重置密码
            </BaseLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const demoUserTableColumns: ColumnDef<DemoUser, never>[] = [
  helper.select(),
  helper.accessor("name", {
    header: ({ column }) => <SortableHeader column={column} label="用户" />,
    cell: ({ row }) => <UserInfoCell user={row.original} />,
    enableSorting: true,
    size: 260,
    minSize: 220,
    meta: {
      headerLabel: "用户",
    },
  }),
  helper.accessor("role", {
    header: ({ column }) => <SortableHeader column={column} label="角色" />,
    cell: ({ row }) => <RoleBadge role={row.original.role} />,
    enableSorting: true,
    size: 140,
    minSize: 120,
    meta: {
      headerLabel: "角色",
    },
  }),
  helper.accessor("department", {
    header: ({ column }) => <SortableHeader column={column} label="部门" />,
    cell: ({ row }) => row.original.department,
    enableSorting: true,
    size: 140,
    minSize: 120,
    meta: {
      headerLabel: "部门",
    },
  }),
  helper.accessor("phone", {
    header: "手机号",
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.phone}</span>,
    size: 140,
    minSize: 120,
    meta: {
      headerLabel: "手机号",
    },
  }),
  helper.accessor("riskScore", {
    header: ({ column }) => <SortableHeader column={column} label="风险分" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.riskScore}</span>,
    enableSorting: true,
    size: 110,
    minSize: 100,
    meta: {
      headerLabel: "风险分",
    },
  }),
  helper.accessor("createdAt", {
    header: ({ column }) => <SortableHeader column={column} label="创建时间" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(row.original.createdAt)}
      </span>
    ),
    enableSorting: true,
    size: 180,
    minSize: 160,
    meta: {
      headerLabel: "创建时间",
    },
  }),
  helper.accessor("lastLoginAt", {
    header: ({ column }) => <SortableHeader column={column} label="最后登录" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(row.original.lastLoginAt)}
      </span>
    ),
    enableSorting: true,
    size: 180,
    minSize: 160,
    meta: {
      headerLabel: "最后登录",
    },
  }),
  helper.accessor("status", {
    header: ({ column }) => <SortableHeader column={column} label="状态" />,
    cell: ({ row }) => <StatusPill status={row.original.status} />,
    enableSorting: true,
    size: 120,
    minSize: 110,
    meta: {
      headerLabel: "状态",
    },
  }),
  helper.actions((row) => <RowActions user={row.original} />),
]
