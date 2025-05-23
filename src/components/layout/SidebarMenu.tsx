
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  UserCircle,
  Car,
  ClipboardList,
  Wrench,
  QrCode,
  Users,
  FileText,
  Settings,
  BarChart3,
} from "lucide-react";

export const SidebarMenu: React.FC = () => {
  const { user } = useAuth();

  // Define menu items based on user type
  const getMenuItems = () => {
    // Common menu items for all users
    const commonItems = [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "My Profile", path: "/profile", icon: UserCircle },
    ];

    // Items for shop users (shop and shop_master)
    const shopItems = [
      { name: "Customers", path: "/customers", icon: Users },
      { name: "Vehicles", path: "/vehicles", icon: Car },
      { name: "Service Orders", path: "/service-orders", icon: ClipboardList },
      { name: "Services", path: "/services", icon: Wrench },
      { name: "QR Codes", path: "/qr-codes", icon: QrCode },
      { name: "Reports", path: "/reports", icon: BarChart3 },
    ];

    // Items only for shop_master
    const shopMasterItems = [
      { name: "Shop Settings", path: "/shop-settings", icon: Settings },
    ];

    // Items for dev users (dev and dev_master)
    const devItems = [
      { name: "All Shops", path: "/shops", icon: Settings },
      { name: "Documentation", path: "/documentation", icon: FileText },
    ];

    // Items only for dev_master
    const devMasterItems = [
      { name: "System Settings", path: "/system-settings", icon: Settings },
    ];

    let items = [...commonItems];

    if (!user) return items;

    // Add items based on user type
    if (user.userType === 'shop' || user.userType === 'shop_master') {
      items = [...items, ...shopItems];
    }

    if (user.userType === 'shop_master') {
      items = [...items, ...shopMasterItems];
    }

    if (user.userType === 'dev' || user.userType === 'dev_master') {
      items = [...items, ...devItems];
    }

    if (user.userType === 'dev_master') {
      items = [...items, ...devMasterItems];
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="py-4 px-6 border-b border-sidebar-border">
          <div className="flex items-center">
            <div className="rounded-md bg-sidebar-accent p-2 mr-3">
              <Wrench className="h-6 w-6 text-bronze-DEFAULT" />
            </div>
            <span className="text-xl font-bold">AutoShop MS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-4 py-2 rounded-md transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground"
                    )
                  }
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User type indicator */}
        {user && (
          <div className="py-2 px-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/70 uppercase tracking-wider">
              {user.userType.replace('_', ' ')}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
