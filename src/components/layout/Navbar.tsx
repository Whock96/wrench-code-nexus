
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-10">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="md:hidden text-xl font-semibold text-foreground">
            ASMS
          </span>
          <span className="hidden md:block text-xl font-semibold text-foreground">
            Auto Shop Management System
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-9 w-9 p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};
