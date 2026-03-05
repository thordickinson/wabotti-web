
import { NextResponse } from 'next/server';
import { prisma } from '@/src/server/db/client';
import { add, sub, startOfMinute } from 'date-fns';
import { sendBookingReminderEmail } from '@/src/lib/mail/mailer';

// Force dynamic to prevent caching of this route
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // 1. Get all active reminder configs
        const configs = await prisma.reminderConfig.findMany({
            where: { isActive: true },
            include: { company: true }
        });

        const results = [];
        const now = startOfMinute(new Date());

        for (const config of configs) {
            // 2. Calculate target window
            // We want to find bookings that are happening 'timeValue' 'timeUnit' from now.
            // E.g. If config is "24 hours before", we look for bookings starting around (now + 24h).

            let targetDate = new Date(now);

            if (config.timeUnit === 'MINUTES') {
                targetDate = add(now, { minutes: config.timeValue });
            } else if (config.timeUnit === 'HOURS') {
                targetDate = add(now, { hours: config.timeValue });
            } else if (config.timeUnit === 'DAYS') {
                targetDate = add(now, { days: config.timeValue });
            }

            // Define a window (e.g. +/- 10 minutes) to catch bookings
            // Assuming this cron runs every 10-15 minutes.
            // Let's look for bookings starting between [targetDate, targetDate + 15m]
            // Wait, if we run every 15 mins, we should look back 15 mins too.
            // Best approach: targetDate is the LOOK AHEAD time.
            // We want bookings where startTime matches targetDate with some tolerance.

            // Let's assume CRON runs every 10 minutes.
            // We look for bookings in range [targetDate, targetDate + 15m] to be safe?
            // Or strictly [targetDate, targetDate + 10m]?

            // To allow for some flexibility, let's look at [targetDate, targetDate + 20 minutes]
            // And ensure we haven't sent it yet.
            const windowEnd = add(targetDate, { minutes: 20 });

            const bookings = await prisma.booking.findMany({
                where: {
                    companyId: config.companyId,
                    status: 'CONFIRMED',
                    startTime: {
                        gte: targetDate,
                        lte: windowEnd
                    },
                    reminderLogs: {
                        none: {
                            reminderConfigId: config.id,
                            status: 'SUCCESS'
                        }
                    }
                },
                include: {
                    service: true,
                    resource: true,
                    company: true
                }
            });

            for (const booking of bookings) {
                if (config.channel === 'EMAIL' && booking.customerEmail) {
                    try {
                        const { customerName, customerEmail, startTime, service, resource, company } = booking;

                        // Construct URLs
                        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
                        const host = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'wabotti.com';
                        const siteHost = company.customDomain || `${company.slug}.${host}`;

                        const rescheduleUrl = booking.rescheduleToken
                            ? `${protocol}://${siteHost}/reschedule?token=${booking.rescheduleToken}`
                            : undefined;

                        const cancelUrl = booking.cancellationToken
                            ? `${protocol}://${siteHost}/cancel?token=${booking.cancellationToken}`
                            : undefined;

                        const confirmUrl = booking.confirmationToken
                            ? `${protocol}://${siteHost}/confirm-booking?token=${booking.confirmationToken}`
                            : undefined;


                        await sendBookingReminderEmail({
                            to: customerEmail,
                            customerName: customerName,
                            companyName: company.name,
                            serviceName: service.name,
                            date: startTime,
                            providerName: resource.name,
                            rescheduleUrl,
                            cancelUrl,
                            confirmUrl
                        });

                        await prisma.bookingReminderLog.create({
                            data: {
                                bookingId: booking.id,
                                reminderConfigId: config.id,
                                channel: 'EMAIL',
                                status: 'SUCCESS'
                            }
                        });

                        results.push({ bookingId: booking.id, status: 'sent', configId: config.id });
                    } catch (error: any) {
                        console.error(`Failed to send reminder for booking ${booking.id}`, error);
                        await prisma.bookingReminderLog.create({
                            data: {
                                bookingId: booking.id,
                                reminderConfigId: config.id,
                                channel: 'EMAIL',
                                status: 'FAILED',
                                error: error.message
                            }
                        });
                        results.push({ bookingId: booking.id, status: 'failed', error: error.message });
                    }
                }
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });
    } catch (error: any) {
        console.error('Reminder Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
