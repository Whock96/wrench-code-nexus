
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  ClipboardList, 
  Settings,
  Building2
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Veículos",
    href: "/vehicles",
    icon: Car,
  },
  {
    title: "Ordens de Serviço",
    href: "/service-orders",
    icon: ClipboardList,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export const SidebarMenu: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 z-40 border-r border-border bg-card">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <Building2 className="h-6 w-6 mr-2 text-primary" />
        <span className="font-semibold text-lg">ASMS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Auto Shop Management System
        </div>
      </div>
    </aside>
  );
};

export default SidebarMenu;
