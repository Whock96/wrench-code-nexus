
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Criar oficina de teste
    const { data: shopData, error: shopError } = await supabaseClient
      .from('shops')
      .insert({
        name: 'Oficina de Teste',
        status: 'active',
        theme_settings: { primary_color: '#3b82f6', logo_url: null }
      })
      .select()
      .single();

    if (shopError) throw shopError;
    const shopId = shopData.id;

    // Configurações regionais
    await supabaseClient
      .from('shop_regional_settings')
      .insert({
        shop_id: shopId,
        default_country_code: 'BR',
        default_language: 'pt-BR',
        default_currency: 'BRL',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        measurement_system: 'metric'
      });

    // Criar usuários de teste
    const testUsers = [
      {
        email: 'admin@teste.com',
        password: 'Teste@123',
        full_name: 'Administrador Teste',
        role: 'admin'
      },
      {
        email: 'gerente@teste.com',
        password: 'Teste@123',
        full_name: 'Gerente Teste',
        role: 'manager'
      },
      {
        email: 'tecnico@teste.com',
        password: 'Teste@123',
        full_name: 'Técnico Teste',
        role: 'technician'
      },
      {
        email: 'atendente@teste.com',
        password: 'Teste@123',
        full_name: 'Atendente Teste',
        role: 'user'
      }
    ];

    const createdUsers = [];

    for (const user of testUsers) {
      // Criar usuário no auth
      const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });

      if (userError) {
        console.error(`Erro ao criar usuário ${user.email}:`, userError);
        continue;
      }

      // Atualizar perfil
      await supabaseClient
        .from('users')
        .upsert({ 
          id: userData.user.id,
          full_name: user.full_name 
        });

      // Associar à oficina
      await supabaseClient
        .from('shop_users')
        .insert({
          shop_id: shopId,
          user_id: userData.user.id,
          role: user.role,
          status: 'active'
        });

      createdUsers.push({
        email: user.email,
        password: user.password,
        role: user.role
      });
    }

    // Criar alguns clientes de teste
    const testCustomers = [
      {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        phone: '(11) 98765-4321',
        tax_id: '123.456.789-00',
        tax_id_type: 'CPF/CNPJ',
        country_code: 'BR',
        locale: 'pt-BR',
        address: {
          street: 'Rua das Flores',
          number: '123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567'
        }
      },
      {
        name: 'Maria Souza',
        email: 'maria@exemplo.com',
        phone: '(11) 91234-5678',
        tax_id: '987.654.321-00',
        tax_id_type: 'CPF/CNPJ',
        country_code: 'BR',
        locale: 'pt-BR',
        address: {
          street: 'Av. Paulista',
          number: '1000',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01310-100'
        }
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        tax_id: '123-45-6789',
        tax_id_type: 'SSN',
        country_code: 'US',
        locale: 'en-US',
        address: {
          street: 'Main Street',
          number: '42',
          city: 'New York',
          state: 'NY',
          zip_code: '10001',
          country: 'United States'
        }
      }
    ];

    const createdCustomers = [];

    for (const customer of testCustomers) {
      const { data, error } = await supabaseClient
        .from('customers')
        .insert({
          ...customer,
          shop_id: shopId
        })
        .select()
        .single();

      if (error) {
        console.error(`Erro ao criar cliente ${customer.name}:`, error);
        continue;
      }

      createdCustomers.push(data);
    }

    // Criar veículos de teste
    const testVehicles = [
      {
        customer_id: createdCustomers[0]?.id,
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        license_plate: 'ABC-1234',
        vin: '1HGCM82633A123456',
        country_code: 'BR',
        registration_type: 'license_plate',
        mileage: 45000,
        color: 'Prata',
        fuel_type: 'Flex'
      },
      {
        customer_id: createdCustomers[1]?.id,
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        license_plate: 'DEF-5678',
        vin: '2HGFG12639H123456',
        country_code: 'BR',
        registration_type: 'license_plate',
        mileage: 60000,
        color: 'Preto',
        fuel_type: 'Flex'
      },
      {
        customer_id: createdCustomers[2]?.id,
        make: 'Ford',
        model: 'Mustang',
        year: 2021,
        license_plate: 'XYZ-9876',
        vin: '1FA6P8CF5M5123456',
        country_code: 'US',
        registration_type: 'license_plate',
        mileage: 15000,
        color: 'Vermelho',
        fuel_type: 'Gasolina'
      }
    ];

    const createdVehicles = [];

    for (const vehicle of testVehicles) {
      if (!vehicle.customer_id) continue;
      
      const { data, error } = await supabaseClient
        .from('vehicles')
        .insert({
          ...vehicle,
          shop_id: shopId
        })
        .select()
        .single();

      if (error) {
        console.error(`Erro ao criar veículo ${vehicle.make} ${vehicle.model}:`, error);
        continue;
      }

      createdVehicles.push(data);
    }

    // Criar ordens de serviço de teste
    const testServiceOrders = [
      {
        customer_id: createdCustomers[0]?.id,
        vehicle_id: createdVehicles[0]?.id,
        status: 'in_progress',
        description: 'Revisão de 45.000 km',
        estimated_completion_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      {
        customer_id: createdCustomers[1]?.id,
        vehicle_id: createdVehicles[1]?.id,
        status: 'pending',
        description: 'Troca de óleo e filtros',
        estimated_completion_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    for (const serviceOrder of testServiceOrders) {
      if (!serviceOrder.customer_id || !serviceOrder.vehicle_id) continue;
      
      const { data, error } = await supabaseClient
        .from('service_orders')
        .insert({
          ...serviceOrder,
          shop_id: shopId
        })
        .select()
        .single();

      if (error) {
        console.error(`Erro ao criar ordem de serviço:`, error);
        continue;
      }

      // Adicionar itens à OS
      await supabaseClient
        .from('service_items')
        .insert([
          {
            service_order_id: data.id,
            item_type: 'service',
            description: 'Mão de obra',
            quantity: 1,
            unit_price: 150.00,
            total_price: 150.00
          },
          {
            service_order_id: data.id,
            item_type: 'part',
            description: 'Filtro de óleo',
            quantity: 1,
            unit_price: 35.00,
            total_price: 35.00
          }
        ]);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contas de teste criadas com sucesso',
        shop: shopData,
        users: createdUsers
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating test accounts:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
