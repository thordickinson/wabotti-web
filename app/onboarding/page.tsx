"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/src/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/-+/g, "-") // Replace multiple - with single -
        .slice(0, 50);
}

export default function OnboardingPage() {
    const router = useRouter();
    const { data: status, isLoading: statusLoading } = trpc.onboarding.getStatus.useQuery();
    const createCompany = trpc.onboarding.createCompany.useMutation({
        onSuccess: (company) => {
            // Set active company cookie
            document.cookie = `activeCompanyId=${company.id}; path=/; max-age=${60 * 60 * 24 * 365}`;
            router.push("/dashboard");
            router.refresh();
        },
    });

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);

    // Auto-generate slug from name
    useEffect(() => {
        if (!slugEdited && name) {
            setSlug(slugify(name));
        }
    }, [name, slugEdited]);

    // Redirect if user already has companies
    useEffect(() => {
        if (status?.hasCompanies) {
            router.push("/dashboard");
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createCompany.mutateAsync({ name, slug });
    };

    if (statusLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Skeleton className="h-12 w-12 rounded-lg mx-auto mb-2" />
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-4 w-64 mx-auto mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!status?.canCreateCompany) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle>No puedes crear empresas</CardTitle>
                        <CardDescription>
                            Tienes una empresa suspendida. Resuelve los problemas de pago antes de crear una nueva.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Building2 className="size-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Crea tu empresa</CardTitle>
                    <CardDescription>
                        Configura tu negocio para comenzar a usar Wabotti
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {createCompany.error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {createCompany.error.message}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la empresa</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Mi Clínica Estética"
                                required
                                autoFocus
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL pública</Label>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                    wabotti.com/
                                </span>
                                <Input
                                    id="slug"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlug(slugify(e.target.value));
                                        setSlugEdited(true);
                                    }}
                                    placeholder="mi-clinica"
                                    required
                                    className="h-11 font-mono"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Solo letras minúsculas, números y guiones
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11"
                            disabled={createCompany.isPending || !name || !slug}
                        >
                            {createCompany.isPending ? "Creando..." : "Crear empresa"}
                        </Button>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
