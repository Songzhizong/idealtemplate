/**
 * Auth Feature - Barrel Export (Public API)
 *
 * 这是 Auth 模块的公共入口，类似于一个 NPM 包的 index.ts
 * 其他模块应该从这里导入，而不是直接访问内部文件
 */

// ============================================
// API Hooks (Public API)
// ============================================
export { useUserProfile } from "@/features/auth/api/get-current-user.ts"
export { useLogout } from "@/features/auth/api/logout.ts"
// ============================================
// Hooks (Public API)
// ============================================
export { useLogoutHandler } from "@/hooks/use-logout-handler"
// ============================================
// Stores (Public API)
// ============================================
export { authStore, useAuthStore } from "@/lib/auth-store"
// ============================================
// Types & Schemas (Public API)
// ============================================
export type { Permission, UserProfile as User } from "@/types/auth"
export { PermissionSchema, UserProfileSchema as UserSchema } from "@/types/auth"
export {
	type CheckCaptchaRequest,
	CheckCaptchaRequestSchema,
	type CheckCaptchaResponse,
	useCheckCaptcha,
} from "./api/check-captcha"
export { type PermissionIdents, usePermissions } from "./api/get-permissions"
export {
	type ChangePasswordLoginRequest,
	// Change Password
	ChangePasswordLoginRequestSchema,
	type ChangePasswordTicket,
	FactorType,
	type LoginResponse,
	// Response Types & Schemas
	LoginResponseSchema,
	LoginResponseType,
	type MfaTicket,
	type MultifactorLoginRequest,
	MultifactorLoginRequestSchema,
	type PasswordLoginRequest,
	// Password Login
	PasswordLoginRequestSchema,
	type SelectAccountRequest,
	// Account Selection
	SelectAccountRequestSchema,
	type SelectAccountTicket,
	type SelectableAccount,
	type SendSmsCodeRequest,
	// SMS Login
	SendSmsCodeRequestSchema,
	type SmsCodeLoginRequest,
	SmsCodeLoginRequestSchema,
	useChangePasswordLogin,
	useMultifactorLogin,
	usePasswordLogin,
	useSelectAccount,
	useSendMfaEmailCode,
	// Multifactor Authentication
	useSendMfaSmsCode,
	useSendSmsLoginCode,
	useSmsCodeLogin,
	type VisibleToken,
} from "./api/login"
// ============================================
// Components (Public API)
// ============================================
export { LoginPage } from "./components/login-page"
export { PermissionGuard } from "./components/permission-guard"
export { useLoginHandler } from "./hooks/use-login-handler"
export type { AuthResponse } from "./types"
export { AuthResponseSchema } from "./types"

// ============================================
// Utils (Public API)
// ============================================
export { getCertificate } from "./utils/certificate"
export { showUnauthorizedDialog } from "./utils/show-unauthorized-dialog"
export { createDebouncedUnauthorizedHandler } from "./utils/unauthorized-handler"
