"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/src/lib/trpc/client";
import { toast } from "sonner";
import { truncate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    LayoutTemplate,
    Home,
    MessageSquare,
    Contact,
    Settings,
    ArrowRight,
    ExternalLink,
    BarChart3,
    Tag,
    Facebook,
    Pencil
} from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/header";
import { TestimonialsManager } from "@/components/dashboard/site/testimonials-manager";

export default function SiteEditorPage() {
    const router = useRouter();
    const { data: company, isLoading, refetch } = trpc.company.get.useQuery();

    const updateSettingsMutation = trpc.company.update.useMutation({
        onSuccess: () => {
            toast.success("Configuración guardada");
            refetch();
        }
    });

    const utils = trpc.useUtils();
    const [gtmId, setGtmId] = useState('');
    const [fbPixelId, setFbPixelId] = useState('');
    const [fbToken, setFbToken] = useState('');

    const [gtmDialogOpen, setGtmDialogOpen] = useState(false);
    const [fbDialogOpen, setFbDialogOpen] = useState(false);

    // Initialize form values when company data loads
    useEffect(() => {
        if (company) {
            const settings = (company.siteSettings as any) || {};
            setGtmId(settings.gtmContainerId || '');
            setFbPixelId(settings.fbPixelId || '');
        }
    }, [company]);

    const updateGTM = trpc.analytics.updateGTM.useMutation({
        onSuccess: () => {
            toast.success("Google Tag Manager actualizado");
            utils.company.get.invalidate();
        },
        onError: (error) => {
            toast.error(truncate("Error al actualizar GTM: " + error.message));
        }
    });

    const updateFB = trpc.analytics.updateFacebookPixel.useMutation({
        onSuccess: () => {
            toast.success("Facebook Pixel actualizado");
            utils.company.get.invalidate();
            setFbToken(''); // Clear token after saving
        },
        onError: (error) => {
            toast.error(truncate("Error al actualizar Facebook Pixel: " + error.message));
        }
    });

    const handleSaveGTM = async () => {
        // Validate GTM ID format
        if (gtmId && !/^GTM-[A-Z0-9]+$/.test(gtmId)) {
            toast.error("Formato de GTM ID inválido. Debe ser GTM-XXXXXX");
            return;
        }
        await updateGTM.mutateAsync({ gtmContainerId: gtmId || null });
        setGtmDialogOpen(false);
    };

    const handleSaveFB = async () => {
        await updateFB.mutateAsync({
            fbPixelId: fbPixelId || null,
            fbAccessToken: fbToken || null
        });
        setFbDialogOpen(false);
    };

    if (isLoading) {
        return (
            <>
                <DashboardHeader title="Gestión del Sitio Web" />
                <div className="p-8">Cargando configuración...</div>
            </>
        );
    }

    if (!company) {
        return (
            <>
                <DashboardHeader title="Gestión del Sitio Web" />
                <div className="p-8">No se encontró la empresa.</div>
            </>
        );
    }

    const siteSettings = (company.siteSettings as any) || {};

    const handleSaveGeneral = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const analytics = {
            googleTagManagerId: formData.get("gtmId"),
            facebookPixelId: formData.get("pixelId"),
        };

        const newSettings = {
            ...siteSettings,
            analytics,
        };

        updateSettingsMutation.mutate({
            siteSettings: newSettings,
        });
    };

    const templates = [
        {
            id: "home",
            name: "Página de Inicio",
            description: "La portada de tu sitio web. Configura el hero y la bienvenida.",
            icon: Home,
            pageParam: "home"
        },
        {
            id: "service-template",
            name: "Plantilla de Servicios",
            description: "El diseño maestro para todas tus páginas de servicios individuales.",
            icon: LayoutTemplate,
            pageParam: "service-detail",
            badge: "Global"
        },
        {
            id: "about",
            name: "Sobre Nosotros",
            description: "Historia de la empresa y equipo.",
            icon: MessageSquare,
            pageParam: "about"
        },
        {
            id: "services-index",
            name: "Índice de Servicios",
            description: "Listado principal de todos los servicios ofrecidos.",
            icon: LayoutTemplate,
            pageParam: "services"
        },
        {
            id: "contact",
            name: "Contacto",
            description: "Información de contacto y formulario.",
            icon: Contact,
            pageParam: "contact"
        }
    ];

    return (
        <>
            <DashboardHeader
                title="Gestión del Sitio Web"
            >
                <Button variant="outline" size="sm" asChild>
                    <a
                        href={`http://${company.slug}.localhost:3000`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-2"
                    >
                        <ExternalLink className="h-4 w-4" />
                        <span>Ver sitio</span>
                    </a>
                </Button>
            </DashboardHeader>

            <div className="flex-1 space-y-8 p-4 md:p-8 w-full">


                <Tabs defaultValue="templates" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="templates">Plantillas</TabsTrigger>
                        <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
                        <TabsTrigger value="configuration">Configuración</TabsTrigger>
                    </TabsList>

                    <TabsContent value="templates" className="space-y-6">
                        {/* Templates Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {templates.map((template) => (
                                <Card key={template.id} className="group hover:border-primary/50 transition-colors flex flex-col">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <template.icon className="h-5 w-5" />
                                            </div>
                                            {template.badge && (
                                                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                                                    {template.badge}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {template.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button
                                            className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                            variant="secondary"
                                            onClick={() => router.push(`/dashboard/site/editor?page=${template.pageParam}`)}
                                        >
                                            Editar Plantilla
                                            <ArrowRight className="h-4 w-4 ml-2 opacity-50 group-hover:opacity-100" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="testimonials">
                        <TestimonialsManager />
                    </TabsContent>

                    <TabsContent value="configuration" className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Basic Analytics Card */}
                            <Card className="group relative overflow-hidden transition-all hover:border-primary/50">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                                            <BarChart3 className="h-5 w-5" />
                                        </div>
                                        <Badge variant="outline" className="bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200">
                                            ✓ Activo
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg">Analiticas Wabotti</CardTitle>
                                    <CardDescription>Estadísticas básicas de visitas y agendamientos siempre activas.</CardDescription>
                                </CardHeader>
                            </Card>

                            {/* GTM Card */}
                            <Card className="group relative overflow-hidden transition-all hover:border-primary/50">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                            <Tag className="h-5 w-5" />
                                        </div>
                                        {siteSettings.gtmContainerId ? (
                                            <Badge variant="outline" className="border-blue-200 text-blue-700">Configurado</Badge>
                                        ) : (
                                            <Badge variant="secondary">No configurado</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg">Google Tag Manager</CardTitle>
                                    <CardDescription>Para tracking avanzado con GA4 y eventos personalizados.</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="text-sm font-mono text-muted-foreground truncate">
                                        {siteSettings.gtmContainerId || "Sin ID asignado"}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Dialog open={gtmDialogOpen} onOpenChange={setGtmDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full gap-2">
                                                <Pencil className="h-3.5 w-3.5" />
                                                Configurar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Configurar Google Tag Manager</DialogTitle>
                                                <DialogDescription>
                                                    Ingresa tu Container ID para activar el rastreo avanzado.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="gtm-id">Container ID</Label>
                                                    <Input
                                                        id="gtm-id"
                                                        placeholder="GTM-XXXXXX"
                                                        value={gtmId}
                                                        onChange={(e) => setGtmId(e.target.value.toUpperCase())}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Formato: GTM-XXXXXX
                                                    </p>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleSaveGTM} disabled={updateGTM.isPending}>
                                                    {updateGTM.isPending ? "Guardando..." : "Guardar cambios"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                            </Card>

                            {/* Facebook Pixel Card */}
                            <Card className="group relative overflow-hidden transition-all hover:border-primary/50">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <Facebook className="h-5 w-5" />
                                        </div>
                                        {siteSettings.fbPixelId ? (
                                            <Badge variant="outline" className="border-indigo-200 text-indigo-700">Configurado</Badge>
                                        ) : (
                                            <Badge variant="secondary">No configurado</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg">Meta Pixel & CAPI</CardTitle>
                                    <CardDescription>Rastrea conversiones y eventos directamente desde el servidor.</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-4">
                                    <div className="text-sm font-mono text-muted-foreground truncate">
                                        {siteSettings.fbPixelId || "Sin Pixel ID"}
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    <Dialog open={fbDialogOpen} onOpenChange={setFbDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full gap-2">
                                                <Pencil className="h-3.5 w-3.5" />
                                                Configurar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Configurar Meta Pixel & CAPI</DialogTitle>
                                                <DialogDescription>
                                                    Configura tu Pixel ID y Access Token para la API de Conversiones.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="fb-pixel">Pixel ID</Label>
                                                    <Input
                                                        id="fb-pixel"
                                                        placeholder="123456789012345"
                                                        value={fbPixelId}
                                                        onChange={(e) => setFbPixelId(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="fb-token">Access Token (Conversiones API)</Label>
                                                    <Input
                                                        id="fb-token"
                                                        type="password"
                                                        placeholder="EAAxxxxxxxxxx"
                                                        value={fbToken}
                                                        onChange={(e) => setFbToken(e.target.value)}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Recomendado para evitar bloqueos de navegador.
                                                    </p>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleSaveFB} disabled={updateFB.isPending}>
                                                    {updateFB.isPending ? "Guardando..." : "Guardar cambios"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Help Banner */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/10 border border-dashed rounded-lg">
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Settings className="h-4 w-4 text-muted-foreground" />
                                Acerca de las integraciones
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Estas integraciones permiten que tu sitio web envíe datos directamente a tus plataformas de marketing.
                                Wabotti Analytics siempre está activo para darte las métricas del dashboard sin necesidad de configuración externa.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
