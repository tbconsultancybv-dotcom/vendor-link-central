import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Contract } from "@/lib/contractUtils";

export function useContracts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contracts", user?.id],
    queryFn: async (): Promise<Contract[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user.id)
        .order("end_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Contract[];
    },
    enabled: !!user,
  });
}

export function useContract(id: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contract", id],
    queryFn: async (): Promise<Contract | null> => {
      if (!id || !user) return null;
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Contract | null;
    },
    enabled: !!id && !!user,
  });
}

export function useUpdateContract() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contract> }) => {
      const { error } = await supabase.from("contracts").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
      qc.invalidateQueries({ queryKey: ["contract", vars.id] });
    },
  });
}

export function useCreateContract() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (contract: Partial<Contract>) => {
      if (!user) throw new Error("Niet ingelogd");
      const { data, error } = await supabase
        .from("contracts")
        .insert({ ...contract, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
