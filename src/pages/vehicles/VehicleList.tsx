
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Car, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Vehicle = Tables<"vehicles"> & {
  customers?: {
    id: string;
    name: string;
  } | null;
};

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          customers (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error("Error loading vehicles:", error);
      toast({
        title: "Erro ao carregar veículos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Veículos</h1>
            <p className="text-muted-foreground">
              Gerencie os veículos dos seus clientes
            </p>
          </div>
          <Button asChild>
            <Link to="/vehicles/new">
              <Plus className="h-4 w-4 mr-2" />
              Novo Veículo
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por marca, modelo, placa ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Car className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum veículo encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? "Nenhum veículo corresponde aos critérios de busca." : "Você ainda não tem veículos cadastrados."}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link to="/vehicles/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Veículo
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{vehicle.make} {vehicle.model}</span>
                    <Badge variant="outline">{vehicle.year}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vehicle.license_plate && (
                    <div className="text-sm font-medium">
                      Placa: {vehicle.license_plate}
                    </div>
                  )}
                  {vehicle.customers && (
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{vehicle.customers.name}</span>
                    </div>
                  )}
                  {vehicle.color && (
                    <div className="text-sm text-muted-foreground">
                      Cor: {vehicle.color}
                    </div>
                  )}
                  <div className="flex space-x-2 mt-4">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/vehicles/${vehicle.id}`}>
                        Ver Detalhes
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/vehicles/${vehicle.id}/edit`}>
                        Editar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default VehicleList;
