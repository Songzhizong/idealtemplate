
import { createContext, useContext } from "react"
import type { UserProfile } from "@/types/auth"

export interface LogoutResult {
    logoutIframeUris: string[]
}

export interface AuthContextType {
    isAuthenticated: boolean
    user: UserProfile | null
    isLoadingUser: boolean
    refetchUser: () => void
    logout: () => Promise<LogoutResult>
    isLoggingOut: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider")
    }
    return context
}
