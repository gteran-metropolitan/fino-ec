import { Head, Link, usePage } from '@inertiajs/react';

import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Sistema de Gestión - Centro de Acopio">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDF8F8] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#1a0a0d]">
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-83.75 flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(110,16,41,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#1f1012] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_rgba(110,16,41,0.3)]">
                            <h1 className="mb-1 text-xl font-semibold text-[#6E1029]">
                                Sistema de Gestión
                            </h1>
                            <h2 className="mb-4 text-base font-medium text-[#8B4050] dark:text-[#C4909A]">
                                Centro de Acopio - Post Cosecha de Flores
                            </h2>
                            <p className="mb-6 text-[#706f6c] dark:text-[#A1A09A]">
                                Plataforma integral para la gestión de proveedores,
                                control de ingresos y seguimiento de productos
                                en el proceso de post cosecha.
                            </p>
                            <div className="flex gap-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-block rounded-sm border border-[#6E1029] bg-[#6E1029] px-5 py-1.5 text-sm leading-normal text-white hover:bg-[#8B1433] dark:border-[#6E1029] dark:bg-[#6E1029] dark:text-white dark:hover:bg-[#8B1433]"
                                    >
                                        Ir al Panel
                                    </Link>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="inline-block rounded-sm border border-[#6E1029] bg-[#6E1029] px-5 py-1.5 text-sm leading-normal text-white hover:bg-[#8B1433] dark:border-[#6E1029] dark:bg-[#6E1029] dark:text-white dark:hover:bg-[#8B1433]"
                                    >
                                        Ingresar al sistema
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="relative -mb-px aspect-335/376 w-full shrink-0 overflow-hidden rounded-t-lg bg-[#6E1029]/10 lg:mb-0 lg:-ml-px lg:aspect-auto lg:w-[438px] lg:rounded-t-none lg:rounded-r-lg dark:bg-[#6E1029]/20">
                            {/* Imagen de fondo */}
                            <img
                                src="fino.jpeg"
                                alt="FINO Ecuador - Flores"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            {/* Overlay oscuro para mejor legibilidad */}
                            <div className="absolute inset-0 " />
                            {/* Contenido sobre el video */}

                        </div>
                    </main>
                </div>
                <footer className="mt-8 text-center text-xs text-[#706f6c] dark:text-[#A1A09A]">
                    © {new Date().getFullYear()} FINO Ecuador. Todos los derechos reservados.
                </footer>
            </div>
        </>
    );
}

