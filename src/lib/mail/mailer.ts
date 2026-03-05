import { EmailService } from './email-service';
import { createEvent, EventAttributes } from 'ics';

/**
 * Specifically for booking confirmations (Verification step)
 */
export async function sendBookingConfirmationEmail({
    customerEmail,
    customerName,
    companyName,
    serviceName,
    startTime,
    confirmationUrl,
    rescheduleUrl,
    cancelUrl,
    companyLogo,
    brandingColor,
}: {
    customerEmail: string;
    customerName: string;
    companyName: string;
    serviceName: string;
    startTime: Date;
    confirmationUrl: string;
    rescheduleUrl?: string;
    cancelUrl?: string;
    companyLogo?: string | null;
    brandingColor?: string | null;
}) {
    const formattedDate = new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'full',
        timeStyle: 'short'
    }).format(startTime);

    return EmailService.send({
        to: customerEmail,
        template: 'BOOKING_CONFIRMATION',
        data: {
            customerName,
            companyName,
            serviceName,
            formattedDate,
            confirmationUrl,
            rescheduleUrl,
            cancelUrl,
            companyLogo,
            brandingColor,
        }
    });
}

/**
 * For confirmed bookings (Success) - Includes Calendar Invite
 */
export async function sendBookingSuccessEmail({
    customerEmail,
    customerName,
    companyName,
    serviceName,
    startTime,
    durationInMinutes,
    rescheduleUrl,
    cancelUrl,
    companyLogo,
    brandingColor,
}: {
    customerEmail: string;
    customerName: string;
    companyName: string;
    serviceName: string;
    startTime: Date;
    durationInMinutes: number;
    rescheduleUrl?: string;
    cancelUrl?: string;
    companyLogo?: string | null;
    brandingColor?: string | null;
}) {
    const formattedDate = new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'full',
        timeStyle: 'short'
    }).format(startTime);

    // Generate ICS content
    const date = new Date(startTime);
    const event: EventAttributes = {
        start: [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes()
        ],
        duration: { minutes: durationInMinutes },
        title: `${serviceName} - ${companyName}`,
        description: `Cita agendada para ${customerName} en ${companyName}. Servicio: ${serviceName}.`,
        location: companyName, // Could be more specific if we had the location address
        organizer: { name: companyName, email: 'noreply@wabotti.com' },
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
    };

    const { error, value } = createEvent(event);
    const attachments = [];

    if (!error && value) {
        attachments.push({
            filename: 'invitacion-cita.ics',
            content: value,
            contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        });
    } else {
        console.error('Failed to generate ICS:', error);
    }

    return EmailService.send({
        to: customerEmail,
        template: 'BOOKING_SUCCESS',
        data: {
            customerName,
            companyName,
            serviceName,
            formattedDate,
            rescheduleUrl,
            cancelUrl,
            companyLogo,
            brandingColor,
        },
        attachments
    });
}

/**
 * For rescheduled bookings - Includes Updated Calendar Invite
 */
export async function sendBookingRescheduledEmail({
    customerEmail,
    customerName,
    companyName,
    serviceName,
    startTime,
    durationInMinutes,
    rescheduleUrl,
    companyLogo,
    brandingColor,
}: {
    customerEmail: string;
    customerName: string;
    companyName: string;
    serviceName: string;
    startTime: Date;
    durationInMinutes: number;
    rescheduleUrl?: string;
    companyLogo?: string | null;
    brandingColor?: string | null;
}) {
    const formattedDate = new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'full',
        timeStyle: 'short'
    }).format(startTime);

    // Generate ICS content
    const date = new Date(startTime);
    const event: EventAttributes = {
        start: [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
            date.getHours(),
            date.getMinutes()
        ],
        duration: { minutes: durationInMinutes },
        title: `${serviceName} - ${companyName} (Reagendada)`,
        description: `Cita reprogramada para ${customerName} en ${companyName}. Servicio: ${serviceName}.`,
        location: companyName,
        organizer: { name: companyName, email: 'noreply@wabotti.com' },
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        sequence: 1 // Increment sequence for updates (simplified approach)
    };

    const { error, value } = createEvent(event);
    const attachments = [];

    if (!error && value) {
        attachments.push({
            filename: 'cita-reprogramada.ics',
            content: value,
            contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        });
    } else {
        console.error('Failed to generate ICS:', error);
    }

    return EmailService.send({
        to: customerEmail,
        template: 'BOOKING_RESCHEDULED',
        data: {
            customerName,
            companyName,
            serviceName,
            formattedDate,
            rescheduleUrl,
            companyLogo,
            brandingColor,
        },
        attachments
    });
}

/**
 * Send Booking Reminder
 */
export async function sendBookingReminderEmail({
    to,
    customerName,
    companyName,
    serviceName,
    date,
    providerName,
    confirmUrl,
    rescheduleUrl,
    cancelUrl,
    companyLogo,
    brandingColor
}: {
    to: string;
    customerName: string;
    companyName: string;
    serviceName: string;
    date: Date;
    providerName: string;
    confirmUrl?: string;
    rescheduleUrl?: string;
    cancelUrl?: string;
    companyLogo?: string | null;
    brandingColor?: string | null;
}) {
    const formattedDate = new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'full',
        timeStyle: 'short'
    }).format(date);

    return EmailService.send({
        to,
        template: 'BOOKING_REMINDER',
        data: {
            customerName,
            companyName,
            serviceName,
            providerName,
            formattedDate,
            confirmUrl,
            rescheduleUrl,
            cancelUrl,
            companyLogo,
            brandingColor
        }
    });
}
