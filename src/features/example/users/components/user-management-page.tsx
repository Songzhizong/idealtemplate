import { Activity, AlertTriangle, Download, Plus, RefreshCw, UserPlus, Users } from "lucide-react"
import { useCallback, useMemo } from "react"
import { PageContainer } from "@/components/common/page-container"
import type { FilterDefinition } from "@/components/table/v2"
import {
  DataTableActiveFilters,
  DataTablePagination,
  DataTableRoot,
  DataTableSearch,
  DataTableSelectionBar,
  DataTableTable,
  DataTableToolbar,
  DataTableViewOptions,
  remote,
  stateInternal,
  useDataTable,
} from "@/components/table/v2"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/features/dashboard/components/stats-card"
import { useBaseNavigate } from "@/hooks/use-base-navigate"
import { DEMO_USERS, fetchDemoUsers } from "../demo/users"
import {
  DEMO_USER_DEPARTMENTS,
  DEMO_USER_ROLES,
  DEMO_USER_STATUSES,
  type DemoUser,
  type DemoUserFilters,
} from "../types"
import { demoUserTableColumns } from "./user-table-columns"

const ROLE_LABEL: Record<(typeof DEMO_USER_ROLES)[number], string> = {
  super_admin: "超级管理员",
  employee: "普通员工",
  partner: "外部伙伴",
}

const STATUS_LABEL: Record<(typeof DEMO_USER_STATUSES)[number], string> = {
  active: "激活",
  disabled: "禁用",
  locked: "锁定",
}

function buildCsvCell(value: string): string {
  const normalized = value.replaceAll('"', '""')
  return `"${normalized}"`
}

function downloadCsv(args: { filename: string; rows: string[][] }) {
  const csv = args.rows.map((row) => row.map(buildCsvCell).join(",")).join("\n")
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = args.filename
  link.click()
  URL.revokeObjectURL(url)
}

