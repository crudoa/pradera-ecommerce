export class TwoFactorAuth {
  static async generateSecret(email: string): Promise<string> {
    const authenticator = (await import("otplib")).authenticator
    return authenticator.generateSecret()
  }

  static async generateQRCode(email: string, secret: string): Promise<string> {
    const authenticator = (await import("otplib")).authenticator
    const QRCode = (await import("qrcode")).default
    const serviceName = "Pradera"
    const otpauth = authenticator.keyuri(email, serviceName, secret)

    return QRCode.toDataURL(otpauth)
  }

  static async verifyToken(token: string, secret: string): Promise<boolean> {
    try {
      const authenticator = (await import("otplib")).authenticator
      return authenticator.verify({ token, secret })
    } catch (error) {
      console.error("Error verifying 2FA token:", error)
      return false
    }
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = []

    for (let i = 0; i < 5; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }

    return codes
  }

  static async hashBackupCodes(codes: string[]): Promise<string[]> {
    const bcrypt = await import("bcryptjs")
    const hashedCodes: string[] = []

    for (const code of codes) {
      const hashed = await bcrypt.hash(code, 10)
      hashedCodes.push(hashed)
    }

    return hashedCodes
  }

  static async verifyBackupCode(code: string, hashedCodes: string[]): Promise<boolean> {
    const bcrypt = await import("bcryptjs")

    for (const hashedCode of hashedCodes) {
      if (await bcrypt.compare(code, hashedCode)) {
        return true
      }
    }

    return false
  }
}
