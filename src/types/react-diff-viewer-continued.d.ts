declare module "react-diff-viewer-continued" {
	import type React from "react"
	import type { ReactNode } from "react"

	export enum DiffMethod {
		CHARS = "diff-chars",
		WORDS = "diff-words",
		LINES = "diff-lines",
		SENTENCES = "diff-sentences",
		JSON = "diff-json",
	}

	export interface ReactDiffViewerProps {
		oldValue: string
		newValue: string
		splitView?: boolean
		disableWordDiff?: boolean
		compareMethod?: DiffMethod
		hideLineNumbers?: boolean
		renderContent?: (content: string) => ReactNode
		codeFoldMessageRenderer?: (totalFoldedLines: number) => ReactNode
		onLineNumberClick?: (lineId: string, event: MouseEvent) => void
		extraLinesSurroundingDiff?: number
		showDiffOnly?: boolean
		styles?: object
		useDarkTheme?: boolean
		leftTitle?: string | ReactNode
		rightTitle?: string | ReactNode
		linesOffset?: number
	}

	const ReactDiffViewer: React.FC<ReactDiffViewerProps>
	export default ReactDiffViewer
}
