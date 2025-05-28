
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCountries } from '@/hooks/useCountries';
import { useShop } from '@/hooks/useShop';

const RegionalSettings: React.FC = () => {
  const { toast } = useToast();
  const { shopId } = useShop();
  const { countries, isLoading: isLoadingCountries } = useCountries();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    default_country_code: 'BR',
    default_language: 'pt-BR',
    default_currency: 'BRL',
    date_format: 'DD/MM/YYYY',
    time_format: '24h',
    measurement_system: 'metric',
  });

  useEffect(() => {
    if (shopId) {
      loadSettings();
    }
  }, [shopId]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('shop_regional_settings')
        .select('*')
        .eq('shop_id', shopId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          default_country_code: data.default_country_code,
          default_language: data.default_language,
          default_currency: data.default_currency,
          date_format: data.date_format,
          time_format: data.time_format,
          measurement_system: data.measurement_system,
        });
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Erro ao carregar configurações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!shopId) return;
    
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from('shop_regional_settings')
        .upsert({
          shop_id: shopId,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Configurações salvas',
        description: 'As configurações regionais foram atualizadas com sucesso.',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Erro ao salvar configurações',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading || isLoadingCountries) {
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
        <div>
          <h1 className="text-3xl font-bold">Configurações Regionais</h1>
          <p className="text-muted-foreground">
            Configure as preferências regionais da sua oficina
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Localização e Formato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default_country_code">País Padrão</Label>
                <Select 
                  value={settings.default_country_code} 
                  onValueChange={(value) => handleChange('default_country_code', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o país padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default_language">Idioma Padrão</Label>
                <Select 
                  value={settings.default_language} 
                  onValueChange={(value) => handleChange('default_language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="default_currency">Moeda Padrão</Label>
                <Select 
                  value={settings.default_currency} 
                  onValueChange={(value) => handleChange('default_currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a moeda padrão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar (US$)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="MXN">Peso Mexicano ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_format">Formato de Data</Label>
                <Select 
                  value={settings.date_format} 
                  onValueChange={(value) => handleChange('date_format', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato de data" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/AAAA (31/12/2023)</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/AAAA (12/31/2023)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">AAAA-MM-DD (2023-12-31)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time_format">Formato de Hora</Label>
                <Select 
                  value={settings.time_format} 
                  onValueChange={(value) => handleChange('time_format', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato de hora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 horas (14:30)</SelectItem>
                    <SelectItem value="12h">12 horas (2:30 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="measurement_system">Sistema de Medidas</Label>
              <Select 
                value={settings.measurement_system} 
                onValueChange={(value) => handleChange('measurement_system', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o sistema de medidas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Métrico (km, litros)</SelectItem>
                  <SelectItem value="imperial">Imperial (milhas, galões)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default RegionalSettings;
