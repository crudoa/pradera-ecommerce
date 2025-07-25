const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}

export class PasswordValidator {
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    const PASSWORD_REQUIREMENTS = passwordRequirements

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.minLength} caracteres`)
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra mayúscula")
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.push("La contraseña debe contener al menos una letra minúscula")
    }

    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      errors.push("La contraseña debe contener al menos un número")
    }

    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("La contraseña debe contener al menos un carácter especial")
    }

    // Verificar contraseñas comunes
    const commonPasswords = [
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
    ]

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("Esta contraseña es muy común, elige una más segura")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static async hash(password: string): Promise<string> {
    const bcrypt = await import("bcryptjs")
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import("bcryptjs")
    return bcrypt.compare(password, hash)
  }

  static generateSecurePassword(length = 16): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

    const allChars = uppercase + lowercase + numbers + symbols
    let password = ""

    // Asegurar al menos un carácter de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]

    // Completar el resto
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Mezclar caracteres
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("")
  }
}
