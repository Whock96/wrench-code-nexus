
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Country {
  code: string;
  name: string;
  phone_code: string | null;
  tax_id_label: string | null;
  tax_id_mask: string | null;
  vehicle_registration_label: string | null;
  vehicle_registration_mask: string | null;
  date_format: string | null;
  currency_code: string | null;
  active: boolean;
}

export const useCountries = () => {
  const { data: countries = [], isLoading, error } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data as Country[];
    },
  });

  const getCountryByCode = (code: string) => {
    return countries.find(country => country.code === code);
  };

  const getDocumentLabel = (countryCode: string) => {
    const country = getCountryByCode(countryCode);
    return country?.tax_id_label || 'Documento Fiscal';
  };

  const getVehicleRegistrationLabel = (countryCode: string) => {
    const country = getCountryByCode(countryCode);
    return country?.vehicle_registration_label || 'Placa';
  };

  return { 
    countries, 
    isLoading, 
    error, 
    getCountryByCode, 
    getDocumentLabel, 
    getVehicleRegistrationLabel 
  };
};
