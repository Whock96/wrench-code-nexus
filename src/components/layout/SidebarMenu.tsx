
import { Home, Users, Car, Wrench, Bell, Settings, BarChart3, Globe, TestTube } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useShop } from "@/hooks/useShop";

interface SidebarMenuProps {
  onNavigate?: (path: string) => void;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

const NavItem = ({ href, icon, label, onClick, isActive }: NavItemProps) => (
  <Button
    variant={isActive ? "secondary" : "ghost"}
    className={cn(
      "w-full justify-start",
      isActive && "bg-secondary"
    )}
    onClick={onClick}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </Button>
);

export const SidebarMenu = ({ onNavigate }: SidebarMenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useShop();

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const menuItems = [
    { href: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
    { href: "/clients", icon: <Users className="h-4 w-4" />, label: "Clientes" },
    { href: "/vehicles", icon: <Car className="h-4 w-4" />, label: "Veículos" },
    { href: "/service-orders", icon: <Wrench className="h-4 w-4" />, label: "Ordens de Serviço" },
    { href: "/notifications", icon: <Bell className="h-4 w-4" />, label: "Notificações" },
    { href: "/reports", icon: <BarChart3 className="h-4 w-4" />, label: "Relatórios" },
  ];

  const settingsItems = [
    { href: "/settings/notifications", icon: <Bell className="h-4 w-4" />, label: "Notificações" },
    { href: "/settings/regional", icon: <Globe className="h-4 w-4" />, label: "Configurações Regionais" },
  ];

  const adminItems = [
    { href: "/admin/test-accounts", icon: <TestTube className="h-4 w-4" />, label: "Contas de Teste" },
  ];

  return (
    <div className="px-3 py-2">
      <div className="space-y-1">
        {menuItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            onClick={() => handleNavigate(item.href)}
            isActive={location.pathname === item.href}
          />
        ))}
      </div>
      
      <div className="mt-6">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Configurações
        </h2>
        <div className="space-y-1">
          {settingsItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              onClick={() => handleNavigate(item.href)}
              isActive={location.pathname === item.href}
            />
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-6">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Administração
          </h2>
          <div className="space-y-1">
            {adminItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                onClick={() => handleNavigate(item.href)}
                isActive={location.pathname === item.href}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
