import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SupplierLead = {
  id: string;
  status: string;
  credits_cost: number;
  created_at: string;
  claimed_at: string | null;
  customer_id: string;
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
    device_count: number | null;
    contact_email: string | null;
    contact_phone: string | null;
    responsible_name: string | null;
    notes: string | null;
    user_id: string | null;
    category?: { id: string; name: string; icon: string | null; color: string | null } | null;
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
  const [isSupplier, setIsSupplier] = useState(false);

  const fetchLeads = useCallback(async () => {
    if (!user) {
      setOpenLeads([]);
      setMyLeads([]);
      setIsSupplier(false);
      setLoading(false);
      return;
    }

    const [{ data: profile }, { data, error }] = await Promise.all([
      supabase
        .from("profiles")
        .select("is_supplier")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("marketplace_leads")
        .select(
          `id,status,credits_cost,created_at,claimed_at,customer_id,supplier_id,notes,
           contract:contracts(id,name,supplier_name,description,start_date,end_date,monthly_cost,yearly_cost,contract_value,data_visibility_level,max_suppliers,device_count,contact_email,contact_phone,responsible_name,notes,user_id,category:contract_categories(id,name,icon,color))`
        )
        .order("created_at", { ascending: false }),
    ]);

    const supplierMode = Boolean(profile?.is_supplier);
    setIsSupplier(supplierMode);

    if (!error && data) {
      const all = data as unknown as SupplierLead[];

      // Hydrate customer profile info (province etc.) for each lead.
      const customerIds = Array.from(new Set(all.map((l) => l.customer_id).filter(Boolean)));
      let customerMap: Record<string, SupplierLead["contract"]["customer"]> = {};
      if (customerIds.length > 0) {
        const { data: customers } = await supabase
          .from("profiles")
          .select("user_id,full_name,company_name,email,phone,sector,province")
          .in("user_id", customerIds);
        if (customers) {
          customerMap = Object.fromEntries(
            customers.map((c) => [
              c.user_id,
              {
                full_name: c.full_name,
                company_name: c.company_name,
                email: c.email,
                phone: c.phone,
                sector: c.sector,
                province: c.province,
              },
            ])
          );
        }
      }
      const hydrated = all.map((l) => ({
        ...l,
        contract: l.contract
          ? { ...l.contract, customer: customerMap[l.customer_id] ?? null }
          : l.contract,
      }));

      setOpenLeads(supplierMode ? hydrated.filter((l) => l.status === "open") : []);
      setMyLeads(hydrated.filter((l) => l.supplier_id === user.id));
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
      .select("credits,is_supplier")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.is_supplier) {
      return { error: new Error("Zet eerst leveranciersmodus aan in je bedrijfsprofiel om leads te claimen.") };
    }

    const balance = profile?.credits ?? 0;
    if (balance < credits) {
      return { error: new Error("Onvoldoende credits") };
    }

    const { data: claimedLead, error } = await supabase
      .from("marketplace_leads")
      .update({
        supplier_id: user.id,
        status: "claimed",
        claimed_at: new Date().toISOString(),
        supplier_credits_paid: credits,
      })
      .eq("id", leadId)
      .eq("status", "open")
      .select("id")
      .maybeSingle();

    if (error) return { error };
    if (!claimedLead) {
      return { error: new Error("Deze lead kon niet geclaimd worden. Mogelijk is hij al geclaimd of heb je geen toegang.") };
    }

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

  return { openLeads, myLeads, loading, isSupplier, claimLead, refresh: fetchLeads };
};
