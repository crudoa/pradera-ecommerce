export const AUTH_CONFIG = {
  // Configuración de sesiones
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 horas
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutos antes de expirar
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos

  // Configuración de contraseñas
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Configuración de 2FA
  TWO_FACTOR_ENABLED: true,
  BACKUP_CODES_COUNT: 10,

  // URLs de redirección
  REDIRECT_URLS: {
    LOGIN_SUCCESS: "/dashboard",
    LOGIN_REQUIRED: "/login",
    LOGOUT_SUCCESS: "/",
    EMAIL_VERIFICATION: "/verify-email",
    PASSWORD_RESET: "/reset-password",
  },

  // Configuración de cookies
  COOKIE_CONFIG: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    httpOnly: true,
    maxAge: 24 * 60 * 60, // 24 horas
  },
}
