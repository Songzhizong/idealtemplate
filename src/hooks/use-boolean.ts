import { useCallback, useState } from "react"

/**
 * Hook for managing boolean state with helper functions
 */
export function useBoolean(initialValue = false) {
	const [value, setValue] = useState(initialValue)

	const setTrue = useCallback(() => {
		setValue(true)
	}, [])

	const setFalse = useCallback(() => {
		setValue(false)
	}, [])

	const toggle = useCallback(() => {
		setValue((prev) => !prev)
	}, [])

	const setValueStable = useCallback((newValue: boolean | ((prev: boolean) => boolean)) => {
		setValue(newValue)
	}, [])

	return {
		value,
		setValue: setValueStable,
		setTrue,
		setFalse,
		toggle,
	}
}
