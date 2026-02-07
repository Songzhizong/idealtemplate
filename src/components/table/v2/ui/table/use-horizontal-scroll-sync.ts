import { type Dispatch, type RefObject, type SetStateAction, useEffect } from "react"

interface UseHorizontalScrollSyncArgs {
  useSplitHeaderBody: boolean
  useRootSplitHeaderBody: boolean
  useWindowSplitHeaderBody: boolean
  wrapperRef: RefObject<HTMLDivElement | null>
  splitHeaderScrollRef: RefObject<HTMLDivElement | null>
  splitBodyViewportRef: RefObject<HTMLDivElement | null>
  syncRafRef: RefObject<number | null>
  syncingTargetRef: RefObject<"header" | "body" | null>
  setScrollEdges: Dispatch<SetStateAction<{ left: boolean; right: boolean }>>
}

export function useHorizontalScrollSync({
  useSplitHeaderBody,
  useRootSplitHeaderBody,
  useWindowSplitHeaderBody,
  wrapperRef,
  splitHeaderScrollRef,
  splitBodyViewportRef,
  syncRafRef,
  syncingTargetRef,
  setScrollEdges,
}: UseHorizontalScrollSyncArgs) {
  useEffect(() => {
    const defaultScrollElement = wrapperRef.current?.querySelector<HTMLDivElement>(
      '[data-slot="table-container"]',
    )
    const headerScrollElement = useSplitHeaderBody ? splitHeaderScrollRef.current : null
    const bodyHorizontalScrollElement = useRootSplitHeaderBody
      ? splitBodyViewportRef.current
      : defaultScrollElement

    if (!bodyHorizontalScrollElement) return

    const updateEdges = () => {
      const left = bodyHorizontalScrollElement.scrollLeft > 0
      const right =
        bodyHorizontalScrollElement.scrollLeft + bodyHorizontalScrollElement.clientWidth <
        Math.max(0, bodyHorizontalScrollElement.scrollWidth - 1)
      setScrollEdges((prev) =>
        prev.left === left && prev.right === right ? prev : { left, right },
      )
    }

    const syncHeaderScroll = () => {
      if (!headerScrollElement) return
      if (headerScrollElement.scrollLeft !== bodyHorizontalScrollElement.scrollLeft) {
        headerScrollElement.scrollLeft = bodyHorizontalScrollElement.scrollLeft
      }
    }

    const handleBodyHorizontalScroll = () => {
      if (syncingTargetRef.current === "body") {
        syncingTargetRef.current = null
        updateEdges()
        return
      }

      if (!headerScrollElement) {
        updateEdges()
        return
      }

      if (syncRafRef.current != null) {
        cancelAnimationFrame(syncRafRef.current)
      }
      syncRafRef.current = requestAnimationFrame(() => {
        if (
          Math.abs(headerScrollElement.scrollLeft - bodyHorizontalScrollElement.scrollLeft) > 0.5
        ) {
          syncingTargetRef.current = "header"
          headerScrollElement.scrollLeft = bodyHorizontalScrollElement.scrollLeft
        }
        updateEdges()
        syncRafRef.current = null
      })
    }

    const handleHeaderHorizontalScroll = () => {
      if (!headerScrollElement) return

      if (syncingTargetRef.current === "header") {
        syncingTargetRef.current = null
        return
      }

      if (syncRafRef.current != null) {
        cancelAnimationFrame(syncRafRef.current)
      }
      syncRafRef.current = requestAnimationFrame(() => {
        if (
          Math.abs(bodyHorizontalScrollElement.scrollLeft - headerScrollElement.scrollLeft) > 0.5
        ) {
          syncingTargetRef.current = "body"
          bodyHorizontalScrollElement.scrollLeft = headerScrollElement.scrollLeft
        }
        updateEdges()
        syncRafRef.current = null
      })
    }

    const handleHeaderWheel = (event: WheelEvent) => {
      const deltaX = event.deltaX !== 0 ? event.deltaX : event.shiftKey ? event.deltaY : 0
      if (Math.abs(deltaX) < 0.5) return
      event.preventDefault()
      bodyHorizontalScrollElement.scrollLeft += deltaX
    }

    updateEdges()
    syncHeaderScroll()

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            updateEdges()
            syncHeaderScroll()
          })

    if (resizeObserver) {
      resizeObserver.observe(bodyHorizontalScrollElement)
      const bodyContent = bodyHorizontalScrollElement.firstElementChild
      if (bodyContent) {
        resizeObserver.observe(bodyContent)
      }
    }

    const handleResize = () => {
      updateEdges()
      syncHeaderScroll()
    }

    bodyHorizontalScrollElement.addEventListener("scroll", handleBodyHorizontalScroll, {
      passive: true,
    })
    headerScrollElement?.addEventListener("scroll", handleHeaderHorizontalScroll, {
      passive: true,
    })
    if (useWindowSplitHeaderBody && headerScrollElement) {
      headerScrollElement.addEventListener("wheel", handleHeaderWheel, {
        passive: false,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => {
      if (syncRafRef.current != null) {
        cancelAnimationFrame(syncRafRef.current)
        syncRafRef.current = null
      }
      bodyHorizontalScrollElement.removeEventListener("scroll", handleBodyHorizontalScroll)
      headerScrollElement?.removeEventListener("scroll", handleHeaderHorizontalScroll)
      if (useWindowSplitHeaderBody && headerScrollElement) {
        headerScrollElement.removeEventListener("wheel", handleHeaderWheel)
      }
      window.removeEventListener("resize", handleResize)
      resizeObserver?.disconnect()
    }
  }, [
    setScrollEdges,
    splitBodyViewportRef,
    splitHeaderScrollRef,
    syncRafRef,
    syncingTargetRef,
    useRootSplitHeaderBody,
    useSplitHeaderBody,
    useWindowSplitHeaderBody,
    wrapperRef,
  ])
}
