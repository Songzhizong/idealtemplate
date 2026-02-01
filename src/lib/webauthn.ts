/**
 * Utility functions for WebAuthn (Passkey)
 * Handles conversion between Base64URL (used in JSON API) and ArrayBuffer (used by browser API)
 */

export const webauthnUtils = {
	/**
	 * Converts a Base64URL string to an ArrayBuffer
	 */
	base64urlToBuffer(base64url: string): ArrayBuffer {
		// Replace non-url-safe characters
		let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")

		// Add padding if missing
		const padLen = (4 - (base64.length % 4)) % 4
		base64 += "=".repeat(padLen)

		// Decode
		const binary = window.atob(base64)
		const bytes = new Uint8Array(binary.length)
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i)
		}
		return bytes.buffer
	},

	/**
	 * Converts an ArrayBuffer to a Base64URL string
	 */
	bufferToBase64url(buffer: ArrayBuffer): string {
		const bytes = new Uint8Array(buffer)
		let binary = ""
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i] as number)
		}
		const base64 = window.btoa(binary)
		return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
	},

	/**
	 * Recursively finds and converts Base64URL strings to ArrayBuffers for WebAuthn options
	 */
	parseOptions(options: unknown, parentKey?: string): unknown {
		if (typeof options !== "object" || options === null) return options

		const newOptions = (Array.isArray(options) ? [...options] : { ...options }) as Record<
			string,
			unknown
		>

		for (const key in newOptions) {
			const value = newOptions[key]

			if (typeof value === "string") {
				// Base64URL fields that should be converted to Buffer
				// Note: 'rp.id' is a string (domain), NOT a buffer, so we skip it if parent is 'rp'
				const shouldConvert =
					key === "challenge" || (key === "id" && parentKey !== "rp") || key === "userHandle"

				if (shouldConvert) {
					try {
						newOptions[key] = this.base64urlToBuffer(value)
					} catch (e) {
						// If decoding fails, keep it as string (might not be base64url)
						console.error(`[WebAuthn] Failed to decode ${key}:`, e)
					}
				}
			} else if (typeof value === "object") {
				newOptions[key] = this.parseOptions(value, key)
			}
		}

		return newOptions
	},

	/**
	 * Formats a PublicKeyCredential for the backend
	 */
	formatCredential(credential: PublicKeyCredential) {
		const response = credential.response as AuthenticatorAttestationResponse &
			AuthenticatorAssertionResponse

		const result: {
			id: string
			rawId: string
			type: string
			authenticatorAttachment: string | null
			response: {
				attestationObject?: string
				clientDataJSON?: string
				authenticatorData?: string
				signature?: string
				userHandle?: string | null
			}
			clientExtensionResults: AuthenticationExtensionsClientOutputs
		} = {
			id: credential.id,
			rawId: this.bufferToBase64url(credential.rawId),
			type: credential.type,
			authenticatorAttachment: credential.authenticatorAttachment,
			response: {},
			clientExtensionResults: credential.getClientExtensionResults(),
		}

		if (response.attestationObject) {
			result.response.attestationObject = this.bufferToBase64url(response.attestationObject)
		}
		if (response.clientDataJSON) {
			result.response.clientDataJSON = this.bufferToBase64url(response.clientDataJSON)
		}
		if (response.authenticatorData) {
			result.response.authenticatorData = this.bufferToBase64url(response.authenticatorData)
		}
		if (response.signature) {
			result.response.signature = this.bufferToBase64url(response.signature)
		}
		if (response.userHandle) {
			result.response.userHandle = this.bufferToBase64url(response.userHandle)
		}

		return result
	},
}
