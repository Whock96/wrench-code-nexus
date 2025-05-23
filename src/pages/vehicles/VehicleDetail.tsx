
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash, User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const VehicleDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select(`*, customers(*)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      setVehicle(data);
      setCustomer(data.customers);
    } catch (error: any) {
      console.error("Error loading vehicle:", error);
      toast({
        title: "Erro ao carregar veículo",
        description: error.message,
        variant: "destructive",
      });
      navigate("/vehicles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Veículo excluído",
        description: "O veículo foi excluído com sucesso.",
      });
      navigate("/vehicles");
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      toast({
        title: "Erro ao excluir veículo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  if (!vehicle) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Veículo não encontrado</h2>
          <p className="mt-2 text-muted-foreground">
            O veículo que você está procurando não existe ou foi removido.
          </p>
          <Button className="mt-4" onClick={() => navigate("/vehicles")}>
            Voltar para a lista
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/vehicles")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-muted-foreground">Detalhes do veículo</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to={`/vehicles/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o
                    veículo e todos os dados associados a ele.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Sim, excluir veículo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Marca/Modelo
                </h3>
                <p>
                  {vehicle.make} {vehicle.model}
                </p>
              </div>
              {vehicle.year && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Ano
                  </h3>
                  <p>{vehicle.year}</p>
                </div>
              )}
              {vehicle.license_plate && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Placa
                  </h3>
                  <p>{vehicle.license_plate}</p>
                </div>
              )}
              {vehicle.vin && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Chassi (VIN)
                  </h3>
                  <p>{vehicle.vin}</p>
                </div>
              )}
              {vehicle.color && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Cor
                  </h3>
                  <p>{vehicle.color}</p>
                </div>
              )}
              {vehicle.engine_type && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Motor
                  </h3>
                  <p>{vehicle.engine_type}</p>
                </div>
              )}
              {vehicle.fuel_type && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Combustível
                  </h3>
                  <p>{vehicle.fuel_type}</p>
                </div>
              )}
              {vehicle.mileage !== null && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Quilometragem
                  </h3>
                  <p>{vehicle.mileage.toLocaleString()} km</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proprietário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <Link
                      to={`/clients/${customer.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </div>
                  {customer.phone && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Telefone
                      </h3>
                      <p>{customer.phone}</p>
                    </div>
                  )}
                  {customer.email && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Email
                      </h3>
                      <p>{customer.email}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">
                  Nenhum proprietário associado
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {vehicle.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{vehicle.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default VehicleDetail;
