
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Car, 
  Clipboard, 
  Settings, 
  BarChart, 
  Package, 
  Bell 
} from "lucide-react";

export const SidebarMenu: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };
  
  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Clientes", path: "/clients" },
    { icon: Car, label: "Veículos", path: "/vehicles" },
    { icon: Clipboard, label: "Ordens de Serviço", path: "/service-orders" },
    { icon: Package, label: "Estoque", path: "/inventory" },
    { icon: Bell, label: "Notificações", path: "/notifications" },
    { icon: BarChart, label: "Relatórios", path: "/reports" },
    { icon: Settings, label: "Configurações", path: "/settings/regional" },
  ];
  
  return (
    <div className="space-y-1 py-2">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
            isActive(item.path)
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <item.icon className="h-5 w-5 mr-2" />
          {item.label}
        </Link>
      ))}
    </div>
  );
};
