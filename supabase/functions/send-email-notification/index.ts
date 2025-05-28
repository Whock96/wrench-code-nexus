
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

    const { notificationId } = await req.json();

    if (!notificationId) {
      throw new Error('Notification ID is required');
    }

    // Get notification details
    const { data: notification, error: notificationError } = await supabaseClient
      .from('notifications')
      .select(`
        *,
        users!user_id (
          id,
          full_name
        )
      `)
      .eq('id', notificationId)
      .single();

    if (notificationError || !notification) {
      throw new Error('Notification not found');
    }

    // Check if user has email preferences enabled for this type
    const { data: preferences } = await supabaseClient
      .from('notification_preferences')
      .select('email_enabled')
      .eq('user_id', notification.user_id)
      .eq('shop_id', notification.shop_id)
      .eq('notification_type', notification.type)
      .single();

    if (preferences && !preferences.email_enabled) {
      console.log('Email notifications disabled for this user and type');
      return new Response(
        JSON.stringify({ success: true, message: 'Email disabled by user preferences' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Get user's email from auth.users (would need service role access)
    // For now, we'll log the notification
    console.log('Processing email notification:', {
      id: notification.id,
      title: notification.title,
      content: notification.content,
      type: notification.type,
      priority: notification.priority,
      user: notification.users?.full_name
    });

    // Log the email sending attempt
    await supabaseClient
      .from('notification_logs')
      .insert({
        notification_id: notificationId,
        delivery_type: 'email',
        status: 'sent',
        recipient: notification.users?.full_name || 'Unknown',
        sent_at: new Date().toISOString(),
        metadata: { 
          email_service: 'simulated',
          subject: notification.title 
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification processed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error processing email notification:', error);
    
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
