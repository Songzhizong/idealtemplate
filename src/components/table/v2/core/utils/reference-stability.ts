import { useCallback, useRef } from "react"

export function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  if (a === b) return true
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (!Object.hasOwn(b, key)) return false
    if (!Object.is(a[key], b[key])) return false
  }
  return true
}

export function useStableCallback<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  return useCallback((...args: TArgs) => callbackRef.current(...args), [])
}

export function useStableObject<T extends object>(value: T): T {
  const valueRef = useRef(value)
  if (
    !shallowEqual(valueRef.current as Record<string, unknown>, value as Record<string, unknown>)
  ) {
    valueRef.current = value
  }
  return valueRef.current
}
