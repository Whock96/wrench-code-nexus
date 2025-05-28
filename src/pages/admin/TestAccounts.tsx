
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const TestAccounts: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestAccounts = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-test-accounts');
      
      if (error) throw error;
      setResult(data);
    } catch (err: any) {
      console.error('Error creating test accounts:', err);
      setError(err.message || 'Ocorreu um erro ao criar as contas de teste');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contas de Teste</h1>
          <p className="text-muted-foreground">
            Crie contas de teste para demonstração do sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Contas de Teste</CardTitle>
            <CardDescription>
              Esta ação criará uma oficina de teste com usuários de diferentes perfis,
              clientes, veículos e ordens de serviço para demonstração.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Esta função é apenas para ambientes de teste. Não use em produção.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={createTestAccounts} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando contas...
                </>
              ) : (
                'Criar Contas de Teste'
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Contas criadas com sucesso!</AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    <p className="font-semibold">Oficina: {result.shop.name}</p>
                    <p className="mt-2 font-semibold">Contas de usuário:</p>
                    <ul className="mt-1 space-y-1">
                      {result.users.map((user: any, index: number) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">{user.role}:</span> {user.email} (senha: {user.password})
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TestAccounts;
