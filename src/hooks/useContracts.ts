import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Contract {
  id: string;
  user_id: string;
  name: string;
  supplier_name: string;
  category_id: string | null;
  description: string | null;
  start_date: string;
  end_date: string;
  termination_period_days: number;
  silent_renewal: boolean;
  renewal_period_months: number;
  monthly_cost: number;
  yearly_cost: number;
  variable_costs: string | null;
  status: "active" | "expiring" | "expired" | "terminated" | "draft";
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  division: string | null;
  department: string | null;
  is_on_marketplace: boolean;
  marketplace_date: string | null;
  max_suppliers: number;
  data_visibility_level: number;
  device_count: number | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export interface ContractFormData {
  name: string;
  supplier_name: string;
  category_id?: string;
  description?: string;
  start_date: string;
  end_date: string;
  termination_period_days?: number;
  silent_renewal?: boolean;
  renewal_period_months?: number;
  monthly_cost?: number;
  yearly_cost?: number;
  variable_costs?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  division?: string;
  department?: string;
}

export const useContracts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const contractsQuery = useQuery({
    queryKey: ["contracts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("contracts")
        .select(`
          *,
          category:contract_categories(id, name, icon, color)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Contract[];
    },
    enabled: !!user,
  });

  const createContract = useMutation({
    mutationFn: async (data: ContractFormData) => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Niet ingelogd. Log opnieuw in en probeer het opnieuw.");

      const { data: newContract, error } = await supabase
        .from("contracts")
        .insert({
          ...data,
          user_id: currentUser.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "Contract aangemaakt",
        description: "Het contract is succesvol toegevoegd.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fout bij aanmaken",
        description: error.message,
      });
    },
  });

  const updateContract = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContractFormData> }) => {
      const { data: updated, error } = await supabase
        .from("contracts")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "Contract bijgewerkt",
        description: "De wijzigingen zijn opgeslagen.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fout bij bijwerken",
        description: error.message,
      });
    },
  });

  const deleteContract = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "Contract verwijderd",
        description: "Het contract is succesvol verwijderd.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fout bij verwijderen",
        description: error.message,
      });
    },
  });

  const publishToMarketplace = useMutation({
    mutationFn: async ({
      contractId,
      maxSuppliers,
      dataVisibilityLevel,
      deviceCount,
    }: {
      contractId: string;
      maxSuppliers: number;
      dataVisibilityLevel: number;
      deviceCount?: number | null;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Update contract
      const { error: contractError } = await supabase
        .from("contracts")
        .update({
          is_on_marketplace: true,
          marketplace_date: new Date().toISOString(),
          max_suppliers: maxSuppliers,
          data_visibility_level: dataVisibilityLevel,
          device_count: deviceCount ?? null,
        })
        .eq("id", contractId);

      if (contractError) throw contractError;

      // Calculate credit cost
      const { data: creditCost } = await supabase
        .rpc("calculate_lead_credits", {
          p_max_suppliers: maxSuppliers,
          p_data_visibility: dataVisibilityLevel,
        });

      // Create leads for each supplier slot
      for (let i = 0; i < maxSuppliers; i++) {
        const { error: leadError } = await supabase
          .from("marketplace_leads")
          .insert({
            contract_id: contractId,
            customer_id: user.id,
            credits_cost: creditCost || 5,
            customer_credits_paid: Math.ceil((creditCost || 5) / maxSuppliers),
          });

        if (leadError) throw leadError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({
        title: "Contract gepubliceerd",
        description: "Je contract is nu zichtbaar voor leveranciers op de marktplaats.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Publicatie mislukt",
        description: error.message,
      });
    },
  });

  return {
    contracts: contractsQuery.data || [],
    isLoading: contractsQuery.isLoading,
    error: contractsQuery.error,
    createContract,
    updateContract,
    deleteContract,
    publishToMarketplace,
  };
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};
