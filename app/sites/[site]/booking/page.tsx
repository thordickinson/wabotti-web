import { prisma } from '@/src/server/db/client';
import BookingWizard from '@/src/components/site/booking/BookingWizard';
import { notFound } from 'next/navigation';

export default async function BookingPage(
    props: {
        params: Promise<{ site: string }>,
        searchParams: Promise<{ serviceId?: string, resourceId?: string, callbackUrl?: string }>
    }
) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const domain = decodeURIComponent(params.site);

    // Resolve Company (Logic copied from route.ts for consistency)
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
            <BookingWizard
                companySlug={company.slug}
                preselectedServiceId={searchParams.serviceId}
                preselectedResourceId={searchParams.resourceId}
                callbackUrl={searchParams.callbackUrl}
            />
        </div>
    );
}
