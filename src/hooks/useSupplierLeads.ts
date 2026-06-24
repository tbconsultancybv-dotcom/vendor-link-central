import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SupplierLead = {
  id: string;
  status: string;
  credits_cost: number;
  created_at: string;
  claimed_at: string | null;
  supplier_id: string | null;
  notes: string | null;
  contract: {
    id: string;
    name: string;
    supplier_name: string | null;
    description: string | null;
    end_date: string | null;
    start_date: string | null;
    monthly_cost: number | null;
    yearly_cost: number | null;
    contract_value: number | null;
    data_visibility_level: number | null;
    max_suppliers: number | null;
    contact_email: string | null;
    contact_phone: string | null;
    responsible_name: string | null;
    notes: string | null;
    user_id: string | null;
    customer?: {
      full_name: string | null;
      company_name: string | null;
      email: string | null;
      phone: string | null;
      sector: string | null;
      province: string | null;
    } | null;
  } | null;
};

export const useSupplierLeads = () => {
  const { user } = useAuth();
  const [openLeads, setOpenLeads] = useState<SupplierLead[]>([]);
  const [myLeads, setMyLeads] = useState<SupplierLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("marketplace_leads")
      .select(
        `id,status,credits_cost,created_at,claimed_at,supplier_id,notes,
         contract:contracts(id,name,supplier_name,description,end_date,monthly_cost,yearly_cost,contract_value,data_visibility_level,max_suppliers)`
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      const all = data as unknown as SupplierLead[];
      setOpenLeads(all.filter((l) => l.status === "open"));
      setMyLeads(all.filter((l) => l.supplier_id === user.id));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("supplier-leads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "marketplace_leads" },
        () => fetchLeads()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchLeads]);

  const claimLead = async (leadId: string, credits: number) => {
    if (!user) return { error: new Error("Niet ingelogd") };

    // Check credit balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();

    const balance = profile?.credits ?? 0;
    if (balance < credits) {
      return { error: new Error("Onvoldoende credits") };
    }

    const { error } = await supabase
      .from("marketplace_leads")
      .update({
        supplier_id: user.id,
        status: "claimed",
        claimed_at: new Date().toISOString(),
        supplier_credits_paid: credits,
      })
      .eq("id", leadId)
      .eq("status", "open");

    if (error) return { error };

    const newBalance = balance - credits;
    await supabase
      .from("profiles")
      .update({ credits: newBalance })
      .eq("user_id", user.id);

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -credits,
      type: "lead_claim",
      description: "Lead geclaimd",
      lead_id: leadId,
      balance_after: newBalance,
    });

    await fetchLeads();
    return { error: null };
  };

  return { openLeads, myLeads, loading, claimLead, refresh: fetchLeads };
};
