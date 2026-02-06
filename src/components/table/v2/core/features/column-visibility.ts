import type { OnChangeFn, VisibilityState } from "@tanstack/react-table"
import { useEffect, useMemo, useState } from "react"
import {
  applyPreferenceMigrations,
  createJsonLocalStoragePreferenceStorage,
  mergeRecordPreference,
  shallowEqual,
  useStableCallback,
  useStableObject,
} from "@/components/table/v2"
import type {
  ColumnVisibilityFeatureOptions,
  DataTableActions,
  DataTableActivity,
  DataTableFeatureRuntime,
  PreferenceEnvelope,
} from "../types"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseVisibilityRecord(value: unknown): Record<string, boolean> | null {
  if (!isRecord(value)) return null
  const next: Record<string, boolean> = {}
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== "boolean") continue
    next[key] = item
  }
  return next
}

export function useColumnVisibilityFeature<TData, TFilterSchema>(args: {
  feature: ColumnVisibilityFeatureOptions | undefined
  columnIds: string[]
}): {
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)
  const storageKey = args.feature?.storageKey ?? ""
  const schemaVersion = args.feature?.schemaVersion ?? 1

  const defaults = useMemo<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {}
    const overrides = args.feature?.defaultVisible
    for (const columnId of args.columnIds) {
      next[columnId] = overrides?.[columnId] ?? true
    }
    return next
  }, [args.columnIds, args.feature?.defaultVisible])

  const storage = useMemo(() => {
    if (!enabled) return args.feature?.storage
    if (args.feature?.storage) return args.feature.storage
    return createJsonLocalStoragePreferenceStorage<Record<string, boolean>>({
      schemaVersion,
      parse: parseVisibilityRecord,
    })
  }, [enabled, args.feature?.storage, schemaVersion])

  const [preferencesReady, setPreferencesReady] = useState(
    () => !enabled || Boolean(storage?.getSync),
  )

  const [envelope, setEnvelope] = useState<PreferenceEnvelope<Record<string, boolean>> | null>(
    () => {
      if (!enabled) return null
      if (!storage?.getSync) return null
      return storage.getSync(storageKey)
    },
  )

  useEffect(() => {
    if (!enabled) return
    if (!storage) return
    if (storage.getSync) {
      setPreferencesReady(true)
      setEnvelope(storage.getSync(storageKey))
      return
    }

    let cancelled = false
    setPreferencesReady(false)
    void storage
      .get(storageKey)
      .then((value) => {
        if (cancelled) return
        setEnvelope(value)
        setPreferencesReady(true)
      })
      .catch(() => {
        if (cancelled) return
        setEnvelope(null)
        setPreferencesReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [enabled, storageKey, storage])

  const mergedVisibility = useMemo<VisibilityState>(() => {
    if (!enabled) return {}
    const stored = envelope?.value ?? null
    const migratedEnvelope = envelope
      ? applyPreferenceMigrations({
          envelope,
          schemaVersion,
          ctx: { columnIds: args.columnIds },
          ...(args.feature?.migrate ? { migrate: args.feature.migrate } : {}),
        })
      : null
    return mergeRecordPreference({
      stored: migratedEnvelope?.value ?? stored,
      defaults,
      ctx: { columnIds: args.columnIds },
    })
  }, [enabled, envelope, schemaVersion, args.columnIds, args.feature?.migrate, defaults])

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => mergedVisibility)

  useEffect(() => {
    if (!enabled) return
    setColumnVisibility((prev) =>
      shallowEqual(prev as Record<string, unknown>, mergedVisibility as Record<string, unknown>)
        ? prev
        : mergedVisibility,
    )
  }, [enabled, mergedVisibility])

  const persist = useStableCallback(async (nextVisibility: VisibilityState) => {
    if (!enabled) return
    if (!storage) return
    const merged = mergeRecordPreference({
      stored: nextVisibility,
      defaults,
      ctx: { columnIds: args.columnIds },
    })
    const nextEnvelope: PreferenceEnvelope<Record<string, boolean>> = {
      schemaVersion,
      updatedAt: Date.now(),
      value: merged,
    }
    setEnvelope(nextEnvelope)
    await storage.set(storageKey, nextEnvelope)
  })

  const onColumnVisibilityChange: OnChangeFn<VisibilityState> = useStableCallback((updater) => {
    if (!enabled) return
    setColumnVisibility((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      void persist(next)
      return next
    })
  })

  const resetColumnVisibility = useStableCallback(() => {
    if (!enabled) return
    setColumnVisibility(defaults)
    setEnvelope(null)
    if (!storage) return
    if (storage.remove) {
      void storage.remove(storageKey)
      return
    }
    void persist(defaults)
  })

  const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject({
    patchTableOptions: () => {
      if (!enabled) return {}
      return {
        state: {
          columnVisibility,
        },
        onColumnVisibilityChange,
      }
    },
    patchActions: (_actions: DataTableActions) => {
      if (!enabled) return {}
      return {
        resetColumnVisibility,
      }
    },
    patchActivity: (activity: DataTableActivity) => {
      if (!enabled) return {}
      return {
        preferencesReady: activity.preferencesReady && preferencesReady,
      }
    },
    onReset: () => {
      if (!enabled) return
      resetColumnVisibility()
    },
  })

  return { runtime }
}
