
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash, Car, AlertTriangle } from "lucide-react";
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

const ClientDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClient();
    loadVehicles();
  }, [id]);

  const loadClient = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error: any) {
      console.error("Error loading client:", error);
      toast({
        title: "Erro ao carregar cliente",
        description: error.message,
        variant: "destructive",
      });
      navigate("/clients");
    } finally {
      setIsLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("customer_id", id);

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error("Error loading vehicles:", error);
      toast({
        title: "Erro ao carregar veículos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
      navigate("/clients");
    } catch (error: any) {
      console.error("Error deleting client:", error);
      toast({
        title: "Erro ao excluir cliente",
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

  if (!client) {
    return (
      <AppLayout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Cliente não encontrado</h2>
          <p className="mt-2 text-muted-foreground">
            O cliente que você está procurando não existe ou foi removido.
          </p>
          <Button className="mt-4" onClick={() => navigate("/clients")}>
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
            <Button variant="ghost" onClick={() => navigate("/clients")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <p className="text-muted-foreground">Detalhes do cliente</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to={`/clients/${id}/edit`}>
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
                    cliente e todos os dados associados a ele.
                    {vehicles.length > 0 && (
                      <div className="mt-2 flex items-center text-destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <span>
                          Este cliente possui {vehicles.length} veículo(s)
                          cadastrado(s) que também serão excluídos.
                        </span>
                      </div>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Sim, excluir cliente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Client Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h3>
                  <p>{client.email}</p>
                </div>
              )}
              {client.phone && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Telefone
                  </h3>
                  <p>{client.phone}</p>
                </div>
              )}
              {client.cpf_cnpj && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    CPF/CNPJ
                  </h3>
                  <p>{client.cpf_cnpj}</p>
                </div>
              )}
              {client.birth_date && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Data de Nascimento
                  </h3>
                  <p>{new Date(client.birth_date).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.address && (
                <>
                  {client.address.street && client.address.number && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Rua
                      </h3>
                      <p>
                        {client.address.street}, {client.address.number}
                      </p>
                    </div>
                  )}
                  {client.address.city && client.address.state && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Cidade/Estado
                      </h3>
                      <p>
                        {client.address.city} - {client.address.state}
                      </p>
                    </div>
                  )}
                  {client.address.zip_code && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        CEP
                      </h3>
                      <p>{client.address.zip_code}</p>
                    </div>
                  )}
                </>
              )}
              {(!client.address ||
                (!client.address.street &&
                  !client.address.city &&
                  !client.address.zip_code)) && (
                <p className="text-muted-foreground">
                  Nenhum endereço cadastrado
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {client.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{client.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Vehicles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Veículos</CardTitle>
            <Button asChild size="sm">
              <Link to={`/vehicles/new?customer=${id}`}>
                <Car className="h-4 w-4 mr-2" />
                Adicionar Veículo
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <div className="text-center py-6">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum veículo cadastrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Este cliente ainda não possui veículos cadastrados.
                </p>
                <Button asChild>
                  <Link to={`/vehicles/new?customer=${id}`}>
                    Cadastrar Primeiro Veículo
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="truncate">
                          {vehicle.make} {vehicle.model}
                        </span>
                        <Badge variant="outline">{vehicle.year}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 space-y-2">
                      {vehicle.license_plate && (
                        <div className="text-sm">
                          Placa: {vehicle.license_plate}
                        </div>
                      )}
                      {vehicle.color && (
                        <div className="text-sm text-muted-foreground">
                          Cor: {vehicle.color}
                        </div>
                      )}
                      <div className="flex space-x-2 mt-4">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Link to={`/vehicles/${vehicle.id}`}>
                            Ver Detalhes
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ClientDetail;