export function UserManagementPage() {
  const navigate = useBaseNavigate()

  const state = stateInternal<DemoUserFilters>({
    initial: {
      page: 1,
      size: 10,
      sort: [],
      filters: {
        q: "",
        nameKeyword: "",
        status: null,
        role: null,
        department: null,
        isOnline: null,
        riskScoreRange: null,
        createdAtDate: null,
        lastLoginRange: null,
      },
    },
  })

  const dataSource = useMemo(() => {
    return remote<DemoUser, DemoUserFilters, Awaited<ReturnType<typeof fetchDemoUsers>>>({
      queryKey: ["example-users-management-v2"],
      queryFn: fetchDemoUsers,
      map: (response) => response,
    })
  }, [])

  const dt = useDataTable<DemoUser, DemoUserFilters>({
    columns: demoUserTableColumns,
    dataSource,
    state,
    getRowId: (row) => row.id,
    features: {
      selection: {
        enabled: true,
        mode: "page",
      },
      columnVisibility: {
        enabled: true,
        storageKey: "example_users_v2_visibility",
      },
      columnSizing: {
        enabled: true,
        storageKey: "example_users_v2_sizing",
      },
      density: {
        enabled: true,
        storageKey: "example_users_v2_density",
        default: "comfortable",
      },
      pinning: {
        enabled: true,
        left: ["__select__", "name"],
        right: ["__actions__"],
      },
    },
  })

  const filterDefinitions = useMemo<
    Array<FilterDefinition<DemoUserFilters, keyof DemoUserFilters>>
  >(() => {
    return [
      {
        key: "nameKeyword",
        label: "姓名",
        type: "text",
        placeholder: "输入姓名关键字后回车",
        defaultVisible: true,
      },
      {
        key: "status",
        label: "状态",
        type: "select",
        placeholder: "全部",
        options: DEMO_USER_STATUSES.map((status) => ({
          label: STATUS_LABEL[status],
          value: status,
        })),
        alwaysVisible: true,
      },
      {
        key: "role",
        label: "角色",
        type: "select",
        placeholder: "全部",
        options: DEMO_USER_ROLES.map((role) => ({
          label: ROLE_LABEL[role],
          value: role,
        })),
        defaultVisible: true,
      },
      {
        key: "department",
        label: "部门",
        type: "select",
        placeholder: "全部",
        options: DEMO_USER_DEPARTMENTS.map((department) => ({
          label: department,
          value: department,
        })),
        defaultVisible: true,
      },
      {
        key: "isOnline",
        label: "在线状态",
        type: "boolean",
        defaultVisible: true,
      },
      {
        key: "riskScoreRange",
        label: "风险分区间",
        type: "number-range",
        defaultVisible: true,
      },
      {
        key: "createdAtDate",
        label: "创建日期",
        type: "date",
      },
      {
        key: "lastLoginRange",
        label: "最近登录区间",
        type: "date-range",
      },
    ]
  }, [])

  const activeFilterDefinitions = useMemo<
    Array<FilterDefinition<DemoUserFilters, keyof DemoUserFilters>>
  >(() => {
    return [
      {
        key: "q",
        label: "搜索",
        type: "text",
      },
      ...filterDefinitions,
    ]
  }, [filterDefinitions])

  const metrics = useMemo(() => {
    const totalUsers = DEMO_USERS.length
    const onlineUsers = DEMO_USERS.filter((user) => user.isOnline).length
    const lockedUsers = DEMO_USERS.filter((user) => user.status === "locked").length
    const disabledUsers = DEMO_USERS.filter((user) => user.status === "disabled").length
    const abnormalUsers = lockedUsers + disabledUsers

    const now = Date.now()
    const weekStart = now - 7 * 24 * 60 * 60 * 1000
    const newThisWeek = DEMO_USERS.filter((user) => {
      const time = Date.parse(user.createdAt)
      return Number.isFinite(time) && time >= weekStart
    }).length

    return [
      {
        title: "总用户数",
        value: totalUsers.toLocaleString(),
        hint: "系统注册用户总数",
        icon: Users,
        accentClass: "text-info bg-info-subtle border-info/20",
      },
      {
        title: "当前在线",
        value: onlineUsers.toLocaleString(),
        hint: "模拟在线状态（mock）",
        icon: Activity,
        accentClass: "text-success bg-success-subtle border-success/20",
      },
      {
        title: "本周新增",
        value: newThisWeek.toLocaleString(),
        hint: "最近 7 天创建的用户",
        icon: UserPlus,
        accentClass: "text-primary bg-primary/10 border-primary/20",
      },
      {
        title: "异常账号",
        value: abnormalUsers.toLocaleString(),
        hint: "锁定 + 禁用（mock）",
        icon: AlertTriangle,
        accentClass: "text-error bg-error-subtle border-error/20",
      },
    ]
  }, [])

  const handleCreate = useCallback(() => {
    void navigate({ to: "/example/users/new" })
  }, [navigate])

  const handleExportCurrentPage = useCallback(() => {
    const rows = dt.table.getRowModel().rows.map((row) => row.original)
    const filename = `users_page_${dt.pagination.page}_size_${dt.pagination.size}.csv`
    downloadCsv({
      filename,
      rows: [
        ["ID", "姓名", "邮箱", "手机号", "风险分", "角色", "部门", "状态", "创建时间", "最后登录"],
        ...rows.map((user) => [
          user.id,
          user.name,
          user.email,
          user.phone,
          String(user.riskScore),
          ROLE_LABEL[user.role],
          user.department,
          STATUS_LABEL[user.status],
          user.createdAt,
          user.lastLoginAt,
        ]),
      ],
    })
  }, [dt.pagination.page, dt.pagination.size, dt.table])

  const handleExportSelectedCurrentPage = useCallback((selectedRowsCurrentPage: DemoUser[]) => {
    if (selectedRowsCurrentPage.length === 0) return
    const filename = `users_selected_${selectedRowsCurrentPage.length}.csv`
    downloadCsv({
      filename,
      rows: [
        ["ID", "姓名", "邮箱", "手机号", "风险分", "角色", "部门", "状态", "创建时间", "最后登录"],
        ...selectedRowsCurrentPage.map((user) => [
          user.id,
          user.name,
          user.email,
          user.phone,
          String(user.riskScore),
          ROLE_LABEL[user.role],
          user.department,
          STATUS_LABEL[user.status],
          user.createdAt,
          user.lastLoginAt,
        ]),
      ],
    })
  }, [])

  return (
    <PageContainer className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">用户管理</h1>
          <p className="text-sm text-muted-foreground">
            用于验证 DataTable V2 的高级筛选能力（布尔、数值区间、日期、日期区间）。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleExportCurrentPage}
          >
            <Download className="h-4 w-4" />
            导出当前页 CSV
          </Button>
          <Button type="button" className="gap-2" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            新增用户
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatsCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            hint={metric.hint}
            icon={metric.icon}
            accentClass={metric.accentClass}
          />
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>用户列表（Table V2）</CardTitle>
          <CardDescription>
            内置 220 条 mock
            用户数据，支持高级条件组合筛选（在线状态、风险分、创建日期、登录区间）。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <DataTableRoot
            dt={dt}
            layout={{ stickyHeader: true, stickyPagination: true }}
            className="rounded-md border border-border/50"
          >
            <DataTableToolbar
              actions={
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="h-8 w-8"
                    onClick={() => dt.actions.refetch()}
                    aria-label="刷新"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <DataTableViewOptions />
                </div>
              }
            >
              <DataTableSearch<DemoUserFilters>
                mode="advanced"
                placeholder="输入关键字按回车，或选择字段后添加条件（布尔/区间/日期）"
                advancedFields={filterDefinitions}
              />
            </DataTableToolbar>

            <DataTableActiveFilters
              filters={activeFilterDefinitions}
              className="border-b border-border/50 bg-muted/20 px-3 py-3"
            />

            <DataTableTable<DemoUser> renderEmpty={() => "暂无匹配用户"} />

            <DataTableSelectionBar<DemoUser>
              actions={({ selectedRowsCurrentPage }) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2"
                  onClick={() => handleExportSelectedCurrentPage(selectedRowsCurrentPage)}
                >
                  <Download className="h-4 w-4" />
                  导出已选（当前页）
                </Button>
              )}
            />

            <DataTablePagination />
          </DataTableRoot>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
