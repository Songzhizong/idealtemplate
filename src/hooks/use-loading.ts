import { useCallback, useState } from "react"

/**
 * Hook for managing loading state
 */
export function useLoading(initialValue = false) {
	const [loading, setLoading] = useState(initialValue)

	const startLoading = useCallback(() => {
		setLoading(true)
	}, [])

	const endLoading = useCallback(() => {
		setLoading(false)
	}, [])

	return {
		loading,
		setLoading,
		startLoading,
		endLoading,
	}
}
