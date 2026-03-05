import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://wabotti:wabotti@127.0.0.1:5433/wabotti?sslmode=disable" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const services = await prisma.service.findMany({
        include: { webPage: true }
    });

    console.log(`Found ${services.length} services.`);

    for (const s of services) {
        console.log("---------------------------------------------------");
        console.log(`Service: ${s.name}`);
        console.log(`Slug: ${s.slug}`);
        const faqs = s.webPage?.faqs;
        if (faqs && Array.isArray(faqs) && faqs.length > 0) {
            console.log(`✅ FAQs Found (${faqs.length}):`);
            faqs.forEach((f: any) => console.log(`   - Q: ${f.question}`));
        } else {
            console.log("❌ No FAQs found.");
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
