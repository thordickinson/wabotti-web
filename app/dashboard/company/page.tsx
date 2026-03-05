"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { trpc } from "@/src/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/ui/image-upload";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Plus,
    MapPin,
    Phone,
    Mail,
    Pencil,
    Trash2,
    Globe,
    Loader2
} from "lucide-react";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { useSearchParams, useRouter } from "next/navigation";


type LocationFormData = {
    name: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    googleMapsUrl: string;
    latitude: string;
    longitude: string;
};

const emptyLocationForm: LocationFormData = {
    name: "",
    address: "",
    city: "",
    country: "",
    phone: "",
    email: "",
    googleMapsUrl: "",
    latitude: "",
    longitude: "",
};

export default function CompanySettingsPage() {
    const { data: company, isLoading, refetch } = trpc.company.get.useQuery();
    const { data: myRole } = trpc.team.myRole.useQuery();
    const updateCompany = trpc.company.update.useMutation({
        onSuccess: () => refetch(),
    });
    const updateBranding = trpc.company.updateBranding.useMutation({
        onSuccess: () => refetch(),
    });

    const [name, setName] = useState("");
    const [legalName, setLegalName] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#3B82F6");
    const [secondaryColor, setSecondaryColor] = useState("#10B981");
    const [logoUrl, setLogoUrl] = useState("");
    const [description, setDescription] = useState("");
    const [aboutImage, setAboutImage] = useState("");

    const [socialUrls, setSocialUrls] = useState({
        facebook: "",
        instagram: "",
        twitter: "",
        linkedin: "",
        tiktok: "",
    });

    // Locations State
    const { data: locations, refetch: refetchLocations } = trpc.location.list.useQuery();
    const createLocation = trpc.location.create.useMutation({
        onSuccess: () => {
            toast.success("Ubicación creada");
            refetchLocations();
            setLocationsDialogOpen(false);
            setLocationForm(emptyLocationForm);
        },
    });
    const updateLocation = trpc.location.update.useMutation({
        onSuccess: () => {
            toast.success("Ubicación actualizada");
            refetchLocations();
            setLocationsDialogOpen(false);
            setLocationForm(emptyLocationForm);
            setEditingLocationId(null);
        },
    });
    const deleteLocation = trpc.location.delete.useMutation({
        onSuccess: () => {
            toast.success("Ubicación eliminada");
            refetchLocations();
        },
    });

    const [locationsDialogOpen, setLocationsDialogOpen] = useState(false);
    const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
    const [locationForm, setLocationForm] = useState<LocationFormData>(emptyLocationForm);




    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get("tab") || "general";

    // Initialize form when data loads
    const initForm = () => {
        if (company) {
            setName(company.name);
            setLegalName(company.legalName || "");
            setPrimaryColor(company.branding?.primaryColor || "#3B82F6");
            setSecondaryColor(company.branding?.secondaryColor || "#10B981");
            setLogoUrl(company.branding?.logoUrl || "");
            setLogoUrl(company.branding?.logoUrl || "");
            setDescription(company.description || "");
            setAboutImage((company as any).aboutImage || "");

            const savedSocial = (company.socialUrls as any) || {};
            setSocialUrls({
                facebook: savedSocial.facebook || "",
                instagram: savedSocial.instagram || "",
                twitter: savedSocial.twitter || "",
                linkedin: savedSocial.linkedin || "",
                tiktok: savedSocial.tiktok || "",
            });
        }
    };

    // Initialize form when company data is loaded
    useEffect(() => {
        if (company) {
            initForm();
        }
    }, [company]);

    // Handle general settings save
    const handleSaveGeneral = async () => {
        await updateCompany.mutateAsync({
            name,
            legalName: legalName || null,
            description: description || null,
            aboutImage: aboutImage || null,
        });
        toast.success("Información general guardada");
    };

    // Handle social settings save
    const handleSaveSocial = async () => {
        await updateCompany.mutateAsync({
            socialUrls: {
                facebook: socialUrls.facebook || null,
                instagram: socialUrls.instagram || null,
                twitter: socialUrls.twitter || null,
                linkedin: socialUrls.linkedin || null,
                tiktok: socialUrls.tiktok || null,
            },
        });
        toast.success("Redes sociales actualizadas");
    };

    // Handle branding save
    const handleSaveBranding = async () => {
        await updateBranding.mutateAsync({
            primaryColor,
            secondaryColor,
            logoUrl: logoUrl || null,
        });
        toast.success("Identidad visual actualizada");
    };

    // Locations Handlers
    const handleOpenCreateLocation = () => {
        setEditingLocationId(null);
        setLocationForm(emptyLocationForm);
        setLocationsDialogOpen(true);
    };

    const handleOpenEditLocation = (loc: any) => {
        setEditingLocationId(loc.id);
        setLocationForm({
            name: loc.name,
            address: loc.address || "",
            city: loc.city || "",
            country: loc.country || "",
            phone: loc.phone || "",
            email: loc.email || "",
            googleMapsUrl: (loc as any).googleMapsUrl || "",
            latitude: (loc as any).latitude?.toString() || "",
            longitude: (loc as any).longitude?.toString() || "",
        });
        setLocationsDialogOpen(true);
    };

    const handleLocationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...locationForm,
            googleMapsUrl: locationForm.googleMapsUrl || null,
            latitude: locationForm.latitude ? parseFloat(locationForm.latitude) : null,
            longitude: locationForm.longitude ? parseFloat(locationForm.longitude) : null,
        };

        if (editingLocationId) {
            await updateLocation.mutateAsync({
                id: editingLocationId,
                ...payload,
            });
        } else {
            await createLocation.mutateAsync(payload);
        }
    };

    const handleTestRun = async () => {
        if (!confirm("Esto forzará el envío de recordatorios para citas próximas. ¿Continuar?")) return;

        const toastId = toast.loading("Ejecutando cron de recordatorios...");
        try {
            const res = await fetch('/api/cron/reminders');
            const data = await res.json();

            toast.dismiss(toastId);
            if (data.success) {
                toast.success(`Ejecutado correctamente. Enviados: ${data.processed}`);
            } else {
                toast.error(`Error: ${data.error}`);
            }
        } catch (err) {
            toast.dismiss(toastId);
            toast.error("Error al conectar con el endpoint");
            console.error(err);
        }
    };

    const canEdit = myRole === "OWNER" || myRole === "ADMIN";

    if (isLoading) {
        return (
            <>
                <DashboardHeader title="Empresa" />
                <div className="p-4 space-y-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </>
        );
    }

    const renderHeaderActions = () => {
        if (!canEdit) return null;

        switch (activeTab) {
            case "general":
                return (
                    <Button onClick={handleSaveGeneral} disabled={updateCompany.isPending}>
                        {updateCompany.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar Información
                    </Button>
                );
            case "branding":
                return (
                    <Button onClick={handleSaveBranding} disabled={updateBranding.isPending}>
                        {updateBranding.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar Diseño
                    </Button>
                );
            case "social":
                return (
                    <Button onClick={handleSaveSocial} disabled={updateCompany.isPending}>
                        {updateCompany.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Guardar Redes
                    </Button>
                );
            case "locations":
                return (
                    <Button onClick={handleOpenCreateLocation} className="gap-2">
                        <Plus className="size-4" />
                        Nueva ubicación
                    </Button>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <DashboardHeader title="Configuración de Empresa">
                {renderHeaderActions()}
            </DashboardHeader>

            <div className="flex flex-1 flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
                <Tabs defaultValue={activeTab} className="w-full space-y-6" onValueChange={(val) => {
                    initForm();
                    router.push(`/dashboard/company?tab=${val}`);
                }}>
                    <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="locations">Sedes</TabsTrigger>
                        <TabsTrigger value="branding">Marca</TabsTrigger>
                        <TabsTrigger value="social">Redes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Básica</CardTitle>
                                    <CardDescription>
                                        Datos principales visibles para tus clientes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre comercial</Label>
                                            <Input
                                                id="name"
                                                value={name || company?.name || ""}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={!canEdit}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="legalName">Razón social</Label>
                                            <Input
                                                id="legalName"
                                                value={legalName || company?.legalName || ""}
                                                onChange={(e) => setLegalName(e.target.value)}
                                                disabled={!canEdit}
                                                placeholder="Opcional"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Enlace público</Label>
                                        <div className="flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                                                wabotti.com/
                                            </span>
                                            <Input
                                                id="slug"
                                                value={company?.slug || ""}
                                                disabled
                                                className="rounded-l-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <Label>Zona horaria</Label>
                                            <Input value={company?.timezone || ""} disabled className="bg-muted" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Moneda</Label>
                                            <Input value={company?.currency || ""} disabled className="bg-muted" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Idioma</Label>
                                            <Input value={company?.language || ""} disabled className="bg-muted" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Acerca de la empresa</CardTitle>
                                    <CardDescription>
                                        Cuéntale a tus clientes sobre tu negocio, historia y valores.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <Label className="text-base font-medium">Imagen "Acerca de"</Label>
                                        <div className="p-1 border-2 border-dashed rounded-xl">
                                            <ImageUpload
                                                value={aboutImage}
                                                onChange={setAboutImage}
                                                onRemove={() => setAboutImage("")}
                                                folder="company"
                                                description="Banner para la página de Nosotros (1920x1080 recomendado)"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Descripción Pública</Label>
                                        <MarkdownEditor
                                            value={description}
                                            onChange={setDescription}
                                            placeholder="Escribe aquí la descripción de tu empresa..."
                                        />

                                        {canEdit && (
                                            <Button
                                                onClick={handleSaveGeneral}
                                                disabled={updateCompany.isPending}
                                                className="mt-4"
                                            >
                                                {updateCompany.isPending ? "Guardando..." : "Guardar cambios"}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="locations">
                        {locations?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-lg bg-muted/10">
                                <MapPin className="size-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No tienes ubicaciones registradas</h3>
                                <p className="text-muted-foreground mb-6 text-center max-w-sm">
                                    Agrega la primera sede de tu empresa para comenzar a recibir citas.
                                </p>
                                {canEdit && (
                                    <Button onClick={handleOpenCreateLocation}>
                                        <Plus className="size-4 mr-2" />
                                        Agregar Ubicación
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {locations?.map((location) => (
                                    <Card key={location.id} className="group relative overflow-hidden transition-all hover:shadow-md">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle>{location.name}</CardTitle>
                                                    <p className="text-sm text-muted-foreground break-all">{location.address || 'Sin dirección'}</p>
                                                </div>
                                                <div className="flex -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {canEdit && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleOpenEditLocation(location)}
                                                            >
                                                                <Pencil className="size-4 text-muted-foreground" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <Trash2 className="size-4 text-destructive" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Eliminarás la ubicación "{location.name}" permanentemente.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => deleteLocation.mutate({ id: location.id })}
                                                                            className="bg-destructive"
                                                                        >
                                                                            Eliminar
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Globe className="size-3.5 text-muted-foreground" />
                                                <span>{location.city}, {location.country}</span>
                                            </div>
                                            {location.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="size-3.5 text-muted-foreground" />
                                                    <span>{location.phone}</span>
                                                </div>
                                            )}
                                            {location.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="size-3.5 text-muted-foreground" />
                                                    <span className="truncate">{location.email}</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Dialogs logic remains the same, just keeping clean render */}
                        <Dialog open={locationsDialogOpen} onOpenChange={setLocationsDialogOpen}>
                            <DialogContent>
                                <form onSubmit={handleLocationSubmit}>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {editingLocationId ? "Editar Sede" : "Agregar Nueva Sede"}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Información de contacto y localización.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Nombre Identificativo *</Label>
                                            <Input
                                                required
                                                value={locationForm.name}
                                                onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                                                placeholder="Ej. Sede Norte"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Dirección</Label>
                                            <Input
                                                value={locationForm.address}
                                                onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                                                placeholder="Calle y número"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Ciudad</Label>
                                                <Input
                                                    value={locationForm.city}
                                                    onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>País</Label>
                                                <Input
                                                    value={locationForm.country}
                                                    onChange={(e) => setLocationForm({ ...locationForm, country: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Teléfono</Label>
                                                <Input
                                                    value={locationForm.phone}
                                                    onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input
                                                    value={locationForm.email}
                                                    onChange={(e) => setLocationForm({ ...locationForm, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Link de Google Maps</Label>
                                            <Input
                                                value={locationForm.googleMapsUrl}
                                                onChange={(e) => setLocationForm({ ...locationForm, googleMapsUrl: e.target.value })}
                                                placeholder="https://maps.google.com/..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Latitud</Label>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={locationForm.latitude}
                                                    onChange={(e) => setLocationForm({ ...locationForm, latitude: e.target.value })}
                                                    placeholder="19.4326"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Longitud</Label>
                                                <Input
                                                    type="number"
                                                    step="any"
                                                    value={locationForm.longitude}
                                                    onChange={(e) => setLocationForm({ ...locationForm, longitude: e.target.value })}
                                                    placeholder="-99.1332"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={createLocation.isPending || updateLocation.isPending}>
                                            Guardar Ubicación
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    <TabsContent value="branding">
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Identidad Visual</CardTitle>
                                        <CardDescription>
                                            Personaliza cómo ven tu marca tus clientes.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <div className="space-y-4">
                                            <Label className="text-base font-medium">Logotipo</Label>
                                            <div className="p-1 border-2 border-dashed rounded-xl">
                                                <ImageUpload
                                                    value={logoUrl}
                                                    onChange={setLogoUrl}
                                                    onRemove={() => setLogoUrl("")}
                                                    folder="branding"
                                                    description="Formato SVG, PNG transparente o JPG. Máx 5MB."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-base font-medium">Paleta de Colores</Label>
                                            <div className="grid gap-6">
                                                <div className="grid gap-3">
                                                    <Label htmlFor="primaryColor" className="text-xs uppercase tracking-wider text-muted-foreground">Color Principal</Label>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <Input
                                                                type="color"
                                                                id="primaryColor"
                                                                value={primaryColor}
                                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                                className="size-12 p-1 rounded-lg cursor-pointer border-0 ring-1 ring-border"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Input
                                                                value={primaryColor}
                                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                                className="font-mono uppercase"
                                                                maxLength={7}
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1">Usado en botones, encabezados y enlaces.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid gap-3">
                                                    <Label htmlFor="secondaryColor" className="text-xs uppercase tracking-wider text-muted-foreground">Color Secundario / Acento</Label>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <Input
                                                                type="color"
                                                                id="secondaryColor"
                                                                value={secondaryColor}
                                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                                className="size-12 p-1 rounded-lg cursor-pointer border-0 ring-1 ring-border"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Input
                                                                value={secondaryColor}
                                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                                className="font-mono uppercase"
                                                                maxLength={7}
                                                            />
                                                            <p className="text-xs text-muted-foreground mt-1">Usado en detalles, bordes y estados activos.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <div className="sticky top-6 space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mx-1">Vista Previa</h3>

                                    {/* Preview Card */}
                                    <div className="border rounded-2xl shadow-xl overflow-hidden bg-background">
                                        {/* Mock Browser Header */}
                                        <div className="h-2 bg-muted/50 w-full" />

                                        {/* Site Header Mock */}
                                        <div className="border-b px-6 py-4 flex items-center justify-between bg-card">
                                            <div className="flex items-center gap-2">
                                                {logoUrl ? (
                                                    <div className="relative h-8 w-24">
                                                        <Image
                                                            src={logoUrl}
                                                            alt="Logo Preview"
                                                            fill
                                                            className="object-contain object-left"
                                                            unoptimized
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-8 w-24 bg-muted/20 animate-pulse rounded flex items-center justify-center text-[10px] text-muted-foreground">
                                                        TU LOGO
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-4 text-sm font-medium text-muted-foreground">
                                                <span className="cursor-default hover:text-foreground">Inicio</span>
                                                <span className="cursor-default hover:text-foreground">Servicios</span>
                                            </div>
                                        </div>

                                        {/* Hero Section Mock */}
                                        <div className="p-8 text-center space-y-6 bg-gradient-to-b from-background to-muted/20">
                                            <div className="mx-auto size-16 rounded-full bg-muted/20 flex items-center justify-center mb-4" style={{ color: primaryColor }}>
                                                <span className="text-2xl">✨</span>
                                            </div>
                                            <h2 className="text-2xl font-bold tracking-tight">Tu Negocio se ve increíble</h2>
                                            <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                                                Así es como tus clientes verán tu marca en el sitio de reservas y correos electrónicos.
                                            </p>

                                            <div className="flex items-center justify-center gap-3 pt-2">
                                                <button
                                                    className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90 shadow-lg shadow-primary/20"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    Reservar Cita
                                                </button>
                                                <button
                                                    className="px-4 py-2 rounded-lg border font-medium text-sm transition-colors hover:bg-muted/50"
                                                    style={{ borderColor: secondaryColor, color: secondaryColor }}
                                                >
                                                    Ver Servicios
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mobile App Bar Mock */}
                                        <div className="bg-card border-t p-3 grid grid-cols-4 place-items-center">
                                            <div className="size-8 rounded-full bg-muted/20" />
                                            <div className="size-8 rounded-full bg-muted/20" />
                                            <div className="size-10 rounded-full flex items-center justify-center -mt-6 shadow-md border-4 border-background" style={{ backgroundColor: primaryColor }}>
                                                <Plus className="size-5 text-white" />
                                            </div>
                                            <div className="size-8 rounded-full bg-muted/20" />
                                            <div className="size-8 rounded-full bg-muted/20" />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground">
                                            Vista previa aproximada. El diseño final puede variar según la plantilla.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="social">
                        <Card>
                            <CardHeader>
                                <CardTitle>Redes Sociales</CardTitle>
                                <CardDescription>
                                    Conecta con tu audiencia mostrando tus perfiles oficiales.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {['instagram', 'facebook', 'twitter', 'tiktok', 'linkedin'].map((social) => (
                                        <div key={social} className="flex items-center gap-3 p-3 border rounded-lg bg-card focus-within:ring-1 ring-primary transition-all">
                                            <div className="size-8 rounded-full bg-muted flex items-center justify-center capitalize text-xs font-bold text-muted-foreground">
                                                {social[0]}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Label htmlFor={social} className="text-xs uppercase text-muted-foreground capitalize">{social}</Label>
                                                <Input
                                                    id={social}
                                                    placeholder={`usuario`}
                                                    value={(socialUrls as any)[social]}
                                                    onChange={(e) => setSocialUrls({ ...socialUrls, [social]: e.target.value })}
                                                    className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
