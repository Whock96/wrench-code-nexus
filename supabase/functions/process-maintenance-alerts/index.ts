
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Processing maintenance alerts...');

    // Get all active maintenance alert rules
    const { data: rules, error: rulesError } = await supabaseClient
      .from('maintenance_alerts')
      .select(`
        *,
        vehicles!vehicle_id (
          id,
          make,
          model,
          license_plate,
          mileage,
          customers!customer_id (
            id,
            name,
            email
          )
        )
      `)
      .eq('active', true);

    if (rulesError) {
      throw rulesError;
    }

    console.log(`Found ${rules?.length || 0} active maintenance rules`);

    let alertsGenerated = 0;

    for (const rule of rules || []) {
      const vehicle = rule.vehicles;
      if (!vehicle || !vehicle.customers) continue;

      const customer = vehicle.customers;
      const today = new Date();
      let shouldAlert = false;
      let alertMessage = '';

      // Check kilometer-based alerts
      if (rule.km_interval && rule.last_service_km && vehicle.mileage) {
        const nextServiceKm = rule.last_service_km + rule.km_interval;
        const kmUntilService = nextServiceKm - vehicle.mileage;
        
        if (kmUntilService <= rule.alert_threshold_km) {
          shouldAlert = true;
          alertMessage = `Manutenção preventiva recomendada em ${kmUntilService}km para ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;
        }
      }

      // Check time-based alerts
      if (rule.time_interval_days && rule.last_service_date) {
        const lastServiceDate = new Date(rule.last_service_date);
        const nextServiceDate = new Date(lastServiceDate);
        nextServiceDate.setDate(nextServiceDate.getDate() + rule.time_interval_days);
        
        const daysUntilService = Math.ceil(
          (nextServiceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysUntilService <= rule.alert_threshold_days) {
          shouldAlert = true;
          alertMessage = `Manutenção preventiva recomendada em ${daysUntilService} dias para ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;
        }
      }

      if (shouldAlert) {
        // Check if we already sent an alert recently (within last 7 days)
        const { data: recentNotifications } = await supabaseClient
          .from('notifications')
          .select('id')
          .eq('shop_id', rule.shop_id)
          .eq('type', 'maintenance_reminder')
          .contains('metadata', { vehicle_id: vehicle.id, rule_id: rule.id })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (recentNotifications && recentNotifications.length > 0) {
          console.log(`Recent alert already sent for vehicle ${vehicle.id}, rule ${rule.id}`);
          continue;
        }

        // Create notification for the customer
        const { data: notification, error: notificationError } = await supabaseClient
          .from('notifications')
          .insert({
            shop_id: rule.shop_id,
            user_id: customer.id, // Assuming customer has a user account
            title: 'Lembrete de Manutenção Preventiva',
            content: alertMessage,
            type: 'maintenance_reminder',
            priority: 'medium',
            link: `/vehicles/${vehicle.id}`,
            metadata: {
              vehicle_id: vehicle.id,
              rule_id: rule.id,
              service_type: rule.service_type,
              alert_type: rule.km_interval ? 'kilometer' : 'time'
            }
          })
          .select()
          .single();

        if (notificationError) {
          console.error('Error creating maintenance notification:', notificationError);
          continue;
        }

        console.log(`Created maintenance alert for vehicle ${vehicle.license_plate}`);
        alertsGenerated++;

        // Optionally trigger email notification
        if (notification) {
          try {
            await supabaseClient.functions.invoke('send-email-notification', {
              body: { notificationId: notification.id }
            });
          } catch (emailError) {
            console.error('Error sending email notification:', emailError);
          }
        }
      }
    }

    console.log(`Generated ${alertsGenerated} maintenance alerts`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        alertsGenerated,
        message: `Processed ${rules?.length || 0} rules, generated ${alertsGenerated} alerts`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing maintenance alerts:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
