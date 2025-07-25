export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  // Base HTML structure for all professional emails
  private static getBaseHtml(title: string, preheader: string, contentHtml: string, siteUrl: string): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <!-- Preheader Text -->
        <div style="display: none; max-height: 0px; overflow: hidden;">
            ${preheader}
        </div>
        <style>
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
                background-color: #f7f7f7;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            }
            .header {
                background-color: #10B981; /* Emerald Green */
                color: #ffffff;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 30px;
                font-weight: bold;
                letter-spacing: -0.5px;
            }
            .content {
                padding: 30px;
                text-align: center;
            }
            .content p {
                margin-bottom: 18px;
                font-size: 17px;
                color: #444444;
            }
            .button-container {
                margin: 35px 0;
            }
            .button {
                display: inline-block;
                background-color: #2563EB; /* Vibrant Blue */
                color: #ffffff;
                padding: 16px 35px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 19px;
                transition: background-color 0.3s ease;
                box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
            }
            .button:hover {
                background-color: #1D4ED8;
            }
            .troubleshoot {
                font-size: 14px;
                color: #777777;
                margin-top: 25px;
                border-top: 1px solid #eeeeee;
                padding-top: 20px;
            }
            .troubleshoot a {
                color: #2563EB;
                text-decoration: none;
            }
            .footer {
                background-color: #e9e9e9;
                padding: 25px;
                text-align: center;
                font-size: 13px;
                color: #666666;
                border-top: 1px solid #e0e0e0;
            }
            .footer p {
                margin: 7px 0;
            }
            .footer a {
                color: #2563EB;
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }
            @media (max-width: 600px) {
                .container {
                    margin: 10px;
                    border-radius: 0;
                }
                .header, .content, .footer {
                    padding: 20px;
                }
                .header h1 {
                    font-size: 26px;
                }
                .button {
                    padding: 14px 30px;
                    font-size: 17px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${title.includes("Pradera") ? title : `Pradera - ${title}`}</h1>
            </div>
            
            <div class="content">
                ${contentHtml}
            </div>
            
            <div class="footer">
                <p>Este correo fue enviado por Pradera.</p>
                <p>Visita nuestro sitio web: <a href="${siteUrl}">${siteUrl}</a></p>
                <p>¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@pradera.com">soporte@pradera.com</a></p>
                <p>&copy; 2025 Pradera. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `
  }

  // Template para email de bienvenida
  static getWelcomeEmailTemplate(userEmail: string, userName: string): EmailTemplate {
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pradera.com"
    const contentHtml = `
        <p>¡Hola ${userName}!</p>
        <p>Nos complace darte la bienvenida a nuestra plataforma de productos agrícolas y veterinarios, Pradera. Tu cuenta ha sido creada exitosamente y ya puedes comenzar a explorar nuestro catálogo.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 6px;">
                <div style="font-size: 24px; margin-bottom: 8px;">🌱</div>
                <h4>Productos Agrícolas</h4>
                <p style="font-size: 14px; color: #666;">Semillas, fertilizantes y herramientas de calidad</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 6px;">
                <div style="font-size: 24px; margin-bottom: 8px;">🐄</div>
                <h4>Productos Veterinarios</h4>
                <p style="font-size: 14px; color: #666;">Medicamentos y suplementos para animales</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 6px;">
                <div style="font-size: 24px; margin-bottom: 8px;">🚚</div>
                <h4>Envío a Todo el País</h4>
                <p style="font-size: 14px; color: #666;">Entrega rápida y segura a tu puerta</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 6px;">
                <div style="font-size: 24px; margin-bottom: 8px;">💳</div>
                <h4>Pagos Seguros</h4>
                <p style="font-size: 14px; color: #666;">Múltiples métodos de pago disponibles</p>
            </div>
        </div>
        
        <p><strong>¿Qué puedes hacer ahora?</strong></p>
        <ul style="text-align: left; max-width: 400px; margin: 0 auto 20px; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Explorar nuestro catálogo de productos</li>
            <li style="margin-bottom: 8px;">Agregar productos a tu lista de favoritos</li>
            <li style="margin-bottom: 8px;">Realizar tu primera compra</li>
            <li>Completar tu perfil para una mejor experiencia</li>
        </ul>
        
        <div class="button-container">
            <a href="${siteUrl}" class="button">
                Comenzar a Comprar en Pradera
            </a>
        </div>
        
        <p style="font-size: 15px; color: #666666; margin-top: 30px;">
            Si tienes alguna pregunta, no dudes en contactarnos.
        </p>
    `

    const text = `
    ¡Bienvenido a Pradera, ${userName}!
    
    Nos complace darte la bienvenida a nuestra plataforma de productos agrícolas y veterinarios.
    Tu cuenta ha sido creada exitosamente y ya puedes comenzar a explorar nuestro catálogo.
    
    ¿Qué puedes hacer ahora?
    - Explorar nuestro catálogo de productos
    - Agregar productos a tu lista de favoritos
    - Realizar tu primera compra
    - Completar tu perfil para una mejor experiencia
    
    Visita: ${siteUrl}
    
    ¿Necesitas ayuda?
    Email: soporte@pradera.com
    WhatsApp: +51 930 104 083
    
    © 2025 Pradera. Todos los derechos reservados.
    `

    return {
      to: userEmail,
      subject: "¡Bienvenido a Pradera! Tu cuenta ha sido creada exitosamente",
      html: this.getBaseHtml("¡Bienvenido a Pradera!", "¡Tu aventura en Pradera comienza ahora!", contentHtml, siteUrl),
      text,
    }
  }

  // Template para email de recuperación de contraseña
  static getPasswordResetEmailTemplate(userEmail: string, resetUrl: string): EmailTemplate {
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pradera.com"
    const contentHtml = `
        <p>¡Hola!</p>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Pradera.</p>
        <p>Para crear una nueva contraseña, por favor haz clic en el botón de abajo:</p>
        
        <div class="button-container">
            <a href="${resetUrl}" class="button">
                Restablecer Contraseña
            </a>
        </div>
        
        <p class="troubleshoot">
            Si tienes problemas para hacer clic en el botón, copia y pega el siguiente enlace en tu navegador: <br>
            <a href="${resetUrl}" style="word-break: break-all;">${resetUrl}</a>
        </p>
        
        <p style="font-size: 15px; color: #666666; margin-top: 30px;">
            Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo electrónico. Tu contraseña actual permanecerá sin cambios.
        </p>
    `

    const text = `
    Restablecimiento de Contraseña - Pradera
    
    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
    
    Si fuiste tú quien solicitó este cambio, usa el siguiente enlace para crear una nueva contraseña:
    ${resetUrl}
    
    IMPORTANTE:
    - Este enlace expirará en 1 hora
    - Solo puede ser usado una vez
    - Si no solicitaste este cambio, ignora este email
    
    Consejos de Seguridad:
    - Usa una contraseña de al menos 8 caracteres
    - Combina letras, números y símbolos
    - No uses información personal
    - No reutilices contraseñas de otras cuentas
    
    ¿Necesitas ayuda?
    Email: soporte@pradera.com
    WhatsApp: +51 930 104 083
    
    © 2025 Pradera. Todos los derechos reservados.
    `

    return {
      to: userEmail,
      subject: "🔐 Restablece tu contraseña de Pradera",
      html: this.getBaseHtml(
        "Restablece tu Contraseña de Pradera",
        "Solicitud de restablecimiento de contraseña para tu cuenta de Pradera.",
        contentHtml,
        siteUrl,
      ),
      text,
    }
  }

  // Enviar email usando Supabase Edge Functions (si está configurado)
  static async sendEmail(template: EmailTemplate): Promise<{ success: boolean; error?: string }> {
    try {
      // Aquí puedes integrar con un servicio de email como:
      // - Supabase Edge Functions
      // - Resend
      // - SendGrid
      // - Nodemailer

      console.log("📧 Enviando email:", {
        to: template.to,
        subject: template.subject,
      })

      // Por ahora, solo logueamos el email (en producción integrarías con un servicio real)
      console.log("Email HTML:", template.html)

      // Simular envío exitoso
      return { success: true }
    } catch (error) {
      console.error("❌ Error enviando email:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }
    }
  }

  // Enviar email de bienvenida
  static async sendWelcomeEmail(userEmail: string, userName: string) {
    const template = this.getWelcomeEmailTemplate(userEmail, userName)
    return this.sendEmail(template)
  }

  // Enviar email de recuperación de contraseña
  static async sendPasswordResetEmail(userEmail: string, resetUrl: string) {
    const template = this.getPasswordResetEmailTemplate(userEmail, resetUrl)
    return this.sendEmail(template)
  }
}
