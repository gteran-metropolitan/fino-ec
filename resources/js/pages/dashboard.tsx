import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-8 p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Dashboard
                    </h1>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Tarjeta de Proveedores */}
                    <Link href="/suppliers" className="group">
                        <div className="relative flex h-full flex-col justify-between rounded-xl border bg-card p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                            <div>
                                <h3 className="font-medium">Proveedores</h3>

                            </div>


                                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-all group-hover:text-foreground group-hover:underline">
                                    Ver proveedores
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </span>

                        </div>
                    </Link>

                    {/* Placeholder - Próximamente */}
                    <div className="relative flex h-full flex-col rounded-xl border border-dashed p-5 opacity-40">
                        <div>
                            <h3 className="font-medium text-muted-foreground">
                                Próximamente
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Nueva funcionalidad
                            </p>
                        </div>
                    </div>

                    <div className="relative flex h-full flex-col rounded-xl border border-dashed p-5 opacity-40">
                        <div>
                            <h3 className="font-medium text-muted-foreground">
                                Próximamente
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Nueva funcionalidad
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
