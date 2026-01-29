/**
 * Auth Feature - Barrel Export (Public API)
 *
 * 这是 Auth 模块的公共入口，类似于一个 NPM 包的 index.ts
 * 其他模块应该从这里导入，而不是直接访问内部文件
 */

export {
	type CheckCaptchaRequest,
	CheckCaptchaRequestSchema,
	type CheckCaptchaResponse,
	useCheckCaptcha,
} from "./api/check-captcha"
// ============================================
// API Hooks (Public API)
// ============================================
export { useUserProfile } from "@/lib/auth-api/get-current-user"
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
export { useLogout } from "@/lib/auth-api/logout"

// ============================================
// Components (Public API)
// ============================================
export { LoginPage } from "./components/login-page"
export { PermissionGuard } from "./components/permission-guard"

// ============================================
// Hooks (Public API)
// ============================================
export { useAuth } from "@/hooks/use-auth"
export { useLoginHandler } from "./hooks/use-login-handler"
export { useLogoutHandler } from "@/hooks/use-logout-handler"

// ============================================
// Stores (Public API)
// ============================================
export { useAuthStore, authStore } from "@/lib/auth-store"

// ============================================
// Types & Schemas (Public API)
// ============================================
export type { Permission, UserProfile as User } from "@/types/auth"
export { PermissionSchema, UserProfileSchema as UserSchema } from "@/types/auth"
export type { AuthResponse } from "./types"
export { AuthResponseSchema } from "./types"

// ============================================
// Utils (Public API)
// ============================================
export { getCertificate } from "./utils/certificate"
