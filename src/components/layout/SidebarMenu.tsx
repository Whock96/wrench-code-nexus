
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  Package,
  Settings,
  Bell,
  BarChart3,
  Wrench,
  Building,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  items?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Clientes",
    href: "/clients",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Veículos",
    href: "/vehicles",
    icon: <Car className="h-5 w-5" />,
  },
  {
    title: "Ordens de Serviço",
    href: "/service-orders",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Estoque",
    icon: <Package className="h-5 w-5" />,
    items: [
      { title: "Dashboard", href: "/inventory" },
      { title: "Peças", href: "/inventory/parts" },
      { title: "Categorias", href: "/inventory/categories" },
      { title: "Movimentações", href: "/inventory/movements" },
      { title: "Fornecedores", href: "/inventory/suppliers" },
    ],
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Notificações",
    href: "/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: "Configurações",
    icon: <Settings className="h-5 w-5" />,
    items: [
      { title: "Regional", href: "/settings/regional" },
      { title: "Notificações", href: "/settings/notifications" },
    ],
  },
];

export const SidebarMenu: React.FC = () => {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<string[]>(['Estoque', 'Configurações']);

  const toggleItem = (title: string) => {
    setOpenItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Building className="h-6 w-6" />
          <span className="font-semibold">ASMS</span>
        </Link>
      </div>
      <nav className="space-y-2 p-4 overflow-y-auto h-[calc(100vh-4rem)]">
        {navItems.map((item) => {
          if (item.items) {
            const isOpen = openItems.includes(item.title);
            const hasActiveChild = item.items.some(subItem => isActive(subItem.href));
            
            return (
              <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between",
                      hasActiveChild && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 ml-6 mt-1">
                  {item.items.map((subItem) => (
                    <Button
                      key={subItem.href}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isActive(subItem.href) && "bg-accent text-accent-foreground"
                      )}
                      asChild
                    >
                      <Link to={subItem.href}>
                        {subItem.title}
                      </Link>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                item.href && isActive(item.href) && "bg-accent text-accent-foreground"
              )}
              asChild
            >
              <Link to={item.href!}>
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};
