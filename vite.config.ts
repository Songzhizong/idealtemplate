import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-vite-plugin"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
	// 加载环境变量
	const env = loadEnv(mode, process.cwd(), "")
	// 从环境变量读取后端地址，如果没有配置则使用默认值
	const backendUrl = env.VITE_API_BASE_URL || "http://localhost:5678"
	const baseUrl = env.VITE_BASE_URL || "/"

	return {
		base: baseUrl,
		plugins: [tanstackRouter(), react(), tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		server: {
			host: true,
			proxy: {
				"/nexus-api": {
					target: backendUrl,
					changeOrigin: true,
					secure: false,
				},
			},
		},
		test: {
			environment: "jsdom",
			globals: true,
			setupFiles: "./src/test/setup.ts",
		},
	}
})
