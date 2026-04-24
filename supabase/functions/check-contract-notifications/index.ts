import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Contract {
  id: string;
  user_id: string;
  name: string;
  supplier_name: string;
  end_date: string;
  termination_period_days: number | null;
  silent_renewal: boolean | null;
}

interface ExistingNotification {
  contract_id: string;
  type: string;
  title: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting contract notification check...");

    // Get all active contracts
    const { data: contracts, error: contractsError } = await supabase
      .from("contracts")
      .select("id, user_id, name, supplier_name, end_date, termination_period_days, silent_renewal")
      .in("status", ["active", "expiring"]);

    if (contractsError) {
      console.error("Error fetching contracts:", contractsError);
      throw contractsError;
    }

    console.log(`Found ${contracts?.length || 0} active contracts to check`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Define notification thresholds (in days)
    const thresholds = [
      { days: 180, label: "6 maanden", priority: "low" as const },
      { days: 90, label: "3 maanden", priority: "medium" as const },
      { days: 30, label: "1 maand", priority: "high" as const },
      { days: 7, label: "1 week", priority: "critical" as const },
    ];

    let notificationsCreated = 0;
    let notificationsSkipped = 0;

    for (const contract of contracts || []) {
      const endDate = new Date(contract.end_date);
      endDate.setHours(0, 0, 0, 0);
      
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check each threshold
      for (const threshold of thresholds) {
        // Check if we're within the threshold window (within 7 days of the threshold date)
        const daysFromThreshold = Math.abs(daysUntilExpiry - threshold.days);
        
        if (daysFromThreshold <= 3 && daysUntilExpiry > 0) {
          // Check if notification already exists for this contract and threshold
          const notificationTitle = `Contract verloopt over ${threshold.label}`;
          
          const { data: existingNotifications } = await supabase
            .from("notifications")
            .select("id")
            .eq("contract_id", contract.id)
            .eq("type", "expiry_warning")
            .ilike("title", `%${threshold.label}%`)
            .limit(1);

          if (existingNotifications && existingNotifications.length > 0) {
            console.log(`Notification already exists for ${contract.name} - ${threshold.label}`);
            notificationsSkipped++;
            continue;
          }

          // Create the notification
          const terminationDays = contract.termination_period_days || 30;
          const actionDeadline = new Date(endDate);
          actionDeadline.setDate(actionDeadline.getDate() - terminationDays);

          const silentRenewalWarning = contract.silent_renewal 
            ? " Let op: dit contract heeft stille verlenging!" 
            : "";

          const { error: insertError } = await supabase
            .from("notifications")
            .insert({
              user_id: contract.user_id,
              contract_id: contract.id,
              type: "expiry_warning",
              title: notificationTitle,
              message: `Het contract "${contract.name}" met ${contract.supplier_name} verloopt op ${endDate.toLocaleDateString("nl-NL")}.${silentRenewalWarning} Onderneem actie vóór ${actionDeadline.toLocaleDateString("nl-NL")} om tijdig op te zeggen.`,
              priority: threshold.priority,
              due_date: actionDeadline.toISOString().split("T")[0],
              action_label: "Bekijk contract",
              action_url: `/dashboard/contracts?id=${contract.id}`,
            });

          if (insertError) {
            console.error(`Error creating notification for ${contract.name}:`, insertError);
          } else {
            console.log(`Created notification for ${contract.name} - ${threshold.label}`);
            notificationsCreated++;
          }
        }
      }
    }

    console.log(`Notification check complete. Created: ${notificationsCreated}, Skipped: ${notificationsSkipped}`);

    return new Response(
      JSON.stringify({
        success: true,
        contractsChecked: contracts?.length || 0,
        notificationsCreated,
        notificationsSkipped,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-contract-notifications:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
