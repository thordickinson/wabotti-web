import Handlebars from 'handlebars';

/**
 * Base layout for all emails
 */
export const BASE_LAYOUT = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #0f172a; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 20px auto; padding: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .header { text-align: center; padding: 30px 20px; background-color: {{brandingColor}}; color: #ffffff; }
        .clinic-logo { max-height: 60px; margin-bottom: 10px; }
        .clinic-name { font-size: 20px; font-weight: bold; margin: 0; color: #ffffff; text-decoration: none; }
        .content { padding: 40px 30px; }
        .footer { text-align: center; font-size: 12px; color: #64748b; padding: 30px 20px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; }
        .button { background: {{brandingColor}}; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 25px 0; }
        .info-box { background: #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e2e8f0; }
        .info-item { margin: 8px 0; }
        .powered-by { margin-top: 15px; font-size: 11px; opacity: 0.8; }
        .powered-by a { color: #471ca8; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            {{#if companyLogo}}
                <img src="{{companyLogo}}" alt="{{companyName}}" class="clinic-logo">
            {{else}}
                <div class="clinic-name">{{companyName}}</div>
            {{/if}}
        </div>
        <div class="content">
            {{{body}}}
        </div>
        <div class="footer">
            <p>&copy; {{year}} {{companyName}}. Todos los derechos reservados.</p>
            <div class="powered-by">
                Powered by <a href="https://wabotti.com">Wabotti</a>
            </div>
        </div>
    </div>
</body>
</html>
`;

/**
 * Booking Confirmation Template
 */
export const BOOKING_CONFIRMATION = `
    <h1>Confirma tu cita</h1>
    <p>Hola <strong>{{customerName}}</strong>,</p>
    <p>Has solicitado una cita en <strong>{{companyName}}</strong>:</p>
    
    <div class="info-box">
        <p class="info-item"><strong>Servicio:</strong> {{serviceName}}</p>
        <p class="info-item"><strong>Fecha:</strong> {{formattedDate}}</p>
    </div>
    
    <p>Para asegurar tu espacio, por favor confirma tu asistencia haciendo click en el siguiente botón:</p>
    
    <div style="text-align: center;">
        <a href="{{confirmationUrl}}" class="button">Confirmar mi Cita</a>
    </div>

    {{#if rescheduleUrl}}
    <div style="text-align: center; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 14px; color: #64748b;">¿Necesitas hacer cambios?</p>
        <div style="display: flex; gap: 15px; justify-content: center; align-items: center;">
            <a href="{{rescheduleUrl}}" style="color: {{brandingColor}}; font-weight: bold; text-decoration: none;">Reagendar</a>
            <span style="color: #cbd5e1;">|</span>
            <a href="{{cancelUrl}}" style="color: #ef4444; font-weight: bold; text-decoration: none; font-size: 14px;">Cancelar Cita</a>
        </div>
    </div>
    {{/if}}
    
    <p>Si no has solicitado esta cita, puedes ignorar este correo.</p>
`;

/**
 * Booking Success Template (Confirmed)
 */
export const BOOKING_SUCCESS = `
    <h1>¡Tu cita está confirmada!</h1>
    <p>Hola <strong>{{customerName}}</strong>,</p>
    <p>Tu cita en <strong>{{companyName}}</strong> ha sido agendada con éxito.</p>
    
    <div class="info-box">
        <p class="info-item"><strong>Servicio:</strong> {{serviceName}}</p>
        <p class="info-item"><strong>Fecha:</strong> {{formattedDate}}</p>
    </div>
    
    <p>Hemos adjuntado una invitación de calendario a este correo para que puedas agregarla fácilmente a tu agenda.</p>
    
    {{#if rescheduleUrl}}
    <div style="text-align: center; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 14px; color: #64748b;">¿Necesitas hacer cambios?</p>
        <div style="display: flex; gap: 15px; justify-content: center; align-items: center;">
            <a href="{{rescheduleUrl}}" style="color: {{brandingColor}}; font-weight: bold; text-decoration: none;">Reagendar</a>
            <span style="color: #cbd5e1;">|</span>
            <a href="{{cancelUrl}}" style="color: #ef4444; font-weight: bold; text-decoration: none; font-size: 14px;">Cancelar Cita</a>
        </div>
    </div>
    {{/if}}
    
    <p>¡Te esperamos!</p>
`;

/**
 * Booking Rescheduled Template
 */
export const BOOKING_RESCHEDULED = `
    <h1>¡Tu cita ha sido reprogramada!</h1>
    <p>Hola <strong>{{customerName}}</strong>,</p>
    <p>Te informamos que tu cita en <strong>{{companyName}}</strong> ha sido reprogramada exitosamente.</p>
    
    <div class="info-box">
        <p class="info-item"><strong>Servicio:</strong> {{serviceName}}</p>
        <p class="info-item"><strong>Nueva Fecha:</strong> {{formattedDate}}</p>
    </div>
    
    <p>Hemos adjuntado una nueva invitación de calendario actualizada a este correo.</p>
    
    {{#if rescheduleUrl}}
    <div style="text-align: center; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 14px; color: #64748b;">¿Necesitas hacer cambios?</p>
        <div style="display: flex; gap: 15px; justify-content: center; align-items: center;">
            <a href="{{rescheduleUrl}}" style="color: {{brandingColor}}; font-weight: bold; text-decoration: none;">Reagendar</a>
            <span style="color: #cbd5e1;">|</span>
            <a href="{{cancelUrl}}" style="color: #ef4444; font-weight: bold; text-decoration: none; font-size: 14px;">Cancelar Cita</a>
        </div>
    </div>
    {{/if}}
    
    <p>¡Te esperamos en el nuevo horario!</p>
`;

/**
 * Booking Reminder Template
 */
export const BOOKING_REMINDER = `
    <h1>Recordatorio de Cita</h1>
    <p>Hola <strong>{{customerName}}</strong>,</p>
    <p>Este es un recordatorio amigable de tu cita en <strong>{{companyName}}</strong>:</p>
    
    <div class="info-box">
        <p class="info-item"><strong>Servicio:</strong> {{serviceName}}</p>
        <p class="info-item"><strong>Profesional:</strong> {{providerName}}</p>
        <p class="info-item"><strong>Fecha:</strong> {{formattedDate}}</p>
    </div>
    
    <p>Por favor, confirma que asistirás a tu cita:</p>
    
    <div style="text-align: center;">
        {{#if confirmUrl}}
        <a href="{{confirmUrl}}" class="button">Sí, Asistiré</a>
        {{/if}}
    </div>

    <div style="text-align: center; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 14px; color: #64748b;">¿Cambio de planes?</p>
        <div style="display: flex; gap: 15px; justify-content: center; align-items: center;">
            {{#if rescheduleUrl}}
            <a href="{{rescheduleUrl}}" style="color: {{brandingColor}}; font-weight: bold; text-decoration: none;">Reagendar</a>
            <span style="color: #cbd5e1;">|</span>
            {{/if}}
            {{#if cancelUrl}}
            <a href="{{cancelUrl}}" style="color: #ef4444; font-weight: bold; text-decoration: none; font-size: 14px;">Cancelar Cita</a>
            {{/if}}
        </div>
    </div>
`;

/**
 * Registry of templates
 */
export const EmailTemplates = {
    BOOKING_CONFIRMATION: {
        subject: 'Confirma tu cita en {{companyName}}',
        body: BOOKING_CONFIRMATION
    },
    BOOKING_SUCCESS: {
        subject: '¡Cita confirmada! {{serviceName}} en {{companyName}}',
        body: BOOKING_SUCCESS
    },
    BOOKING_RESCHEDULED: {
        subject: 'Cita reprogramada: {{serviceName}} en {{companyName}}',
        body: BOOKING_RESCHEDULED
    },
    BOOKING_REMINDER: {
        subject: 'Recordatorio: Tu cita en {{companyName}}',
        body: BOOKING_REMINDER
    }
} as const;


export type TemplateName = keyof typeof EmailTemplates;
