"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams, usePathname } from "next/navigation";
import { trpc } from "@/src/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export default function ConfirmBookingPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const pathname = usePathname();
    const token = searchParams.get("token");
    const site = params.site as string;

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const isSitePreview = pathname.startsWith('/sites');
    const homeUrl = isSitePreview ? `/sites/${site}/` : "/";

    const confirmMutation = trpc.booking.confirmByToken.useMutation({
        onSuccess: (data) => {
            setBookingDetails(data);
            setStatus("success");
        },
        onError: (error) => {
            setErrorMessage(error.message);
            setStatus("error");
        }
    });

    useEffect(() => {
        if (token) {
            confirmMutation.mutate({ token });
        } else {
            setStatus("error");
            setErrorMessage("Token de confirmación no encontrado.");
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 light">
            <Card className="max-w-md w-full shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Confirmación de Cita</CardTitle>
                    <CardDescription>Wabotti Scheduling System</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {status === "loading" && (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="text-muted-foreground font-medium">Confirmando tu cita...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="text-center space-y-4 py-6">
                            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900">¡Cita Confirmada!</h3>
                                <p className="text-slate-600">
                                    Tu cita en <strong>{bookingDetails?.companyName}</strong> ha sido confirmada satisfactoriamente.
                                </p>
                            </div>

                            {bookingDetails?.startTime && (
                                <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-3 text-left border">
                                    <div className="p-2 bg-white rounded-md shadow-sm border">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold capitalize">
                                            {format(new Date(bookingDetails.startTime), "EEEE, d 'de' MMMM", { locale: es })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Hora: {format(new Date(bookingDetails.startTime), "HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <Button asChild className="w-full mt-6">
                                <Link href={homeUrl}>
                                    Ir al Inicio
                                </Link>
                            </Button>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="text-center space-y-4 py-6">
                            <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="h-12 w-12 text-red-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-900">Error al Confirmar</h3>
                                <p className="text-red-600 text-sm">
                                    {errorMessage || "No se pudo confirmar la cita. El link puede haber expirado o ser inválido."}
                                </p>
                            </div>
                            <Button asChild variant="outline" className="w-full mt-6">
                                <Link href={homeUrl}>
                                    Regresar al Sitio
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
