export const DEMO_INVOICE_STATUSES = ["active", "paused", "archived"] as const
export const DEMO_INVOICE_OWNERS = ["Avery", "Jordan", "Casey", "Riley", "Morgan"] as const

export const demoCurrencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
})

export type DemoInvoiceStatus = (typeof DEMO_INVOICE_STATUSES)[number]

export interface DemoInvoiceRow {
	id: string
	name: string
	owner: string
	status: DemoInvoiceStatus
	amount: number
	updatedAt: string
}

export interface DemoInvoiceResponse {
	rows: DemoInvoiceRow[]
	total: number
	pageCount: number
}

export type DemoNumberRange = { min?: number | null | undefined; max?: number | null | undefined }
export type DemoDateRange = { from?: Date | null | undefined; to?: Date | null | undefined }

export const DEMO_INVOICE_ROWS = createDemoInvoiceRows(137)

export function createDemoInvoiceRows(count: number): DemoInvoiceRow[] {
	const rows: DemoInvoiceRow[] = []

	for (let index = 0; index < count; index += 1) {
		const id = String(index + 1).padStart(4, "0")
		rows.push({
			id: `INV-${id}`,
			name: `Invoice ${id}`,
			owner: DEMO_INVOICE_OWNERS[index % DEMO_INVOICE_OWNERS.length] ?? "Unknown",
			status: DEMO_INVOICE_STATUSES[index % DEMO_INVOICE_STATUSES.length] ?? "active",
			amount: 1200 + ((index * 37) % 9000),
			updatedAt: new Date(Date.UTC(2024, 0, 1 + index)).toISOString(),
		})
	}

	return rows
}

export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

export function filterDemoInvoiceRows(
	rows: DemoInvoiceRow[],
	filters: {
		q?: string | null
		status?: string | null
		owner?: string | null
		amountRange?: DemoNumberRange | null
		updatedAtRange?: DemoDateRange | null
		highValue?: boolean | null
		highValueThreshold?: number
	},
): DemoInvoiceRow[] {
	if (filters.status === "empty") return []

	let next = rows

	const status = filters.status
	if (status && status !== "all") {
		next = next.filter((row) => row.status === status)
	}

	const owner = filters.owner
	if (owner && owner.trim() !== "") {
		next = next.filter((row) => row.owner === owner)
	}

	const amountRange = filters.amountRange
	if (amountRange) {
		const min = typeof amountRange.min === "number" ? amountRange.min : null
		const max = typeof amountRange.max === "number" ? amountRange.max : null
		if (min != null) {
			next = next.filter((row) => row.amount >= min)
		}
		if (max != null) {
			next = next.filter((row) => row.amount <= max)
		}
	}

	const updatedAtRange = filters.updatedAtRange
	if (updatedAtRange) {
		const from = updatedAtRange.from instanceof Date ? updatedAtRange.from : null
		const to = updatedAtRange.to instanceof Date ? updatedAtRange.to : null
		if (from || to) {
			next = next.filter((row) => {
				const rowDate = new Date(row.updatedAt)
				if (Number.isNaN(rowDate.getTime())) return false
				if (from && rowDate < from) return false
				if (to && rowDate > to) return false
				return true
			})
		}
	}

	const threshold = filters.highValueThreshold ?? 5000
	if (filters.highValue === true) {
		next = next.filter((row) => row.amount >= threshold)
	} else if (filters.highValue === false) {
		next = next.filter((row) => row.amount < threshold)
	}

	const query = (filters.q ?? "").trim().toLowerCase()
	if (!query) return next

	return next.filter((row) => {
		return (
			row.id.toLowerCase().includes(query) ||
			row.name.toLowerCase().includes(query) ||
			row.owner.toLowerCase().includes(query)
		)
	})
}

type SortableField = "id" | "name" | "owner" | "amount" | "status" | "updatedAt"

function isSortableField(value: string): value is SortableField {
	return (
		value === "id" ||
		value === "name" ||
		value === "owner" ||
		value === "amount" ||
		value === "status" ||
		value === "updatedAt"
	)
}

function compareValues(left: string | number, right: string | number): number {
	if (typeof left === "number" && typeof right === "number") {
		return left - right
	}
	return String(left).localeCompare(String(right))
}

export function sortDemoInvoiceRows(
	rows: DemoInvoiceRow[],
	sort: { field: string; order: "asc" | "desc" }[],
): DemoInvoiceRow[] {
	if (sort.length === 0) return rows
	const sorted = [...rows]

	sorted.sort((left, right) => {
		for (const item of sort) {
			if (!isSortableField(item.field)) continue
			const direction = item.order === "asc" ? 1 : -1
			const result = compareValues(left[item.field], right[item.field])
			if (result !== 0) return result * direction
		}
		return 0
	})

	return sorted
}

export function paginateDemoRows(
	rows: DemoInvoiceRow[],
	page: number,
	size: number,
): DemoInvoiceResponse {
	const safeSize = Math.max(1, size || 10)
	const safePage = Math.max(1, page || 1)
	const total = rows.length
	const pageCount = total === 0 ? 0 : Math.ceil(total / safeSize)
	const start = (safePage - 1) * safeSize
	const paged = rows.slice(start, start + safeSize)

	return {
		rows: paged,
		total,
		pageCount,
	}
}
