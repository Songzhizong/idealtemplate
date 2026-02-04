import { readFileSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"
import { loadEnv } from "vite"

const projectRoot = process.cwd()
const distDir = path.join(projectRoot, "dist")
const templatePath = path.join(projectRoot, "404.html")
const outputPath = path.join(distDir, "404.html")

if (!existsSync(distDir)) {
	throw new Error("dist 目录不存在，请先执行构建。")
}

if (!existsSync(templatePath)) {
	throw new Error("404.html 模板不存在，请在项目根目录创建 404.html。")
}

const mode =
	process.argv[2] ||
	process.env.VITE_ENV_MODE ||
	process.env.MODE ||
	process.env.NODE_ENV ||
	"production"

const env = loadEnv(mode, projectRoot, "")
const rawBaseUrl = env.VITE_BASE_URL || process.env.VITE_BASE_URL || "/"
const normalizedBaseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl : `${rawBaseUrl}/`

const template = readFileSync(templatePath, "utf8")
const content = template.replaceAll("%BASE_URL%", normalizedBaseUrl)

writeFileSync(outputPath, content, "utf8")
