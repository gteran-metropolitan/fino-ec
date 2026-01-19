import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel" />
            <div className="flex h-full flex-1 flex-col gap-5 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Panel Principal
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Bienvenido al sistema de gestión
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
                    {/* Tarjeta de Proveedores */}
                    <Link href="/delivery-flow" className="group">
                        <div className="relative flex h-full flex-col justify-between rounded-xl border bg-card p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                            <div>
                                <h3 className="font-medium">Entrega y Postcosecha</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Gestiona la entrega del dia y el flujo de postcosecha
                                </p>
                            </div>

                            <div className="mt-4">
                                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-all group-hover:text-foreground group-hover:underline">
                                    Ingresar a entrega y postcosecha
                                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/*               Tarjeta de Ingreso de Productos
                    <Link href="/product-entries" className="group">
                        <div className="relative flex h-full flex-col justify-between rounded-xl border bg-card p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                            <div>
                                <h3 className="font-medium">Ingreso de Productos</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Registra las entregas de tus proveedores
                                </p>
                            </div>

                            <div className="mt-4">
                                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-all group-hover:text-foreground group-hover:underline">
                                    Ver ingresos
                                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                </span>
                            </div>
                        </div>
                    </Link>*/}

                    {/* Tarjeta de Exportable */}
                    {/*                    <Link href="/classifications" className="group">
                        <div className="relative flex h-full flex-col justify-between rounded-xl border border-green-200 bg-green-50/50 p-5 transition-all duration-200 hover:border-green-300 hover:shadow-sm dark:bg-green-950/20 dark:border-green-800">
                            <div>
                                <h3 className="font-medium text-green-800 dark:text-green-300">Exportable</h3>
                                <p className="mt-1 text-sm text-green-700/70 dark:text-green-400/70">
                                    Clasificación de tallos válidos para exportación
                                </p>
                            </div>

                            <div className="mt-4">
                                <span className="inline-flex items-center gap-1 text-sm text-green-700/70 transition-all group-hover:text-green-800 group-hover:underline dark:text-green-400/70 dark:group-hover:text-green-300">
                                    Ver exportable
                                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                </span>
                            </div>
                        </div>
                    </Link>*/}

                    {/*                     Tarjeta de Flor Local
                    <Link href="/local-flowers" className="group">
                        <div className="relative flex h-full flex-col justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-5 transition-all duration-200 hover:border-amber-300 hover:shadow-sm dark:bg-amber-950/20 dark:border-amber-800">
                            <div>
                                <h3 className="font-medium text-amber-800 dark:text-amber-300">Flor Local</h3>
                                <p className="mt-1 text-sm text-amber-700/70 dark:text-amber-400/70">
                                    Flores desechadas para venta nacional
                                </p>
                            </div>

                            <div className="mt-4">
                                <span className="inline-flex items-center gap-1 text-sm text-amber-700/70 transition-all group-hover:text-amber-800 group-hover:underline dark:text-amber-400/70 dark:group-hover:text-amber-300">
                                    Ver flor local
                                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                                </span>
                            </div>
                        </div>
                    </Link>*/}
                </div>
            </div>
        </AppLayout>
    );
}
