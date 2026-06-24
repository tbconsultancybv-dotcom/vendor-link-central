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

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_supplier")
      .eq("user_id", user.id)
      .maybeSingle();

    const supplierMode = Boolean(profile?.is_supplier);
    setIsSupplier(supplierMode);

    if (!supplierMode) {
      setOpenLeads([]);
      setMyLeads([]);
      setLoading(false);
      return;
    }

    // Anonymized marketplace listings (secure RPC).
    const [{ data: listings }, { data: claimed }] = await Promise.all([
      supabase.rpc("list_marketplace_listings"),
      supabase.rpc("get_my_claimed_leads"),
    ]);

    const open: SupplierLead[] = (listings ?? [])
      .filter((row: any) => row.status === "open")
      .map((row: any) => ({
        id: row.lead_id,
        status: row.status,
        credits_cost: row.credits_cost,
        created_at: row.created_at,
        claimed_at: row.claimed_at,
        customer_id: "",
        supplier_id: row.supplier_id,
        notes: null,
        contract: {
          id: row.contract_id,
          // Anonymized: only sector / province / category / end date / device count visible.
          name: row.category_name ?? "Lead",
          supplier_name: null,
          description: null,
          start_date: null,
          end_date: row.end_date,
          monthly_cost: null,
          yearly_cost: null,
          contract_value: null,
          data_visibility_level: row.data_visibility_level,
          max_suppliers: null,
          device_count: row.device_count,
          contact_email: null,
          contact_phone: null,
          responsible_name: null,
          notes: null,
          user_id: null,
          category: row.category_id
            ? {
                id: row.category_id,
                name: row.category_name,
                icon: row.category_icon,
                color: row.category_color,
              }
            : null,
          customer: {
            full_name: null,
            company_name: null,
            email: null,
            phone: null,
            sector: row.sector,
            province: row.province,
          },
        },
      }));

    const mine: SupplierLead[] = (claimed ?? []).map((row: any) => ({
      id: row.lead_id,
      status: row.status,
      credits_cost: row.credits_cost,
      created_at: row.created_at,
      claimed_at: row.claimed_at,
      customer_id: row.customer_id,
      supplier_id: user.id,
      notes: row.notes,
      contract: {
        id: row.contract_id,
        name: row.contract_name,
        supplier_name: row.supplier_name,
        description: row.description,
        start_date: row.start_date,
        end_date: row.end_date,
        monthly_cost: row.monthly_cost,
        yearly_cost: row.yearly_cost,
        contract_value: row.contract_value,
        data_visibility_level: row.data_visibility_level,
        max_suppliers: row.max_suppliers,
        device_count: row.device_count,
        contact_email: row.contact_email,
        contact_phone: row.contact_phone,
        responsible_name: row.responsible_name,
        notes: row.contract_notes,
        user_id: row.customer_id,
        category: row.category_id
          ? {
              id: row.category_id,
              name: row.category_name,
              icon: row.category_icon,
              color: row.category_color,
            }
          : null,
        customer: {
          full_name: row.customer_full_name,
          company_name: row.customer_company_name,
          email: row.customer_email,
          phone: row.customer_phone,
          sector: row.customer_sector,
          province: row.customer_province,
        },
      },
    }));

    setOpenLeads(open);
    setMyLeads(mine);
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
