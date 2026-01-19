import { useEffect, useState } from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = () => {
        return currentTime.toLocaleTimeString('es-EC', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'America/Guayaquil',
        });
    };

    const formatDate = () => {
        return currentTime.toLocaleDateString('es-EC', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            timeZone: 'America/Guayaquil',
        });
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex flex-col items-end text-sm">
                <span className="font-mono text-base font-semibold tabular-nums">
                    {formatTime()}
                </span>
                <span className="text-xs text-muted-foreground capitalize hidden sm:block">
                    {formatDate()}
                </span>
            </div>
        </header>
    );
}
