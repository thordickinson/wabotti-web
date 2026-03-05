import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime";
import { marked } from "marked";
import { prisma } from "@/src/server/db/client";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ site: string; path?: string[] }> }
) {
    const params = await props.params;
    const domain = decodeURIComponent(params.site);
    const pathSegments = params.path || [];
    const urlPath = pathSegments.join("/");

    // Skip this handler for API routes - let them be handled by their own route handlers
    if (urlPath.startsWith('api/')) {
        return new NextResponse('Not Found', { status: 404 });
    }

    // 1. Resolve Tenant
    // Define include object to reuse
    const companyInclude = {
        siteTemplate: true,
        branding: true,
        locations: true,
        resources: {
            where: {
                type: 'PROFESSIONAL',
                status: 'ACTIVE'
            },
            select: {
                id: true,
                name: true,
                description: true,
                image: true,
                bio: true
            }
        },
        services: {
            where: { isPublic: true },
            include: { webPage: true, resources: true },
            orderBy: { sortOrder: 'asc' }
        },
        testimonials: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        }
    };

    let company: any;
    const isLocal = domain.includes("localhost");

    if (isLocal) {
        const slug = domain.split(".")[0];
        company = await prisma.company.findUnique({
            where: { slug },
            include: companyInclude as any
        });
    } else {
        const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "wabotti.com";
        if (domain.endsWith(`.${rootDomain}`)) {
            const slug = domain.replace(`.${rootDomain}`, "");
            company = await prisma.company.findUnique({
                where: { slug },
                include: companyInclude as any
            });
        } else {
            company = await prisma.company.findUnique({
                where: { customDomain: domain },
                include: companyInclude as any
            });
        }
    }


    if (!company) {
        const slug = isLocal ? domain.split(".")[0] : "prod";
        return new NextResponse(`Site not found for domain: ${domain}, extracted slug: ${slug}`, { status: 404 });
    }

    if (!company.siteTemplate) {
        return new NextResponse("No template configured for this site", { status: 404 });
    }

    // Check Subscription Status
    const subData = (company.subscriptionData as any) || {};
    const subStatus = subData.status || 'ACTIVE';

    const isSubscriptionActive = subStatus === 'ACTIVE' || subStatus === 'TRIALING';
    if (!isSubscriptionActive && !isLocal) {
        // Logic for handling inactive subscriptions
    }

    // Strict check: if status is CANCELED or PAST_DUE
    if (subStatus === 'CANCELED' || subStatus === 'PAST_DUE') {
        const maintenancePath = path.join(process.cwd(), "public", "maintenance.html");
        if (fs.existsSync(maintenancePath)) {
            const maintenanceHtml = fs.readFileSync(maintenancePath, "utf-8");
            return new NextResponse(maintenanceHtml, {
                headers: { "Content-Type": "text/html" }
            });
        }
        return new NextResponse("Under Maintenance", { status: 503 });
    }

    // 2. Resolve File & Route Logic
    const templatePath = path.join(process.cwd(), "public", "templates", (company.siteTemplate as any).storagePath);
    const hasExtension = urlPath.includes(".");

    if (hasExtension) {
        // Asset Proxy
        const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '');
        const fullPath = path.join(templatePath, safePath);
        if (fs.existsSync(fullPath)) {
            const fileBuffer = fs.readFileSync(fullPath);
            const contentType = mime.getType(fullPath) || "application/octet-stream";
            return new NextResponse(fileBuffer, { headers: { "Content-Type": contentType } });
        } else {
            return new NextResponse("Asset not found", { status: 404 });
        }
    }

    // Page Routing
    let fileToRead = "index.html";
    let pageContext: any = {};

    // Custom Route Logic
    if (urlPath === "services") {
        // Could map to services.html if exists, otherwise index with context
        if (fs.existsSync(path.join(templatePath, "services.html"))) {
            fileToRead = "services.html";
        }
    } else if (pathSegments[0] === "services" && pathSegments[1]) {
        // Service Detail Page: /services/[slug]
        const serviceSlug = pathSegments[1];
        const service = company.services.find((s: any) => s.slug === serviceSlug);

        if (service) {
            // Always use index.html as the universal shell
            fileToRead = "index.html";
            const rawContent = service.webPage?.content || service.description || "";

            pageContext = {
                type: "service-detail",
                data: {
                    ...service,
                    htmlContent: await marked(rawContent), // Render markdown
                    webPage: service.webPage
                }
            };
        } else {
            return new NextResponse("Service not found", { status: 404 });
        }
    } else if (urlPath) {
        // Generic static pages (about, contact)
        if (fs.existsSync(path.join(templatePath, `${urlPath}.html`))) {
            fileToRead = `${urlPath}.html`;
        } else if (fs.existsSync(path.join(templatePath, urlPath, "index.html"))) {
            fileToRead = path.join(urlPath, "index.html");
        } else if (["about", "contact"].includes(urlPath)) {
            // Virtual pages that use the index shell
            fileToRead = "index.html";
        } else {
            return new NextResponse("Page not found", { status: 404 });
        }
    }

    const fullPagePath = path.join(templatePath, fileToRead);
    const htmlContent = fs.readFileSync(fullPagePath, "utf-8");

    // 3. Prepare Data
    const branding = company.branding || {
        primaryColor: "#000000",
        secondaryColor: "#ffffff",
        logoUrl: "",
    };

    const siteSettings = (company.siteSettings as any) || {};

    // Block Resolving Logic
    // Default to "home" page config for root
    let pageConfigKey = "home";
    if (urlPath === "about") pageConfigKey = "about";
    if (urlPath === "contact") pageConfigKey = "contact";
    if (urlPath === "services") pageConfigKey = "services";
    // Check if we are in a service detail context
    if (pageContext.type === "service-detail") {
        pageConfigKey = "service-detail";
    }

    let blocks = siteSettings.pages?.[pageConfigKey]?.blocks || [];

    // Variable Substitution Helper
    const replaceVariables = (text: string, context: any) => {
        if (!text || typeof text !== 'string') return text;
        let result = text;

        // Flatten context for easier access? Or just manual mapping
        const replacements: Record<string, string> = {
            '${company.name}': company.name,
            '${company.slug}': company.slug,
            '${company.phone}': siteSettings.contact?.phone || "",
            '${company.email}': siteSettings.contact?.email || "",
            '${company.address}': siteSettings.contact?.address || "",
            '${company.aboutImage}': (company as any).aboutImage || "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop", // Fallback image
        };

        if (context.type === 'service-detail' && context.data) {
            replacements['${service.id}'] = context.data.id;
            replacements['${service.name}'] = context.data.name;
            replacements['${service.description}'] = context.data.description;
            replacements['${service.shortDescription}'] = context.data.description;
            replacements['${service.longDescription}'] = context.data.htmlContent || "";
            replacements['${service.price}'] = context.data.price?.toString() || "";
            replacements['${service.duration}'] = context.data.duration?.toString() || "";
            replacements['${service.image}'] = context.data.webPage?.heroImage || "https://via.placeholder.com/1200x600";
        }

        Object.entries(replacements).forEach(([key, value]) => {
            result = result.replaceAll(key, value || "");
        });

        return result;
    };

    const deepReplace = (obj: any, context: any): any => {
        if (typeof obj === 'string') {
            if (obj === '${service.faqs}' && context.data?.webPage?.faqs) {
                return context.data.webPage.faqs;
            }
            return replaceVariables(obj, context);
        }
        if (Array.isArray(obj)) return obj.map(item => deepReplace(item, context));
        if (typeof obj === 'object' && obj !== null) {
            const newObj: any = {};
            for (const key in obj) {
                newObj[key] = deepReplace(obj[key], context);
            }
            return newObj;
        }
        return obj;
    };

    // Apply substitution to blocks
    blocks = blocks.map((block: any) => {
        return { ...block, props: deepReplace(block.props, pageContext) };
    });

    const templateData = {
        settings: siteSettings,
        blocks: blocks, // Inject processed blocks here
        company: {
            name: company.name,
            email: siteSettings.contact?.email || "contact@" + domain,
            phone: siteSettings.contact?.phone || branding.brandKeywords?.join(", ") || "",
            // Use configured hero or fallback to company name
            heroTitle: siteSettings.home?.heroTitle || company.name,
            heroDescription: siteSettings.home?.heroDescription || "Tu clínica de confianza.",
            heroImage: siteSettings.home?.heroImage,
            aboutHtml: company.description ? await marked(company.description) : "",
            social: company.socialUrls || {}, // { facebook, instagram, ... }
            branding: {
                colors: {
                    primary: branding.primaryColor,
                    secondary: branding.secondaryColor,
                },
                logo: branding.logoUrl,
            },
            locations: company.locations || [],
            resources: company.resources || [],
            services: company.services.map((s: any) => ({
                id: s.id,
                name: s.name,
                slug: s.slug,
                description: s.description,
                price: s.price,
                image: s.webPage?.heroImage
            })),
            testimonials: company.testimonials || []
        },
        context: {
            path: urlPath,
            ...pageContext
        }
    };

    // Analytics Configuration
    const analyticsConfig = {
        companyId: company.id,
        pageType: pageContext.type || 'home',
        serviceId: pageContext.type === 'service-detail' ? pageContext.data?.id : null,
        serviceName: pageContext.type === 'service-detail' ? pageContext.data?.name : null,
        gtmContainerId: siteSettings.gtmContainerId || null
    };

    // 4. Inject Scripts
    const templateDataScript = `<script>window.TEMPLATE_DATA = ${JSON.stringify(templateData)};</script>`;
    const analyticsConfigScript = `<script>window.WABOTTI_ANALYTICS = ${JSON.stringify(analyticsConfig)};</script>`;


    // Read and inline analytics script
    const analyticsScriptPath = path.join(process.cwd(), 'public', 'templates', 'default', 'analytics.js');
    let analyticsScript = '';
    if (fs.existsSync(analyticsScriptPath)) {
        const analyticsCode = fs.readFileSync(analyticsScriptPath, 'utf-8');
        analyticsScript = `<script>${analyticsCode}</script>`;
    }

    // Read and inline styles
    const stylesPath = path.join(templatePath, 'style.css');
    let stylesInjection = '';
    if (fs.existsSync(stylesPath)) {
        const stylesCode = fs.readFileSync(stylesPath, 'utf-8');
        stylesInjection = `<style>${stylesCode}</style>`;
    }

    const scriptInjection = `${templateDataScript}\n${analyticsConfigScript}\n${analyticsScript}`;
    const injection = `${stylesInjection}\n${scriptInjection}`;

    // Replace existing style link if present to avoid 404, otherwise just append
    // Standard template has <link rel="stylesheet" href="style.css">
    let finalHtmlWithStyles = htmlContent;
    if (htmlContent.includes('href="style.css"')) {
        finalHtmlWithStyles = htmlContent.replace(/<link[^>]*href="style\.css"[^>]*>/, '');
    }

    const finalHtml = finalHtmlWithStyles.replace("</head>", `${injection}</head>`);

    return new NextResponse(finalHtml, {
        headers: { "Content-Type": "text/html" }
    });
}
