import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, Flower2, LayoutGrid, Package, Truck, Users } from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';

import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { can } = usePage<SharedData>().props as SharedData;

    const mainNavItems: NavItem[] = [
        {
            title: 'Panel',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Proveedores',
            href: '/suppliers',
            icon: Truck,
        },
        {
            title: 'Ingreso de Productos',
            href: '/product-entries',
            icon: ClipboardList,
        },
        {
            title: 'Exportable',
            href: '/classifications',
            icon: Package,
        },
        {
            title: 'Flor Local',
            href: '/local-flowers',
            icon: Flower2,
        },
        ...(can?.manage_users
            ? [
                  {
                      title: 'Gestión de Usuarios',
                      href: '/users',
                      icon: Users,
                  } as NavItem,
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
