import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDocuments, Document } from "@/hooks/useDocuments";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ExternalLink, Trash2, Loader2 } from "lucide-react";

interface ContractDocumentsProps {
  contractId: string;
  title?: string;
}

const formatSize = (bytes: number | null) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const ContractDocuments = ({ contractId, title = "Documenten" }: ContractDocumentsProps) => {
  const { uploadDocument, deleteDocument, getDownloadUrl } = useDocuments();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents", "contract", contractId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("contract_id", contractId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!contractId,
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      uploadDocument.mutate({ file, contractId });
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openDocument = async (doc: Document) => {
    try {
      setOpeningId(doc.id);
      const url = await getDownloadUrl(doc.file_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Kan document niet openen",
        description: (err as Error).message,
      });
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">
            Upload contracten, facturen of andere PDF's en bijlagen.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadDocument.isPending}
        >
          {uploadDocument.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Bestand toevoegen
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Documenten laden...</p>
      ) : docs.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-6 text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Nog geen documenten gekoppeld aan dit contract.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between p-3 bg-card hover:bg-muted/40 transition-colors"
            >
              <button
                type="button"
                onClick={() => openDocument(doc)}
                className="flex items-center gap-3 min-w-0 text-left flex-1"
              >
                <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {doc.file_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatSize(doc.file_size)} ·{" "}
                    {new Date(doc.created_at).toLocaleDateString("nl-BE")}
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => openDocument(doc)}
                  disabled={openingId === doc.id}
                  title="Openen"
                >
                  {openingId === doc.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteDocument.mutate(doc)}
                  title="Verwijderen"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ContractDocuments;
