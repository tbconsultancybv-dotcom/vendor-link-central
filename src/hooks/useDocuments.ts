import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createStorageBlobUrl } from "@/lib/storageFiles";

export interface Document {
  id: string;
  user_id: string;
  contract_id: string | null;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  source: string;
  ocr_processed: boolean;
  ocr_data: Record<string, unknown> | null;
  suggested_contract_id: string | null;
  is_linked: boolean;
  created_at: string;
  contract?: {
    id: string;
    name: string;
    supplier_name: string;
  };
}

export const useDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("documents")
        .select(`
          *,
          contract:contracts!documents_contract_id_fkey(id, name, supplier_name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user,
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ 
      file, 
      contractId 
    }: { 
      file: File; 
      contractId?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: document, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          contract_id: contractId || null,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          source: "upload",
          is_linked: !!contractId,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document geüpload",
        description: "Het document is succesvol geüpload.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Upload mislukt",
        description: error.message,
      });
    },
  });

  const linkToContract = useMutation({
    mutationFn: async ({ 
      documentId, 
      contractId 
    }: { 
      documentId: string; 
      contractId: string;
    }) => {
      const { error } = await supabase
        .from("documents")
        .update({
          contract_id: contractId,
          is_linked: true,
          suggested_contract_id: null,
        })
        .eq("id", documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document gekoppeld",
        description: "Het document is gekoppeld aan het contract.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Koppeling mislukt",
        description: error.message,
      });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (document: Document) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document verwijderd",
        description: "Het document is succesvol verwijderd.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Verwijderen mislukt",
        description: error.message,
      });
    },
  });

  const getDownloadUrl = async (filePath: string) => {
    return createStorageBlobUrl(filePath);
  };

  return {
    documents: documentsQuery.data || [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    uploadDocument,
    linkToContract,
    deleteDocument,
    getDownloadUrl,
  };
};
