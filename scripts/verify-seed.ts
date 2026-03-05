
import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://wabotti:wabotti@127.0.0.1:5433/wabotti?sslmode=disable",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verify() {
    console.log('🔍 Verifying Seed Data...');

    // 1. Check User and Company
    const user = await prisma.user.findFirst({
        where: { email: 'sofia@clinica-aurora.com' },
        include: {
            memberships: {
                include: {
                    company: {
                        include: {
                            services: true,
                            resources: {
                                include: {
                                    availability: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!user) {
        console.error('❌ User sofia@clinica-aurora.com not found');
        return;
    }

    console.log(`✅ User found: ${user.name} (${user.email})`);

    const membership = user.memberships[0];
    if (!membership || !membership.company) {
        console.error('❌ User has no company membership');
        return;
    }

    const company = membership.company;
    console.log(`✅ Company found: ${company.name} (${company.slug})`);

    // 2. Check Company "Page" (Site Settings)
    if (company.siteSettings) {
        const settings = company.siteSettings as any;
        console.log('✅ Company has siteSettings (Page content)');
        // Check for hero, services, etc
        if (settings.home) console.log('   - Home page configured');
        if (settings.services) console.log('   - Services page configured');
        if (settings.contact) console.log('   - Contact page configured');
    } else {
        console.error('❌ Company has no siteSettings');
    }

    // 3. Check Services
    if (company.services.length > 0) {
        console.log(`✅ Company has ${company.services.length} services:`);
        company.services.forEach(s => console.log(`   - ${s.name} (${s.duration} min)`));
    } else {
        console.error('❌ Company has no services');
    }

    // 4. Check Professionals and Availability
    const professionals = company.resources.filter(r => r.type === 'PROFESSIONAL');
    if (professionals.length > 0) {
        console.log(`✅ Company has ${professionals.length} professionals:`);
        professionals.forEach(p => {
            console.log(`   - ${p.name}`);
            if (p.availability.length > 0) {
                console.log(`     ✅ Has ${p.availability.length} availability records`);
                p.availability.forEach(a => {
                    console.log(`        • Day ${a.dayOfWeek}: ${a.startTime} - ${a.endTime}`);
                });
            } else {
                console.error(`     ❌ No availability configured`);
            }
        });
    } else {
        console.error('❌ Company has no professionals');
    }
}

verify()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
