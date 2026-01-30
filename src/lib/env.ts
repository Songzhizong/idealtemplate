import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_API_BASE_URL: z.string(),
		VITE_ENABLE_MOCK: z.string().optional(),
		VITE_AUTH_CLIENT_ID: z.string(),
		VITE_APP_ID: z.string(),
		VITE_DEFAULT_USERNAME: z.string().optional(),
		VITE_DEFAULT_PASSWORD: z.string().optional(),
		VITE_IS_STATIC_ADMIN: z.string().optional(),
	},
	runtimeEnv: {
		VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
		VITE_ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK,
		VITE_AUTH_CLIENT_ID: import.meta.env.VITE_AUTH_CLIENT_ID,
		VITE_APP_ID: import.meta.env.VITE_APP_ID,
		VITE_DEFAULT_USERNAME: import.meta.env.VITE_DEFAULT_USERNAME,
		VITE_DEFAULT_PASSWORD: import.meta.env.VITE_DEFAULT_PASSWORD,
		VITE_IS_STATIC_ADMIN: import.meta.env.VITE_IS_STATIC_ADMIN,
	},
})
