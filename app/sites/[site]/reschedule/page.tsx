import { prisma } from '@/src/server/db/client';
import RescheduleWizard from '@/src/components/site/booking/RescheduleWizard';
import { notFound } from 'next/navigation';

export default async function ReschedulePage(
    props: {
        params: Promise<{ site: string }>,
        searchParams: Promise<{ token?: string }>
    }
) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const domain = decodeURIComponent(params.site);
    const token = typeof searchParams.token === 'string' ? searchParams.token : undefined;

    if (!token) return notFound();

    // Resolve Company
    let company;
    const isLocal = domain.includes("localhost");

    if (isLocal) {
        const slug = domain.split(".")[0];
        company = await prisma.company.findUnique({ where: { slug } });
    } else {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "wabotti.com";
        if (domain.endsWith(`.${rootDomain}`)) {
            const slug = domain.replace(`.${rootDomain}`, "");
            company = await prisma.company.findUnique({ where: { slug } });
        } else {
            company = await prisma.company.findUnique({ where: { customDomain: domain } });
        }
    }

    if (!company) return notFound();

    return (
        <div className="light min-h-screen bg-slate-50 py-12">
            <RescheduleWizard
                token={token}
                companySlug={company.slug}
            />
        </div>
    );
}
