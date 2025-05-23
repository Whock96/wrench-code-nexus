
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data for dashboard
  const shopData = {
    servicesCompleted: 12,
    activeOrders: 5,
    pendingApprovals: 2,
    vehiclesInShop: 8,
    revenueToday: "R$ 3.250,00",
    revenueMonth: "R$ 42.800,00",
    popularServices: [
      { name: "Oil Change", count: 8 },
      { name: "Brake Inspection", count: 5 },
      { name: "Wheel Alignment", count: 4 },
    ],
    recentOrders: [
      { id: "OS-2023-001", customer: "Carlos Silva", vehicle: "Honda Civic 2020", status: "in_progress" },
      { id: "OS-2023-002", customer: "Maria Santos", vehicle: "Toyota Corolla 2019", status: "pending_approval" },
      { id: "OS-2023-003", customer: "João Oliveira", vehicle: "Fiat Argo 2021", status: "completed" },
    ],
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return { variant: "default" as const, label: "In Progress" };
      case "pending_approval":
        return { variant: "warning" as const, label: "Pending Approval" };
      case "completed":
        return { variant: "success" as const, label: "Completed" };
      default:
        return { variant: "secondary" as const, label: status };
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Here's what's happening today.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Services Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shopData.servicesCompleted}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shopData.activeOrders}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vehicles In Shop
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shopData.vehiclesInShop}</div>
              <p className="text-xs text-muted-foreground">Currently</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shopData.revenueToday}</div>
              <p className="text-xs text-muted-foreground">
                {shopData.revenueMonth} this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Recent service orders created or updated today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shopData.recentOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  
                  return (
                    <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <div className="font-medium">{order.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customer} - {order.vehicle}
                        </div>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-muted-foreground">
                Showing 3 of {shopData.activeOrders + shopData.pendingApprovals} active orders
              </div>
            </CardFooter>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Popular Services</CardTitle>
              <CardDescription>
                Most requested services this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shopData.popularServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="text-sm font-medium">{service.name}</div>
                    <div className="text-sm text-muted-foreground">{service.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent hover:border-primary cursor-pointer transition-all hover-scale">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <span className="text-sm font-medium">New Customer</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent hover:border-primary cursor-pointer transition-all hover-scale">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <span className="text-sm font-medium">New Vehicle</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent hover:border-primary cursor-pointer transition-all hover-scale">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
                </div>
                <span className="text-sm font-medium">New Service Order</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent hover:border-primary cursor-pointer transition-all hover-scale">
                <div className="rounded-full bg-primary/10 p-3 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="18" height="10" x="3" y="10" rx="2"></rect><circle cx="7" cy="15" r="2"></circle><path d="M15.3 15.5a2 2 0 0 0 0-1"></path><path d="M17.3 15.5a2 2 0 0 0 0-1"></path><path d="m6 10-1.5-4.5a1 1 0 0 1 0-.78"></path><path d="m18 10 1.5-4.5a1 1 0 0 0 0-.78"></path><path d="M17.8 18.2c.2.4.2.8 0 1.2-.2.2-.5.6-1 .6H7.2c-.5 0-.8-.4-1-.6-.2-.4-.2-.8 0-1.2l1-1c.2-.2.5-.4.8-.4h8c.3 0 .6.2.8.4l1 1Z"></path></svg>
                </div>
                <span className="text-sm font-medium">Generate QR Code</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
